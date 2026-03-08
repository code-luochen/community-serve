import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmergencyLog } from './entities/emergency-log.entity';
import { CreateEmergencyDto } from './dto/create-emergency.dto';
import { UpdateEmergencyDto } from './dto/update-emergency.dto';
import { QueryEmergencyDto } from './dto/query-emergency.dto';
import { NotificationService } from '../notification/notification.service';
import { UsersService } from '../users/users.service';

export interface EmergencyLogListResult {
  items: EmergencyLog[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class EmergencyService {
  constructor(
    @InjectRepository(EmergencyLog)
    private readonly emergencyLogRepository: Repository<EmergencyLog>,
    private readonly notificationService: NotificationService,
    private readonly usersService: UsersService,
  ) {}

  // BE-16: 求助触发与记录
  async create(
    elderlyId: number,
    createDto: CreateEmergencyDto,
  ): Promise<EmergencyLog> {
    const record = this.emergencyLogRepository.create({
      elderlyId: elderlyId,
      location: createDto.location,
      remark: createDto.remark,
      status: 0, // 初始为待处理
    });

    const savedRecord = await this.emergencyLogRepository.save(record);

    const title = '紧急求助通知';
    const content = `收到一项新的紧急求助（位置：${savedRecord.location || '未知'}），请尽快查收处理！`;

    // Notify family members
    const familyMembers =
      await this.usersService.getFamilyMembersByElderlyId(elderlyId);
    for (const family of familyMembers) {
      await this.notificationService.create({
        userId: Number(family.id),
        type: 'emergency',
        title,
        content,
        relatedId: Number(savedRecord.id),
      });
    }

    // Notify admins
    const admins = await this.usersService.getAdmins();
    for (const admin of admins) {
      await this.notificationService.create({
        userId: Number(admin.id),
        type: 'emergency',
        title,
        content,
        relatedId: Number(savedRecord.id),
      });
    }

    return savedRecord;
  }

  // BE-17: 求助处理 (由管理员或家属确认处理并记录)
  async handleEmergency(
    id: number,
    currentUserId: number,
    updateDto: UpdateEmergencyDto,
  ): Promise<EmergencyLog> {
    const emergency = await this.emergencyLogRepository.findOneBy({ id });
    if (!emergency) {
      throw new NotFoundException('求助记录不存在');
    }

    // 更新处理人（如果DTO中指定了处理人，如管理员分配，则使用该ID，否则默认当前操作人）
    emergency.handlerId = updateDto.handlerId || currentUserId;
    emergency.status = updateDto.status;

    if (updateDto.status === 1 && !emergency.handleTime) {
      // 状态：处理中，记录处理开始时间
      emergency.handleTime = new Date();
    } else if (updateDto.status === 2) {
      // 状态：已处理，记录完成时间和结果
      if (!emergency.handleTime) {
        emergency.handleTime = new Date();
      }
      emergency.finishTime = new Date();
      if (updateDto.handleResult) {
        emergency.handleResult = updateDto.handleResult;
      }
    }

    return await this.emergencyLogRepository.save(emergency);
  }

  // 获取求助列表 (家属和管理员查询)
  async findAll(query: QueryEmergencyDto): Promise<EmergencyLogListResult> {
    const { elderlyId, status, page = 1, limit = 10, communityId } = query;
    const queryBuilder = this.emergencyLogRepository
      .createQueryBuilder('emergency_log')
      .leftJoinAndSelect('emergency_log.elderly', 'elderly')
      .leftJoinAndSelect('elderly.house', 'house')
      .leftJoinAndSelect('elderly.community', 'community')
      .leftJoinAndSelect('emergency_log.handler', 'handler');

    if (elderlyId !== undefined) {
      queryBuilder.andWhere('emergency_log.elderlyId = :elderlyId', {
        elderlyId,
      });
    }

    if (communityId !== undefined) {
      queryBuilder.andWhere('elderly.communityId = :communityId', {
        communityId,
      });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('emergency_log.status = :status', { status });
    }

    queryBuilder.orderBy('emergency_log.createdAt', 'DESC');
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  // 获取单条详情
  async findOne(id: number): Promise<EmergencyLog> {
    const emergency = await this.emergencyLogRepository.findOne({
      where: { id },
      relations: ['elderly', 'handler'],
    });

    if (!emergency) {
      throw new NotFoundException('求助记录不存在');
    }
    return emergency;
  }
}
