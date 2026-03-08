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
  ) {}

  async create(createDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(createDto);
    return this.notificationRepository.save(notification);
  }

  async findAll(
    userId: number,
    page: number = 1,
    limit: number = 10,
    isRead?: number,
    elderlyId?: number,
    type?: string,
    communityId?: number,
  ) {
    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.elderly', 'elderly')
      .where('notification.userId = :userId', { userId });

    if (isRead !== undefined && !Number.isNaN(isRead)) {
      queryBuilder.andWhere('notification.isRead = :isRead', {
        isRead: isRead === 1,
      });
    }

    if (elderlyId !== undefined && !Number.isNaN(elderlyId)) {
      queryBuilder.andWhere('notification.elderlyId = :elderlyId', {
        elderlyId,
      });
    }

    if (communityId !== undefined && !Number.isNaN(communityId)) {
      queryBuilder.andWhere('elderly.communityId = :communityId', {
        communityId,
      });
    }

    if (type) {
      queryBuilder.andWhere('notification.type = :type', { type });
    }

    const [data, total] = await queryBuilder
      .orderBy('notification.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

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
    const notification = await this.notificationRepository.findOneBy({
      id,
      userId,
    });

    if (!notification) {
      throw new NotFoundException(`Notification #${id} not found`);
    }

    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }
}
