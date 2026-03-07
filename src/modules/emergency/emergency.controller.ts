import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmergencyService } from './emergency.service';
import { CreateEmergencyDto } from './dto/create-emergency.dto';
import { UpdateEmergencyDto } from './dto/update-emergency.dto';
import { QueryEmergencyDto } from './dto/query-emergency.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser {
  user: {
    userId: number;
    username: string;
    role: number;
  };
}

@ApiTags('紧急求助(Emergency)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('emergency')
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Post()
  @ApiOperation({ summary: 'BE-16: 一键求助触发' })
  async create(
    @Req() req: RequestWithUser,
    @Body() createDto: CreateEmergencyDto,
  ) {
    const userRole = req.user.role;
    // 只有老年人（1）可以触发求助
    if (userRole !== 1) {
      throw new ForbiddenException('仅老年人用户可发起紧急求助');
    }
    const elderlyId = req.user.userId;
    return await this.emergencyService.create(elderlyId, createDto);
  }

  @Put(':id/handle')
  @ApiOperation({ summary: 'BE-17: 确认或更新求助处理状态' })
  async handleEmergency(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateDto: UpdateEmergencyDto,
  ) {
    const userRole = req.user.role;
    // 只有家属（2）和管理员（4）可以处理
    if (userRole !== 2 && userRole !== 4) {
      throw new ForbiddenException('仅家属或管理员可处理紧急状态');
    }
    // 防止非管理员通过接口指定处理人
    if (userRole !== 4 && updateDto.handlerId) {
      delete updateDto.handlerId;
    }
    const currentUserId = req.user.userId;
    return await this.emergencyService.handleEmergency(
      +id,
      currentUserId,
      updateDto,
    );
  }

  @Get()
  @ApiOperation({ summary: '查询求助记录列表' })
  async findAll(
    @Req() req: RequestWithUser,
    @Query() query: QueryEmergencyDto,
  ) {
    const userRole = req.user.role;
    const currentUserId = req.user.userId;

    // 根据角色判断权限
    if (userRole === 1) {
      // 老年人只能看自己的
      query.elderlyId = currentUserId;
    } else if (userRole === 2) {
      // 家属如果传入了老人ID则可以查询，或者这里也可以获取家属绑定的所有老人（复杂），暂且直接允许带elderlyId查
    } else if (userRole === 3) {
      // 商家不能查紧急求助
      throw new ForbiddenException('商家无权查看紧急求助数据');
    }

    return await this.emergencyService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '查询单个求助详情' })
  async findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    const userRole = req.user.role;
    if (userRole === 3) {
      throw new ForbiddenException('商家无权查看紧急求助详情');
    }
    return await this.emergencyService.findOne(+id);
  }
}
