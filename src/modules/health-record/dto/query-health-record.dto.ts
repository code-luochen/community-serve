import { IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryHealthRecordDto {
  @ApiProperty({ description: '老年人 ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '老年人ID必须是整数' })
  elderlyId?: number;

  @ApiProperty({ description: '是否异常：0-正常 1-异常', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  isAbnormal?: number;

  @ApiProperty({ description: '页码', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @ApiProperty({ description: '每页数量', required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 10;
}
