import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ElderlyProfile } from './entities/elderly-profile.entity';
import { CreateElderlyProfileDto } from './dto/create-elderly-profile.dto';
import { UpdateElderlyProfileDto } from './dto/update-elderly-profile.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../auth/dto/login.dto';

@Injectable()
export class ElderlyProfileService {
  constructor(
    @InjectRepository(ElderlyProfile)
    private readonly profileRepo: Repository<ElderlyProfile>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async createOrUpdateForUser(
    userId: number,
    dto: CreateElderlyProfileDto | UpdateElderlyProfileDto,
  ): Promise<ElderlyProfile> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('找不到用户信息');
    }
    if (user.role !== Number(UserRole.ELDERLY)) {
      throw new BadRequestException('只有老年人角色可以管理档案');
    }

    let profile = await this.profileRepo.findOneBy({ userId });

    if (profile) {
      Object.assign(profile, dto);
    } else {
      profile = this.profileRepo.create({ ...dto, userId });
    }

    return await this.profileRepo.save(profile);
  }

  async findOneByUserId(userId: number): Promise<ElderlyProfile> {
    const profile = await this.profileRepo.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('档案不存在');
    }

    return profile;
  }
}
