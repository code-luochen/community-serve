import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from '../notification/notification.module';
import { UsersModule } from '../users/users.module';
import { EmergencyService } from './emergency.service';
import { EmergencyController } from './emergency.controller';
import { EmergencyLog } from './entities/emergency-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmergencyLog]),
    NotificationModule,
    UsersModule,
  ],
  controllers: [EmergencyController],
  providers: [EmergencyService],
  exports: [EmergencyService],
})
export class EmergencyModule {}
