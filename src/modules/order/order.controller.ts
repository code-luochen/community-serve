import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Query,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { EvaluateOrderDto } from './dto/evaluate-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { Order } from './entities/order.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../auth/dto/login.dto';

@ApiTags('订单管理 (Order)')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

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

  @Get('deleted')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MERCHANT)
  @ApiOperation({ summary: '获取商家已删除的订单列表' })
  findDeleted(@Query() query: QueryOrderDto) {
    return this.orderService.findDeleted(query);
  }

  @Get('admin/deleted')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '管理员获取所有已删除的订单列表' })
  findAllDeleted(@Query() query: QueryOrderDto) {
    return this.orderService.findAllDeleted(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'BE-11 获取单个订单详情' })
  findOne(@Param('id') id: string): Promise<Order> {
    return this.orderService.findOne(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'BE-10 更新订单状态 (流转)' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return this.orderService.updateStatus(id, updateOrderStatusDto);
  }


  @Patch(':id/status')
  @ApiOperation({ summary: 'BE-10 更新订单状态 (流转)' })
  updateStatusPatch(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return this.orderService.updateStatus(id, updateOrderStatusDto);
  }

  @Put(':id/evaluate')
  @ApiOperation({ summary: 'BE-12 订单评价' })
  evaluate(
    @Param('id') id: string,
    @Body() evaluateOrderDto: EvaluateOrderDto,
  ): Promise<Order> {
    return this.orderService.evaluate(id, evaluateOrderDto);
  }


  @Patch(':id/evaluate')
  @ApiOperation({ summary: 'BE-12 订单评价' })
  evaluatePatch(
    @Param('id') id: string,
    @Body() evaluateOrderDto: EvaluateOrderDto,
  ): Promise<Order> {
    return this.orderService.evaluate(id, evaluateOrderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除订单' })
  remove(@Param('id') id: string): Promise<void> {
    return this.orderService.remove(id);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MERCHANT)
  @ApiOperation({ summary: '恢复已删除的订单' })
  restore(@Param('id') id: string, @CurrentUser() user: { id: number }) {
    return this.orderService.restore(id, user.id);
  }

  @Delete(':id/permanent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MERCHANT)
  @ApiOperation({ summary: '永久删除订单' })
  permanentDelete(@Param('id') id: string, @CurrentUser() user: { id: number }) {
    return this.orderService.permanentDelete(id, user.id);
  }
}
