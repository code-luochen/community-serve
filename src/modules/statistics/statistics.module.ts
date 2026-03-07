import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';

import { User } from '../users/entities/user.entity';
import { Order } from '../order/entities/order.entity';
import { HealthRecord } from '../health-record/entities/health-record.entity';
import { Service } from '../services/entities/service.entity';
import { FamilyBinding } from '../family-binding/entities/family-binding.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Order, HealthRecord, Service, FamilyBinding])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
