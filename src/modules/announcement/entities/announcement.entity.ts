import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Community } from '../../community/entities/community.entity';
import { User } from '../../users/entities/user.entity';

@Entity('announcement')
export class Announcement extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Primary Key' })
  id: number;

  @Column({ length: 150 })
  @ApiProperty({ description: 'Announcement title' })
  title: string;

  @Column({ type: 'text' })
  @ApiProperty({ description: 'Announcement content' })
  content: string;

  @Column({ name: 'community_id', nullable: true })
  @ApiProperty({ description: 'Community ID (null means global)' })
  communityId: number | null;

  @ManyToOne(() => Community)
  @JoinColumn({ name: 'community_id' })
  community: Community;

  @Column({ name: 'created_by' })
  @ApiProperty({ description: 'ID of the admin who created the announcement' })
  createdBy: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'Update timestamp' })
  updatedAt: Date;
}
