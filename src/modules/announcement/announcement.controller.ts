import { Controller, Get, Post, Body, Param, Delete, Request, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../users/users.service';

@ApiTags('announcement')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('announcement')
export class AnnouncementController {
  constructor(
    private readonly announcementService: AnnouncementService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Publish an announcement' })
  async create(@Body() createAnnouncementDto: CreateAnnouncementDto, @Request() req) {
    const userPayload = req.user;
    if (userPayload.role !== 4) { // Only admin can create
      throw new UnauthorizedException('Only administrators can create announcements');
    }
    const fullUser = await this.usersService.findById(userPayload.userId);
    const communityId = fullUser?.communityId || null; // Null means global announcement
    return this.announcementService.create(createAnnouncementDto, communityId, userPayload.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all announcements for the user community' })
  async findAll(@Request() req) {
    const userPayload = req.user;
    const fullUser = await this.usersService.findById(userPayload.userId);
    const communityId = fullUser?.communityId || null;
    return this.announcementService.findAll(communityId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of an announcement' })
  findOne(@Param('id') id: string) {
    return this.announcementService.findOne(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an announcement' })
  async remove(@Param('id') id: string, @Request() req) {
    const userPayload = req.user;
    if (userPayload.role !== 4) {
      throw new UnauthorizedException('Only administrators can delete announcements');
    }
    const fullUser = await this.usersService.findById(userPayload.userId);
    const communityId = fullUser?.communityId || null;
    return this.announcementService.remove(+id, communityId);
  }
}
