import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyBinding } from './entities/family-binding.entity';
import { FamilyBindingController } from './family-binding.controller';
import { FamilyBindingService } from './family-binding.service';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FamilyBinding, User])],
  controllers: [FamilyBindingController],
  providers: [FamilyBindingService],
  exports: [FamilyBindingService],
})
export class FamilyBindingModule {}
