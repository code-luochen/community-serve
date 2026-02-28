import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { ElderlyProfile } from '../../elderly-profile/entities/elderly-profile.entity';

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
    nullable: true,
    comment: '头像URL',
  })
  avatar: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => ElderlyProfile, profile => profile.user)
  profile: ElderlyProfile;
}
