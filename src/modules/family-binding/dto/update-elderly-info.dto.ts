import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateElderlyInfoDto {
  @ApiPropertyOptional({ description: '真实姓名' })
  @IsOptional()
  @IsString()
  realName?: string;

  @ApiPropertyOptional({ description: '联系电话' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '年龄' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  age?: number;

  @ApiPropertyOptional({ description: '性别' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  gender?: number;

  @ApiPropertyOptional({ description: '房屋ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  houseId?: number;
}
