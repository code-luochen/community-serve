import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('service')
export class Service {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'merchant_id', type: 'bigint' })
  merchantId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'merchant_id' })
  merchant: User;

  @Column({ type: 'varchar', length: 100, comment: '服务名称' })
  name: string;

  @Column({
    type: 'tinyint',
    comment: '类型：1-生活服务 2-药品服务 3-医护服务',
  })
  type: number;

  @Column({ type: 'text', comment: '服务描述' })
  description: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, comment: '价格' })
  price: number;

  @Column({
    name: 'image_url',
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: '服务图片URL',
  })
  imageUrl: string;

  @Column({ type: 'tinyint', default: 0, comment: '状态：0-下架 1-上架' })
  status: number;

  @Column({
    name: 'audit_status',
    type: 'tinyint',
    default: 0,
    comment: '审核状态：0-待审核 1-通过 2-拒绝',
  })
  auditStatus: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
