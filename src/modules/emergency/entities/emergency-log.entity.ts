import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('emergency_log')
export class EmergencyLog {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ name: 'elderly_id', type: 'bigint' })
    elderlyId: number;

    // Use ManyToOne to fetch user details easily
    @ManyToOne(() => User)
    @JoinColumn({ name: 'elderly_id' })
    elderly: User;

    @Column({ type: 'varchar', length: 200, comment: '位置信息（高德地图API获取）' })
    location: string;

    @Column({ type: 'varchar', length: 200, nullable: true, comment: '求助备注' })
    remark: string;

    @Column({ type: 'tinyint', default: 0, comment: '状态：0-待处理 1-处理中 2-已处理' })
    status: number;

    @Column({ name: 'handler_id', type: 'bigint', nullable: true, comment: '处理人user_id（家属/管理员）' })
    handlerId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'handler_id' })
    handler: User;

    @Column({ name: 'handle_time', type: 'datetime', nullable: true, comment: '处理开始时间' })
    handleTime: Date;

    @Column({ name: 'finish_time', type: 'datetime', nullable: true, comment: '处理完成时间' })
    finishTime: Date;

    @Column({ name: 'handle_result', type: 'varchar', length: 200, nullable: true, comment: '处理结果描述' })
    handleResult: string;

    @CreateDateColumn({ name: 'created_at', type: 'datetime', comment: '创建时间' })
    createdAt: Date;
}
