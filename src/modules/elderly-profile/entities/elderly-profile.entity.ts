import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('elderly_profile')
export class ElderlyProfile {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint', unique: true })
  userId: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', nullable: true, comment: '年龄' })
  age: number;

  @Column({ type: 'tinyint', nullable: true, comment: '性别：1-男 2-女' })
  gender: number;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '详细住址' })
  address: string;

  @Column({
    name: 'emergency_contact',
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '紧急联系人姓名',
  })
  emergencyContact: string;

  @Column({
    name: 'emergency_phone',
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '紧急联系电话',
  })
  emergencyPhone: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
