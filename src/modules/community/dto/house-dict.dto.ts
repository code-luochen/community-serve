import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateHouseDictDto {
  @ApiProperty({ description: '关联小区ID', example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  communityId: number;

  @ApiProperty({ description: '楼栋号', example: 'A栋' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  buildingNo: string;

  @ApiPropertyOptional({ description: '单元号', example: '1单元' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  unitNo?: string;

  @ApiProperty({ description: '门牌号', example: '402' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  roomNo: string;
}

export class BatchCreateHouseDictDto {
  @ApiProperty({
    description: '批量地址列表',
    type: [CreateHouseDictDto],
  })
  items: CreateHouseDictDto[];
}

export class HouseDictQueryDto {
  @ApiPropertyOptional({ description: '小区ID筛选', type: Number })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  communityId?: number;

  @ApiPropertyOptional({ description: '楼栋号筛选' })
  @IsString()
  @IsOptional()
  buildingNo?: string;
}
