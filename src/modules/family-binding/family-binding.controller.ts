import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FamilyBindingService } from './family-binding.service';
import { CreateBindingDto } from './dto/create-binding.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/login.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('family-binding')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('family-binding')
export class FamilyBindingController {
  constructor(private readonly bindingService: FamilyBindingService) {}

  @Post()
  @Roles(UserRole.FAMILY)
  @ApiOperation({ summary: '家属端发送绑定请求' })
  bindElderly(
    @CurrentUser() user: { id: number },
    @Body() dto: CreateBindingDto,
  ) {
    return this.bindingService.bindElderly(user.id, dto);
  }

  @Get('my-elderly')
  @Roles(UserRole.FAMILY)
  @ApiOperation({ summary: '家属端获取已绑定老人列表' })
  getMyElderlyList(@CurrentUser() user: { id: number }) {
    return this.bindingService.getMyElderlyList(user.id);
  }

  @Delete(':elderlyId')
  @Roles(UserRole.FAMILY)
  @ApiOperation({ summary: '家属端解除与某个老人的绑定' })
  unbindElderly(
    @CurrentUser() user: { id: number },
    @Param('elderlyId', ParseIntPipe) elderlyId: number,
  ) {
    return this.bindingService.unbind(user.id, elderlyId);
  }
}
