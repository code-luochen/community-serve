import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { EvaluateOrderDto } from './dto/evaluate-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { Order } from './entities/order.entity';

@ApiTags('订单管理 (Order)')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'BE-09 创建订单' })
  create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'BE-11 获取订单列表（支持按老年人/商家/状态查询）' })
  findAll(@Query() query: QueryOrderDto) {
    return this.orderService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'BE-11 获取单个订单详情' })
  findOne(@Param('id') id: string): Promise<Order> {
    return this.orderService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'BE-10 更新订单状态 (流转)' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return this.orderService.updateStatus(id, updateOrderStatusDto);
  }

  @Patch(':id/evaluate')
  @ApiOperation({ summary: 'BE-12 订单评价' })
  evaluate(
    @Param('id') id: string,
    @Body() evaluateOrderDto: EvaluateOrderDto,
  ): Promise<Order> {
    return this.orderService.evaluate(id, evaluateOrderDto);
  }
}
