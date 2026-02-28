import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateElderlyProfileDto {
  @ApiPropertyOptional({ description: '年龄', example: 70 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(150)
  age?: number;

  @ApiPropertyOptional({ description: '性别：1-男 2-女', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2)
  gender?: number;

  @ApiPropertyOptional({ description: '详细住址', example: '张阳小区A栋302' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({ description: '紧急联系人姓名', example: '张三' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  emergencyContact?: string;

  @ApiPropertyOptional({ description: '紧急联系电话', example: '13812345678' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  emergencyPhone?: string;
}
