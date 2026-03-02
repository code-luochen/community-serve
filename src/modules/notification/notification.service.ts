// Trigger TS Server refresh
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
    ) { }

    async create(createDto: CreateNotificationDto): Promise<Notification> {
        const notification = this.notificationRepository.create(createDto);
        return this.notificationRepository.save(notification);
    }

    async findAll(userId: number, page: number = 1, limit: number = 10) {
        const [data, total] = await this.notificationRepository.findAndCount({
            where: { userId },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        const unreadCount = await this.notificationRepository.countBy({
            userId,
            isRead: false,
        });

        return {
            data,
            total,
            page,
            limit,
            unreadCount,
        };
    }

    async findUnreadCount(userId: number) {
        return this.notificationRepository.countBy({
            userId,
            isRead: false,
        });
    }

    async markAsRead(id: number, userId: number): Promise<Notification> {
        const notification = await this.notificationRepository.findOneBy({ id, userId });

        if (!notification) {
            throw new NotFoundException(`Notification #${id} not found`);
        }

        notification.isRead = true;
        return this.notificationRepository.save(notification);
    }

    async markAllAsRead(userId: number): Promise<void> {
        await this.notificationRepository.update(
            { userId, isRead: false },
            { isRead: true }
        );
    }
}
