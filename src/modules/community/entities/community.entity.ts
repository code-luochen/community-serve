import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import type { HouseDict } from './house-dict.entity';

@Entity('community')
export class Community {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  @ApiProperty({ description: '主键 ID', type: Number })
  id: number;

  @Column({ type: 'varchar', length: 100, comment: '小区名称' })
  @ApiProperty({ description: '小区名称（如：阳光花园）' })
  name: string;

  @Column({ type: 'varchar', length: 200, comment: '小区详细物理地址' })
  @ApiProperty({ description: '小区详细物理地址' })
  address: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany('HouseDict', (house: HouseDict) => house.community)
  houses: HouseDict[];
}
