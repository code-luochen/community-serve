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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

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
        'lastLoginAt',
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

  async findAll(query: UserQueryDto) {
    const { page = 1, limit = 10, username, role } = query;
    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    if (username) {
      queryBuilder.andWhere('user.username LIKE :username', {
        username: `%${username}%`,
      });
    }

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    const [items, total] = await queryBuilder
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
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      status: 1, // Default active
    });
    return this.usersRepository.save(user);
  }

  async update(id: number, updateData: Partial<User>): Promise<User | null> {
    if (updateData.password) {
      const salt = await bcrypt.genSalt();
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    await this.usersRepository.update(id, updateData);
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
}
