import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from '../notification/notification.module';
import { UsersModule } from '../users/users.module';
import { HealthRecordController } from './health-record.controller';
import { HealthRecordService } from './health-record.service';
import { HealthRecord } from './entities/health-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HealthRecord]),
    NotificationModule,
    UsersModule,
  ],
  controllers: [HealthRecordController],
  providers: [HealthRecordService],
})
export class HealthRecordModule {}
