import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('health_record')
export class HealthRecord {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'elderly_id', type: 'bigint' })
  elderlyId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'elderly_id' })
  elderly: User;

  @Column({
    name: 'systolic_bp',
    type: 'int',
    nullable: true,
    comment: '收缩压（mmHg）',
  })
  systolicBp: number;

  @Column({
    name: 'diastolic_bp',
    type: 'int',
    nullable: true,
    comment: '舒张压（mmHg）',
  })
  diastolicBp: number;

  @Column({
    name: 'heart_rate',
    type: 'int',
    nullable: true,
    comment: '心率（次/分）',
  })
  heartRate: number;

  @Column({
    name: 'blood_sugar',
    type: 'decimal',
    precision: 4,
    scale: 1,
    nullable: true,
    comment: '血糖（mmol/L）',
  })
  bloodSugar: number;

  @Column({
    type: 'decimal',
    precision: 4,
    scale: 1,
    nullable: true,
    comment: '体温（℃）',
  })
  temperature: number;

  @Index('idx_abnormal')
  @Column({
    name: 'is_abnormal',
    type: 'tinyint',
    default: 0,
    comment: '是否异常：0-正常 1-异常',
  })
  isAbnormal: number;

  @Column({
    name: 'abnormal_type',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '异常类型：hypertension/hypotension/tachycardia/bradycardia',
  })
  abnormalType: string;

  @Index('idx_time')
  @CreateDateColumn({ name: 'record_time', comment: '记录时间' })
  recordTime: Date;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;
}
