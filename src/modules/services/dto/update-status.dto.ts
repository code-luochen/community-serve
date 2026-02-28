import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class UpdateServiceStatusDto {
  @ApiProperty({ description: '状态：0-下架 1-上架', example: 1 })
  @IsInt()
  @Min(0)
  @Max(1)
  status: number;
}
