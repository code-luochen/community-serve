import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from './entities/announcement.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UsersService } from '../users/users.service';
import { NotificationService } from '../notification/notification.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AnnouncementService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepository: Repository<Announcement>,
    private readonly usersService: UsersService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(createAnnouncementDto: CreateAnnouncementDto, communityId: number | null, creatorId: number) {
    const announcement = this.announcementRepository.create({
      ...createAnnouncementDto,
      communityId,
      createdBy: creatorId,
    });
    const savedAnnouncement = await this.announcementRepository.save(announcement);

    // Push notification to all active users in the same community, or all users if global
    let usersList: User[] = [];
    if (communityId === null) {
      usersList = await this.usersService.findAllActiveUsers();
    } else {
      usersList = await this.usersService.findAllByCommunity(communityId);
    }
    
    if (usersList && usersList.length > 0) {
      const notificationPromises = usersList.map(user => {
        return this.notificationService.create({
          userId: user.id,
          title: `【公告】${savedAnnouncement.title}`,
          content: savedAnnouncement.content,
          type: 'system',
          relatedId: savedAnnouncement.id,
          elderlyId: user.role === 1 ? user.id : undefined,
        });
      });
      // Fire and forget, or await. Await in loop or Promise.all is fine.
      await Promise.all(notificationPromises).catch(err => {
        console.error('Failed to dispatch notifications for announcement:', err);
      });
    }

    return savedAnnouncement;
  }

  async findAll(communityId: number | null) {
    const query = this.announcementRepository.createQueryBuilder('announcement')
      .leftJoinAndSelect('announcement.creator', 'creator')
      .orderBy('announcement.createdAt', 'DESC');
    
    if (communityId !== null) {
      query.where('announcement.communityId = :communityId OR announcement.communityId IS NULL', { communityId });
    }
    // If communityId is null (Platform Admin view), we show all announcements.
    return await query.getMany();
  }

  async findOne(id: number) {
    return await this.announcementRepository.findOne({ where: { id }, relations: ['creator'] });
  }

  async remove(id: number, communityId: number | null) {
    const query = this.announcementRepository.createQueryBuilder('announcement').where('announcement.id = :id', { id });
    if (communityId !== null) {
      query.andWhere('announcement.communityId = :communityId', { communityId });
    }
    const announcement = await query.getOne();
    
    if (announcement) {
      await this.announcementRepository.remove(announcement);
      // Delete associated notifications
      await this.notificationService.removeByRelated('system', announcement.id);
      return true;
    }
    return false;
  }
}
