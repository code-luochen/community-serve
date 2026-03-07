import { IsString, IsOptional, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmergencyDto {
  @ApiProperty({ description: '位置信息（高德地图API获取）', required: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  location: string;

  @ApiProperty({ description: '求助备注', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  remark?: string;
}
