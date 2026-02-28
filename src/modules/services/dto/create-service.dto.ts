import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ description: '服务名称', example: '上门理发' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: '类型：1-生活服务 2-药品服务 3-医护服务',
    example: 1,
  })
  @IsInt()
  @Min(1)
  @Max(3)
  type: number;

  @ApiProperty({ description: '服务描述', example: '提供专业上门理发服务' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: '价格', example: 30.0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: '服务图片URL',
    example: '/images/haircut.jpg',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  imageUrl?: string;
}
