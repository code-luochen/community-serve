import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ElderlyProfile } from '../../elderly-profile/entities/elderly-profile.entity';
import { Community } from '../../community/entities/community.entity';
import { HouseDict } from '../../community/entities/house-dict.entity';
import { FamilyBinding } from '../../family-binding/entities/family-binding.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ unique: true, length: 32 })
  username: string;

  @Column({ select: false }) // Hide password by default
  password: string;

  @Column({ length: 50, comment: '用户昵称' })
  nickname: string;

  @Column({
    name: 'real_name',
    length: 50,
    nullable: true,
    comment: '真实姓名',
  })
  realName: string;

  @Column({ type: 'tinyint', comment: '角色：1-老人 2-家属 3-商家 4-管理员' })
  role: number;

  @Column({
    type: 'tinyint',
    default: 1,
    comment: '状态：0-未激活 1-正常 2-禁用',
  })
  status: number;

  @Column({
    name: 'last_login_at',
    type: 'datetime',
    nullable: true,
    comment: '最后登录时间',
  })
  lastLoginAt: Date;

  @Column({
    length: 20,
    nullable: true,
    comment: '联系电话',
  })
  phone: string;

  @Column({
    nullable: true,
    comment: '头像URL',
  })
  avatar: string;

  @Column({
    name: 'community_id',
    type: 'bigint',
    nullable: true,
    comment: '所属小区ID（用于数据隔离）',
  })
  communityId: number | null;

  @Column({
    name: 'house_id',
    type: 'bigint',
    nullable: true,
    comment: '关联 house_dict.id，精确位置',
  })
  houseId: number | null;

  @ManyToOne(() => Community, { nullable: true })
  @JoinColumn({ name: 'community_id' })
  community: Community;

  @ManyToOne(() => HouseDict, { nullable: true })
  @JoinColumn({ name: 'house_id' })
  house: HouseDict;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToOne(() => ElderlyProfile, (profile) => profile.user)
  profile: ElderlyProfile;

  @OneToMany(() => FamilyBinding, (binding) => binding.family)
  familyBindings: FamilyBinding[];

  @OneToMany(() => FamilyBinding, (binding) => binding.elderly)
  elderlyBindings: FamilyBinding[];
}
