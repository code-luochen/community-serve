import { IsInt, Min, Max, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: '更新的新状态：0-待接单 1-已接单 2-配送中 3-已完成 4-已取消',
  })
  @IsInt()
  @Min(0)
  @Max(4)
  @IsNotEmpty()
  status: number;
}
