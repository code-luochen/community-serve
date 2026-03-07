import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from '../notification/notification.module';
import { UsersModule } from '../users/users.module';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), NotificationModule, UsersModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
