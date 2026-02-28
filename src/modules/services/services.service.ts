import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceQueryDto } from './dto/service-query.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly servicesRepository: Repository<Service>,
  ) {}

  async create(
    merchantId: number,
    createServiceDto: CreateServiceDto,
  ): Promise<Service> {
    const service: Service = this.servicesRepository.create({
      ...createServiceDto,
      merchantId,
      status: 0,
      auditStatus: 0,
    });
    return await this.servicesRepository.save(service);
  }

  async findAll(
    query: ServiceQueryDto,
    customFilters: FindOptionsWhere<Service> = {},
  ): Promise<{ total: number; items: Service[] }> {
    const { page = 1, limit = 10, name, type } = query;
    const skip: number = (page - 1) * limit;

    const where: FindOptionsWhere<Service> = { ...customFilters };
    if (name) {
      where.name = Like(`%${name}%`);
    }
    if (type) {
      where.type = type;
    }

    const [items, total] = await this.servicesRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['merchant'],
    });

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

    return await this.servicesRepository.save(service);
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
    return await this.servicesRepository.save(service);
  }
}
