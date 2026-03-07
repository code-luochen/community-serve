import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('notification')
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Primary Key' })
  id: number;

  @Column({ name: 'user_id' })
  @ApiProperty({ description: 'User ID of the receiver' })
  userId: number;

  @Column({ length: 50 })
  @ApiProperty({ description: 'Notification type: order, health, emergency' })
  type: string;

  @Column({ length: 100 })
  @ApiProperty({ description: 'Notification title' })
  title: string;

  @Column({ type: 'text' })
  @ApiProperty({ description: 'Notification content' })
  content: string;

  @Column({ name: 'related_id', nullable: true })
  @ApiProperty({ description: 'Related business ID (optional)' })
  relatedId: number;

  @Column({ name: 'elderly_id', nullable: true })
  @ApiProperty({ description: 'Related elderly user ID (optional, for filtering)' })
  elderlyId: number;

  @Column({ name: 'is_read', default: false })
  @ApiProperty({ description: 'Read status: 0-unread, 1-read' })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;
}
