import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('family_binding')
export class FamilyBinding {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'family_id', type: 'bigint' })
  familyId: number;

  @Column({ name: 'elderly_id', type: 'bigint' })
  elderlyId: number;

  @Column({ length: 50, nullable: true, comment: '关系称呼，比如：父亲、母亲' })
  relation: string;

  @Column({
    type: 'tinyint',
    default: 1,
    comment: '状态：0-待审核 1-绑定成功 2-已解绑',
  })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // 关联属性
  @ManyToOne(() => User)
  @JoinColumn({ name: 'family_id' })
  family: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'elderly_id' })
  elderly: User;
}
