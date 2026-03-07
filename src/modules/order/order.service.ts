import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { EvaluateOrderDto } from './dto/evaluate-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { NotificationService } from '../notification/notification.service';
import { UsersService } from '../users/users.service';
import { CommunityService } from '../community/community.service';
import { ElderlyProfile } from '../elderly-profile/entities/elderly-profile.entity';

export interface OrderListResult {
  items: Order[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(ElderlyProfile)
    private readonly elderlyProfileRepo: Repository<ElderlyProfile>,
    private readonly notificationService: NotificationService,
    private readonly usersService: UsersService,
    private readonly communityService: CommunityService,
  ) {}

  /**
   * 生成业务订单号：SN + yyyyMMddHHmmssSSS + 3位随机数
   */
  private generateOrderNo(): string {
    const now = new Date();
    const timestamp =
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0') +
      now.getMilliseconds().toString().padStart(3, '0');
    const randomBits = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `SN${timestamp}${randomBits}`;
  }

  // BE-09 + BE-21: 订单创建，自动读取老人档案地址生成快照
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const orderNo = this.generateOrderNo();

    // BE-21: 自动读取老人 house_id，生成地址快照
    let houseSnapshot = '地址未设置';

    const elderlyIdNum = parseInt(createOrderDto.elderlyId, 10);
    const profile = await this.elderlyProfileRepo.findOneBy({
      userId: elderlyIdNum,
    });

    // 优先使用请求中传入的 houseId（临时修改），否则用档案中绑定的
    const resolvedHouseId = createOrderDto.houseId ?? profile?.houseId ?? null;

    if (resolvedHouseId) {
      try {
        houseSnapshot = await this.communityService.getHouseSnapshot(
          resolvedHouseId,
        );
      } catch {
        // house not found, keep default
        houseSnapshot = `房屋#${resolvedHouseId}（地址信息异常）`;
      }
    }

    const order = this.orderRepository.create({
      ...createOrderDto,
      houseSnapshot,
      orderNo,
      status: 0, // 初始化状态：0-待接单
    });
    return await this.orderRepository.save(order);
  }

  // BE-11: 订单查询 (多角色/条件合并)
  async findAll(query: QueryOrderDto): Promise<OrderListResult> {
    const { elderlyId, merchantId, status, page = 1, limit = 10 } = query;
    const queryBuilder = this.orderRepository.createQueryBuilder('order');

    if (elderlyId) {
      queryBuilder.andWhere('order.elderlyId = :elderlyId', { elderlyId });
    }
    if (merchantId) {
      queryBuilder.andWhere('order.merchantId = :merchantId', { merchantId });
    }
    if (status !== undefined) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    queryBuilder.orderBy('order.createdAt', 'DESC');
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  // BE-10: 订单状态流转
  async updateStatus(
    id: string,
    updateDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.findOne(id);

    // 基础流转拦截（可选更严格的流转校验）
    if (order.status === 4 || order.status === 5) {
      throw new BadRequestException(
        'Order is already completed or canceled, cannot change status',
      );
    }

    this.orderRepository.merge(order, { status: updateDto.status });
    const savedOrder = await this.orderRepository.save(order);

    const statusMap: Record<number, string> = {
      1: '已接单',
      2: '配送中',
      3: '已完成',
      4: '已取消',
    };

    if (
      updateDto.status === 1 ||
      updateDto.status === 2 ||
      updateDto.status === 3
    ) {
      const statusText = statusMap[updateDto.status];
      const title = `订单状态更新：${statusText}`;
      const content = `您的订单（${order.orderNo}）服务状态已更新为：${statusText}`;

      // Notify elderly
      await this.notificationService.create({
        userId: parseInt(order.elderlyId, 10),
        type: 'order',
        title,
        content,
        relatedId: parseInt(order.id, 10),
      });

      // Notify family
      const familyMembers = await this.usersService.getFamilyMembersByElderlyId(
        parseInt(order.elderlyId, 10),
      );
      for (const family of familyMembers) {
        await this.notificationService.create({
          userId: family.id,
          type: 'order',
          title,
          content,
          relatedId: parseInt(order.id, 10),
        });
      }
    }

    return savedOrder;
  }

  // BE-12: 订单评价
  async evaluate(id: string, evaluateDto: EvaluateOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    if (order.status !== 3) {
      throw new BadRequestException(
        'Only orders pending evaluation (status = 3) can be evaluated',
      );
    }
    if (order.evaluation) {
      throw new BadRequestException('Order has already been evaluated');
    }

    this.orderRepository.merge(order, {
      evaluation: evaluateDto.evaluation,
      evaluationContent: evaluateDto.evaluationContent,
      status: 4, // 评价完成后状态流转为已完成
    });

    return await this.orderRepository.save(order);
  }
}
