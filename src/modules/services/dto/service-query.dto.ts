import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ServiceQueryDto {
  @ApiPropertyOptional({ description: '当前页码', example: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', example: 10 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ description: '搜索关键词名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '分类类型过滤' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  type?: number;

  @ApiPropertyOptional({ description: '状态过滤：0-下架 1-上架' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;

  @ApiPropertyOptional({ description: '审核状态：0-待审核 1-通过 2-拒绝' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  auditStatus?: number;

  @ApiPropertyOptional({ description: '所属小区ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  communityId?: number;
}
