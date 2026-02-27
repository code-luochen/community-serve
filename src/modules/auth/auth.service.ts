import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, UserRole } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
    role?: number,
  ): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // Check role if specified
      if (role && user.role !== role) {
        throw new UnauthorizedException('Role mismatch');
      }
      // Check status
      if (user.status !== 1) {
        throw new UnauthorizedException('Account disabled');
      }

      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const payload = { username: user.username, sub: user.id, role: user.role };

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        nickname: user.nickname,
      },
    };
  }

  async changePassword(
    userId: number,
    oldPass: string,
    newPass: string,
  ): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // We need to re-fetch user with password to compare, because findById normally doesn't select password?
    // Actually UsersService.findOne selects password. findById in UsersService just uses findOneBy.
    // So let's use findOne or verify logic.
    // Better: UsersService.findOne(username) returns password.
    // But we have ID.
    // Let's add findIdWithPassword to UsersService or just query repo here if accessible? No, separate concerns.
    // Let's use findOne by username? Or modify findById to select password if needed.
    // Or just re-fetch by username since username is likely unique.
    const userWithPass = await this.usersService.findOne(user.username);
    if (
      !userWithPass ||
      !(await bcrypt.compare(oldPass, userWithPass.password))
    ) {
      throw new BadRequestException('Old password incorrect');
    }

    if (oldPass === newPass) {
      throw new BadRequestException('New password must be different');
    }

    await this.usersService.resetPassword(userId, newPass);
  }
}
