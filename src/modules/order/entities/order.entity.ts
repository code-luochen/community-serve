import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('order')
export class Order {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  @ApiProperty({ description: '主键 ID', type: String })
  id: string;

  @Column({ name: 'order_no', type: 'varchar', length: 32, unique: true })
  @ApiProperty({ description: '订单编号（唯一，格式：SN2026020710300001）' })
  orderNo: string;

  @Column({ name: 'elderly_id', type: 'bigint' })
  @ApiProperty({ description: '老年人 user_id', type: String })
  elderlyId: string;

  @Column({ name: 'merchant_id', type: 'bigint' })
  @ApiProperty({ description: '商家 user_id', type: String })
  merchantId: string;

  @Column({ name: 'service_id', type: 'bigint' })
  @ApiProperty({ description: '服务 ID', type: String })
  serviceId: string;

  @Column({ name: 'service_snapshot', type: 'json' })
  @ApiProperty({ description: '服务快照（名称/价格，防服务变更影响历史订单）' })
  serviceSnapshot: Record<string, any>;

  @Column({ name: 'service_time', type: 'datetime' })
  @ApiProperty({ description: '预约服务时间' })
  serviceTime: Date;

  @Column({ type: 'varchar', length: 200 })
  @ApiProperty({ description: '服务地址' })
  address: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  @ApiProperty({ description: '备注', required: false })
  remark: string | null;

  @Column({ type: 'tinyint', default: 0 })
  @ApiProperty({
    description: '状态：0-待接单 1-已接单 2-配送中 3-待评价 4-已完成 5-已取消',
    default: 0,
  })
  status: number;

  @Column({ type: 'tinyint', nullable: true })
  @ApiProperty({ description: '评价星级（1-5）', required: false })
  evaluation: number | null;

  @Column({
    name: 'evaluation_content',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  @ApiProperty({ description: '评价内容', required: false })
  evaluationContent: string | null;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}
