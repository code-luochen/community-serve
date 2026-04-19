import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { FamilyBinding } from '../family-binding/entities/family-binding.entity';
import { ElderlyProfile } from '../elderly-profile/entities/elderly-profile.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(FamilyBinding)
    private bindingRepository: Repository<FamilyBinding>,
    @InjectRepository(ElderlyProfile)
    private profileRepository: Repository<ElderlyProfile>,
  ) {}

  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username },
      select: [
        'id',
        'username',
        'password',
        'role',
        'status',
        'nickname',
        'realName',
        'phone',
        'lastLoginAt',
        'avatar',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findAll(query: UserQueryDto, currentUserRole?: number) {
    const { page = 1, limit = 10, username, role } = query;
    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    if (username) {
      queryBuilder.andWhere('user.username LIKE :username', {
        username: `%${username}%`,
      });
    }

    // Force role filter if requested by FAMILY user
    if (currentUserRole === 2) {
      queryBuilder.andWhere('user.role = :strictRole', { strictRole: 1 });
    } else if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    const [items, total] = await queryBuilder
      .leftJoinAndSelect('user.community', 'userCommunity')
      .leftJoinAndSelect('user.house', 'userHouse')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('profile.house', 'profileHouse')
      .leftJoinAndSelect('profileHouse.community', 'profileCommunity')
      .leftJoinAndSelect('user.familyBindings', 'familyBindings', 'familyBindings.status = 1')
      .leftJoinAndSelect('familyBindings.elderly', 'elderly')
      .leftJoinAndSelect('user.elderlyBindings', 'elderlyBindings', 'elderlyBindings.status = 1')
      .leftJoinAndSelect('elderlyBindings.family', 'family')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const salt = await bcrypt.genSalt();
    // Default password to 123456
    const finalPassword = createUserDto.password || '123456';
    const hashedPassword = await bcrypt.hash(finalPassword, salt);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      status: 1, // Default active
    });
    const savedUser = await this.usersRepository.save(user);

    // If elderly, create profile
    if (createUserDto.role === 1) {
      await this.profileRepository.save({
        userId: savedUser.id,
        houseId: createUserDto.houseId,
      });
    }

    return savedUser;
  }

  async update(id: number, updateData: any): Promise<User | null> {
    if (updateData.password) {
      const salt = await bcrypt.genSalt();
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    
    // Ensure numeric types for address fields if they exist
    if (updateData.communityId) updateData.communityId = Number(updateData.communityId);
    if (updateData.houseId) updateData.houseId = Number(updateData.houseId);

    // Update user table
    await this.usersRepository.update(id, updateData);
    
    // Sync to profile if user is elderly
    if (updateData.houseId) {
      const user = await this.findById(id);
      if (user && user.role === 1) {
        await this.profileRepository.update({ userId: id }, { houseId: updateData.houseId });
      }
    }
    
    return this.findById(id);
  }

  async updateLastLogin(id: number) {
    await this.usersRepository.update(id, { lastLoginAt: new Date() });
  }

  async resetPassword(id: number, newPassword: string): Promise<void> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await this.usersRepository.update(id, { password: hashedPassword });
  }

  async getFamilyMembersByElderlyId(elderlyId: number): Promise<User[]> {
    const bindings = await this.bindingRepository.find({
      where: { elderlyId, status: 1 },
      relations: ['family'],
    });
    return bindings.map((b) => b.family).filter((f) => f != null);
  }

  async getAdmins(): Promise<User[]> {
    return this.usersRepository.find({ where: { role: 4 } });
  }
}
