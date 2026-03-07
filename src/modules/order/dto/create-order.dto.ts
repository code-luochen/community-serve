import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsObject,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

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

  @ApiPropertyOptional({
    description:
      'house_dict.id，系统自动从老人档案读取；传入则优先使用（适用于临时修改地址）',
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  houseId?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}
