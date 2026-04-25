import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Service } from './entities/service.entity';
import { Order } from '../order/entities/order.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceQueryDto } from './dto/service-query.dto';
import { UsersService } from '../users/users.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly servicesRepository: Repository<Service>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly usersService: UsersService,
    private readonly notificationService: NotificationService,
  ) {}

  private async notifyAdmins(title: string, content: string, relatedId?: number) {
    const admins = await this.usersService.getAdmins();
    for (const admin of admins) {
      await this.notificationService.create({
        userId: admin.id,
        type: 'service',
        title,
        content,
        relatedId,
      });
    }
  }

  async create(
    merchantId: number,
    createServiceDto: CreateServiceDto,
  ): Promise<Service> {
    const service: Service = this.servicesRepository.create({
      ...createServiceDto,
      merchantId: Number(merchantId),
      merchant: { id: Number(merchantId) } as any,
      status: 0,
      auditStatus: 0,
    });
    const savedService = await this.servicesRepository.save(service);
    
    // Notify admins for new service approval
    await this.notifyAdmins(
      '新服务待审核',
      `商家已发布新服务【${savedService.name}】，请及时审核。`,
      savedService.id,
    );
    
    return savedService;
  }

  async findAll(
    query: ServiceQueryDto,
    customFilters: FindOptionsWhere<Service> = {},
  ): Promise<{ total: number; items: Service[] }> {
    const { page = 1, limit = 10, name, type, status, auditStatus, communityId } = query;
    const skip: number = (page - 1) * limit;

    const queryBuilder = this.servicesRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.merchant', 'merchant')
      .leftJoinAndSelect('merchant.house', 'house')
      .leftJoinAndSelect('merchant.community', 'community');

    if (name) {
      queryBuilder.andWhere('service.name LIKE :name', { name: `%${name}%` });
    }
    if (type) {
      queryBuilder.andWhere('service.type = :type', { type });
    }
    if (status !== undefined) {
      queryBuilder.andWhere('service.status = :status', { status });
    }
    if (auditStatus !== undefined) {
      queryBuilder.andWhere('service.auditStatus = :auditStatus', { auditStatus });
    }
    if (communityId !== undefined) {
      queryBuilder.andWhere('merchant.communityId = :communityId', { communityId });
    }

    // Apply custom filters (if any)
    if (customFilters.merchantId) {
      queryBuilder.andWhere('service.merchantId = :merchantId', { merchantId: customFilters.merchantId });
    }
    if (customFilters.status !== undefined) {
      queryBuilder.andWhere('service.status = :cStatus', { cStatus: customFilters.status });
    }
    if (customFilters.auditStatus !== undefined) {
      queryBuilder.andWhere('service.auditStatus = :cAuditStatus', { cAuditStatus: customFilters.auditStatus });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('service.createdAt', 'DESC')
      .getManyAndCount();

    return { total, items };
  }

  async findOne(id: number): Promise<Service> {
    const service: Service | null = await this.servicesRepository.findOne({
      where: { id },
      relations: ['merchant'],
    });
    if (!service) {
      throw new NotFoundException(`服务 #${id} 不存在`);
    }
    return service;
  }

  async update(
    id: number,
    merchantId: number,
    updateDto: UpdateServiceDto,
  ): Promise<Service> {
    const service: Service = await this.findOne(id);
    if (Number(service.merchantId) !== Number(merchantId)) {
      throw new ForbiddenException('只能修改自己的服务');
    }

    // 如果修改了内容，需要重新审核
    const needReAudit: boolean = Object.keys(updateDto).length > 0;

    Object.assign(service, updateDto);
    if (needReAudit) {
      service.auditStatus = 0; // 修改后重新待审核
      service.status = 0; // 强制下架
    }

    const savedService = await this.servicesRepository.save(service);
    
    if (needReAudit) {
      // Notify admins if changes require re-audit
      await this.notifyAdmins(
        '服务修改待审核',
        `商家已修改服务【${savedService.name}】，内容变更已同步，请重新审核。`,
        savedService.id,
      );
    }
    
    return savedService;
  }

  async updateStatus(
    id: number,
    merchantId: number,
    status: number,
  ): Promise<Service> {
    const service: Service = await this.findOne(id);
    if (Number(service.merchantId) !== Number(merchantId)) {
      throw new ForbiddenException('只能修改自己的服务');
    }

    if (status === 1 && service.auditStatus !== 1) {
      throw new BadRequestException('该服务尚未通过审核，无法上架');
    }

    service.status = status;
    return await this.servicesRepository.save(service);
  }

  async audit(id: number, auditStatus: number): Promise<Service> {
    const service: Service = await this.findOne(id);
    service.auditStatus = auditStatus;
    if (auditStatus === 2) {
      // 拒绝审核则自动下架
      service.status = 0;
    }
    const savedService = await this.servicesRepository.save(service);

    // Notify merchant about audit result
    const statusText = auditStatus === 1 ? '已通过' : '已拒绝';
    await this.notificationService.create({
      userId: Number(savedService.merchantId),
      type: 'service',
      title: `服务审核${statusText}`,
      content: `您的服务【${savedService.name}】审核${statusText}。${auditStatus === 1 ? '您现在可以手动上架该服务。' : '如需继续发布，请修改后重新提交。'}`,
      relatedId: savedService.id,
    });

    return savedService;
  }

  async remove(id: number, merchantId: number): Promise<void> {
    const service = await this.findOne(id);
    if (Number(service.merchantId) !== Number(merchantId)) {
      throw new ForbiddenException('只能删除自己的服务');
    }
    // 检查是否有订单引用
    const orderCount = await this.orderRepository.count({
      where: { serviceId: id.toString() },
    });
    if (orderCount > 0) {
      throw new BadRequestException(`该服务已被 ${orderCount} 个订单引用，无法删除`);
    }
    await this.servicesRepository.softDelete(id);
  }

  async findAllDeleted(merchantId: number, query: ServiceQueryDto): Promise<{ total: number; items: Service[] }> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.servicesRepository
      .createQueryBuilder('service')
      .withDeleted()
      .where('service.merchantId = :merchantId', { merchantId })
      .andWhere('service.deletedAt IS NOT NULL');

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('service.deletedAt', 'DESC')
      .getManyAndCount();

    return { total, items };
  }

  async restore(id: number, merchantId: number): Promise<Service> {
    const service = await this.findOneByIdWithDeleted(id);
    if (!service) {
      throw new NotFoundException(`服务 #${id} 不存在`);
    }
    if (Number(service.merchantId) !== Number(merchantId)) {
      throw new ForbiddenException('只能恢复自己的服务');
    }
    await this.servicesRepository.restore(id);
    return this.findOne(id);
  }

  async permanentDelete(id: number, merchantId: number): Promise<void> {
    const service = await this.findOneByIdWithDeleted(id);
    if (!service) {
      throw new NotFoundException(`服务 #${id} 不存在`);
    }
    if (Number(service.merchantId) !== Number(merchantId)) {
      throw new ForbiddenException('只能删除自己的服务');
    }
    await this.servicesRepository.delete(id);
  }

  private async findOneByIdWithDeleted(id: number): Promise<Service | null> {
    return this.servicesRepository.findOne({
      where: { id },
      withDeleted: true,
    });
  }
}
