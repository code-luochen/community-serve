import {
  IsInt,
  Min,
  Max,
  IsString,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EvaluateOrderDto {
  @ApiProperty({ description: '评价星级（1-5）' })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  evaluation: number;

  @ApiPropertyOptional({ description: '评价内容' })
  @IsString()
  @IsOptional()
  evaluationContent?: string;
}
