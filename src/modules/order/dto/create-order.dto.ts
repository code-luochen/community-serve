import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: '老年人 user_id', type: String })
  @IsString()
  @IsNotEmpty()
  elderlyId: string;

  @ApiProperty({ description: '商家 user_id', type: String })
  @IsString()
  @IsNotEmpty()
  merchantId: string;

  @ApiProperty({ description: '服务 ID', type: String })
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({ description: '服务快照（名称/价格）' })
  @IsObject()
  @IsNotEmpty()
  serviceSnapshot: Record<string, any>;

  @ApiProperty({ description: '预约服务时间' })
  @IsDateString()
  @IsNotEmpty()
  serviceTime: string;

  @ApiProperty({ description: '服务地址' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}
