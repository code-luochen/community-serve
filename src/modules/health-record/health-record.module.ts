import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthRecordController } from './health-record.controller';
import { HealthRecordService } from './health-record.service';
import { HealthRecord } from './entities/health-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HealthRecord])],
  controllers: [HealthRecordController],
  providers: [HealthRecordService],
})
export class HealthRecordModule {}
