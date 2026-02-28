import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class AuditServiceDto {
  @ApiProperty({ description: '审核状态：1-通过 2-拒绝', example: 1 })
  @IsInt()
  @Min(1)
  @Max(2)
  auditStatus: number;
}
