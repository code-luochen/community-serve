import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CommunityService } from './community.service';
import {
  CreateCommunityDto,
  UpdateCommunityDto,
} from './dto/community.dto';
import {
  CreateHouseDictDto,
  BatchCreateHouseDictDto,
  HouseDictQueryDto,
} from './dto/house-dict.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/login.dto';

@ApiTags('小区与地址管理 (Community & Address) BE-20')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  // ──────── Community ────────

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'BE-20 创建小区' })
  createCommunity(@Body() dto: CreateCommunityDto) {
    return this.communityService.createCommunity(dto);
  }

  @Get()
  @ApiOperation({ summary: 'BE-20 获取小区列表' })
  findAllCommunities() {
    return this.communityService.findAllCommunities();
  }

  @Get('address-tree')
  @ApiOperation({ summary: 'BE-20 获取地址级联树（供前端级联选择器）' })
  getAddressTree() {
    return this.communityService.getAddressTree();
  }

  @Get(':id')
  @ApiOperation({ summary: 'BE-20 获取小区详情（含房屋列表）' })
  findOneCommunity(@Param('id', ParseIntPipe) id: number) {
    return this.communityService.findOneCommunity(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'BE-20 更新小区信息' })
  updateCommunity(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommunityDto,
  ) {
    return this.communityService.updateCommunity(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'BE-20 删除小区' })
  deleteCommunity(@Param('id', ParseIntPipe) id: number) {
    return this.communityService.deleteCommunity(id);
  }

  // ──────── HouseDict ────────

  @Post('house')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'BE-20 新增单条房屋地址' })
  createHouse(@Body() dto: CreateHouseDictDto) {
    return this.communityService.createHouse(dto);
  }

  @Post('house/batch')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'BE-20 批量导入房屋地址' })
  batchCreateHouses(@Body() body: BatchCreateHouseDictDto) {
    return this.communityService.batchCreateHouses(body.items);
  }

  @Get('house/list')
  @ApiOperation({ summary: 'BE-20 查询房屋地址列表（可按小区/楼栋筛选）' })
  findHouses(@Query() query: HouseDictQueryDto) {
    return this.communityService.findHouses(query);
  }

  @Get('house/:id')
  @ApiOperation({ summary: 'BE-20 获取单条房屋地址详情' })
  findOneHouse(@Param('id', ParseIntPipe) id: number) {
    return this.communityService.findOneHouse(id);
  }

  @Delete('house/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'BE-20 删除房屋地址' })
  deleteHouse(@Param('id', ParseIntPipe) id: number) {
    return this.communityService.deleteHouse(id);
  }
}
