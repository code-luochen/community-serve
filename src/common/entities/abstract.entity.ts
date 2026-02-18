import {
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    BaseEntity
} from 'typeorm';

export abstract class AbstractEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at', comment: 'Create Time' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', comment: 'Update Time' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true, comment: 'Delete Time' })
    deletedAt: Date;
}
