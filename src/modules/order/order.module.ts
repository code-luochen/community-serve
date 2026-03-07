import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from '../notification/notification.module';
import { UsersModule } from '../users/users.module';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';
import { CommunityModule } from '../community/community.module';
import { ElderlyProfile } from '../elderly-profile/entities/elderly-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, ElderlyProfile]),
    NotificationModule,
    UsersModule,
    CommunityModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
