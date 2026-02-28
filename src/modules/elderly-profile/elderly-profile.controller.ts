import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ElderlyProfileService } from './elderly-profile.service';
import { CreateElderlyProfileDto } from './dto/create-elderly-profile.dto';
import { UpdateElderlyProfileDto } from './dto/update-elderly-profile.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/login.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('elderly-profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('elderly-profile')
export class ElderlyProfileController {
  constructor(private readonly profileService: ElderlyProfileService) {}

  @Get('me')
  @Roles(UserRole.ELDERLY)
  @ApiOperation({ summary: '获取当前登录老人档案' })
  getMyProfile(@CurrentUser() user: { id: number }) {
    return this.profileService.findOneByUserId(user.id);
  }

  @Post('me')
  @Roles(UserRole.ELDERLY)
  @ApiOperation({ summary: '创建/更新当前登录老人档案' })
  updateMyProfile(
    @CurrentUser() user: { id: number },
    @Body() dto: CreateElderlyProfileDto,
  ) {
    return this.profileService.createOrUpdateForUser(user.id, dto);
  }

  @Get(':userId')
  @Roles(UserRole.FAMILY, UserRole.ADMIN)
  @ApiOperation({ summary: '根据用户ID获取老人档案 (家属/管理员)' })
  getProfileByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.profileService.findOneByUserId(userId);
  }

  @Put(':userId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '根据用户ID更新老人档案 (仅管理员)' })
  updateProfileByUserId(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateElderlyProfileDto,
  ) {
    return this.profileService.createOrUpdateForUser(userId, dto);
  }
}
