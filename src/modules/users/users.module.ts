import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { FamilyBinding } from '../family-binding/entities/family-binding.entity';
import { ElderlyProfile } from '../elderly-profile/entities/elderly-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, FamilyBinding, ElderlyProfile])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
