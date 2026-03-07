import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('数据统计模块 (Statistics)')
@Controller('statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('dashboard')
  @Roles(4) // 4 = 管理员
  @ApiOperation({ summary: '获取管理员数据看板统计信息' })
  async getDashboardData(
    @Query('communityId') communityId?: string,
  ) {
    const parsedCommunityId = communityId ? parseInt(communityId, 10) : undefined;
    return await this.statisticsService.getDashboardData(parsedCommunityId);
  }

  @Get('merchant')
  @Roles(3) // 3 = 商家
  @ApiOperation({ summary: '获取商家首页统计信息' })
  async getMerchantStats(@Req() req: any) {
    // req.user from JwtAuthGuard
    return await this.statisticsService.getMerchantStats(req.user.userId);
  }

  @Get('family')
  @Roles(2) // 2 = 家属
  @ApiOperation({ summary: '获取家属首页统计信息，支持按 elderlyId 切换老人' })
  async getFamilyStats(
    @Req() req: any,
    @Query('elderlyId') elderlyId?: string,
  ) {
    const parsedElderlyId = elderlyId ? parseInt(elderlyId, 10) : undefined;
    return await this.statisticsService.getFamilyStats(req.user.userId, parsedElderlyId);
  }
}
