import {
  IsOptional,
  IsInt,
  IsNumber,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHealthRecordDto {
  @ApiProperty({ description: '老年人 ID', required: true, example: 1 })
  @IsNotEmpty({ message: '老年人 ID 不能为空' })
  elderlyId: string;

  @ApiProperty({ description: '收缩压（mmHg）', required: false, example: 120 })
  @IsOptional()
  @IsInt({ message: '收缩压必须是整数' })
  @Min(0)
  @Max(300)
  systolicBp?: number;

  @ApiProperty({ description: '舒张压（mmHg）', required: false, example: 80 })
  @IsOptional()
  @IsInt({ message: '舒张压必须是整数' })
  @Min(0)
  @Max(200)
  diastolicBp?: number;

  @ApiProperty({ description: '心率（次/分）', required: false, example: 75 })
  @IsOptional()
  @IsInt({ message: '心率必须是整数' })
  @Min(0)
  @Max(250)
  heartRate?: number;

  @ApiProperty({ description: '血糖（mmol/L）', required: false, example: 5.5 })
  @IsOptional()
  @IsNumber({}, { message: '血糖必须是数字' })
  @Min(0)
  @Max(50)
  bloodSugar?: number;

  @ApiProperty({ description: '体温（℃）', required: false, example: 36.5 })
  @IsOptional()
  @IsNumber({}, { message: '体温必须是数字' })
  @Min(30)
  @Max(45)
  temperature?: number;
}
