// Trigger TS Server refresh
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { Notification } from './entities/notification.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Notification]), UsersModule],
    controllers: [NotificationController],
    providers: [NotificationService],
    exports: [NotificationService],
})
export class NotificationModule { }
