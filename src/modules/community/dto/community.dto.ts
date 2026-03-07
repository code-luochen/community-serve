import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommunityDto {
  @ApiProperty({ description: '小区名称', example: '阳光花园' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '小区详细物理地址', example: '北京市朝阳区望京街道1号' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  address: string;
}

export class UpdateCommunityDto {
  @ApiPropertyOptional({ description: '小区名称' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: '小区详细物理地址' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  address?: string;
}
