// Trigger TS Server refresh
import { Controller, Get, Post, Body, Param, Patch, Query, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Notification')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Get()
    @ApiOperation({ summary: 'Get current user notifications (paginated)' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    findAll(
        @Req() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.notificationService.findAll(req.user.userId, pageNum, limitNum);
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'Get unread notification count for the current user' })
    getUnreadCount(@Req() req: any) {
        return this.notificationService.findUnreadCount(req.user.userId);
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Mark a notification as read' })
    markAsRead(@Param('id') id: string, @Req() req: any) {
        return this.notificationService.markAsRead(+id, req.user.userId);
    }

    @Patch('read-all')
    @ApiOperation({ summary: 'Mark all notifications as read for current user' })
    markAllAsRead(@Req() req: any) {
        return this.notificationService.markAllAsRead(req.user.userId);
    }
}
