import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryOrderDto {
  @ApiPropertyOptional({ description: '老年人 user_id' })
  @IsOptional()
  @IsString()
  elderlyId?: string;

  @ApiPropertyOptional({ description: '商家 user_id' })
  @IsOptional()
  @IsString()
  merchantId?: string;

  @ApiPropertyOptional({ description: '订单状态 (0-4)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @ApiPropertyOptional({ description: '每页条数', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;
}
