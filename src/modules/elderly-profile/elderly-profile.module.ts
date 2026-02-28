import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElderlyProfile } from './entities/elderly-profile.entity';
import { ElderlyProfileService } from './elderly-profile.service';
import { ElderlyProfileController } from './elderly-profile.controller';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ElderlyProfile, User])],
  controllers: [ElderlyProfileController],
  providers: [ElderlyProfileService],
  exports: [ElderlyProfileService],
})
export class ElderlyProfileModule {}
