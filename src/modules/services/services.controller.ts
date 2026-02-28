import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceQueryDto } from './dto/service-query.dto';
import { AuditServiceDto } from './dto/audit-service.dto';
import { UpdateServiceStatusDto } from './dto/update-status.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/login.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @Roles(UserRole.MERCHANT)
  @ApiOperation({ summary: '商家发布服务 (待审核)' })
  create(
    @CurrentUser() user: { id: number },
    @Body() createServiceDto: CreateServiceDto,
  ) {
    return this.servicesService.create(user.id, createServiceDto);
  }

  @Get()
  @ApiOperation({ summary: '服务列表查询 (公共，仅展示审核通过且上架的服务)' })
  findAllPublic(@Query() query: ServiceQueryDto) {
    return this.servicesService.findAll(query, { status: 1, auditStatus: 1 });
  }

  @Get('merchant')
  @Roles(UserRole.MERCHANT)
  @ApiOperation({ summary: '商家查看自己发布的服务列表' })
  findAllByMerchant(
    @CurrentUser() user: { id: number },
    @Query() query: ServiceQueryDto,
  ) {
    return this.servicesService.findAll(query, { merchantId: user.id });
  }

  @Get('admin')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '管理员查看所有服务列表' })
  findAllByAdmin(@Query() query: ServiceQueryDto) {
    return this.servicesService.findAll(query, {});
  }

  @Get(':id')
  @ApiOperation({ summary: '获取服务详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.MERCHANT)
  @ApiOperation({ summary: '商家修改服务 (修改后需重新审核)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number },
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.servicesService.update(id, user.id, updateServiceDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.MERCHANT)
  @ApiOperation({ summary: '商家上下架服务' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number },
    @Body() dto: UpdateServiceStatusDto,
  ) {
    return this.servicesService.updateStatus(id, user.id, dto.status);
  }

  @Patch(':id/audit')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '管理员审核服务' })
  audit(@Param('id', ParseIntPipe) id: number, @Body() dto: AuditServiceDto) {
    return this.servicesService.audit(id, dto.auditStatus);
  }
}
