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

  // BE-09: 订单创建
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const orderNo = this.generateOrderNo();
    const order = this.orderRepository.create({
      ...createOrderDto,
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
    if (order.status === 3 || order.status === 4) {
      throw new BadRequestException(
        'Order is already completed or canceled, cannot change status',
      );
    }

    this.orderRepository.merge(order, { status: updateDto.status });
    return await this.orderRepository.save(order);
  }

  // BE-12: 订单评价
  async evaluate(id: string, evaluateDto: EvaluateOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    if (order.status !== 3) {
      throw new BadRequestException(
        'Only completed orders (status = 3) can be evaluated',
      );
    }
    if (order.evaluation) {
      throw new BadRequestException('Order has already been evaluated');
    }

    this.orderRepository.merge(order, {
      evaluation: evaluateDto.evaluation,
      evaluationContent: evaluateDto.evaluationContent,
    });

    return await this.orderRepository.save(order);
  }
}
