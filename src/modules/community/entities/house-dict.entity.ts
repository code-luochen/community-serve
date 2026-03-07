import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Community } from './community.entity';

@Entity('house_dict')
export class HouseDict {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  @ApiProperty({ description: '主键 ID', type: Number })
  id: number;

  @Column({ name: 'community_id', type: 'bigint', comment: '关联小区ID' })
  @ApiProperty({ description: '关联小区ID', type: Number })
  communityId: number;

  @Column({ name: 'building_no', type: 'varchar', length: 50, comment: '楼栋号' })
  @ApiProperty({ description: '楼栋号（如：A栋 / 3号楼）' })
  buildingNo: string;

  @Column({
    name: 'unit_no',
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '单元号',
  })
  @ApiProperty({ description: '单元号（如：1单元）', required: false })
  unitNo: string;

  @Column({ name: 'room_no', type: 'varchar', length: 50, comment: '门牌号' })
  @ApiProperty({ description: '门牌号（如：402）' })
  roomNo: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Community, (community) => community.houses)
  @JoinColumn({ name: 'community_id' })
  community: Community;
}
