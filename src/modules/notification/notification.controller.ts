// Trigger TS Server refresh
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Notification')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user notifications (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isRead', required: false, type: Number, description: '0 for unread, 1 for read' })
  @ApiQuery({ name: 'elderlyId', required: false, type: Number, description: 'Filter by elderly user ID' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Filter by notification type' })
  @ApiQuery({ name: 'communityId', required: false, type: Number, description: 'Filter by community ID' })
  findAll(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('isRead') isRead?: string,
    @Query('elderlyId') elderlyId?: string,
    @Query('type') type?: string,
    @Query('communityId') communityId?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const readStatus = isRead !== undefined ? parseInt(isRead, 10) : undefined;
    const elderlyIdNum = elderlyId ? parseInt(elderlyId, 10) : undefined;
    const communityIdNum = communityId ? parseInt(communityId, 10) : undefined;
    return this.notificationService.findAll(
      req.user.userId,
      pageNum,
      limitNum,
      readStatus,
      elderlyIdNum,
      type,
      communityIdNum,
    );
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Get unread notification count for the current user',
  })
  getUnreadCount(@Req() req: any) {
    return this.notificationService.findUnreadCount(req.user.userId);
  }

  @Patch(':id/read')
  @Put(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read (Supports PATCH/PUT for compatibility)' })
  markAsRead(@Param('id') id: string, @Req() req: any) {
    return this.notificationService.markAsRead(+id, req.user.userId);
  }

  @Patch('read-all')
  @Put('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for current user (Supports PATCH/PUT)' })
  markAllAsRead(@Req() req: any) {
    return this.notificationService.markAllAsRead(req.user.userId);
  }
}
