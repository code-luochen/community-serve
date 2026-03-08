import { IsString, IsOptional, IsNotEmpty, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  nickname?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  realName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  communityId?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  houseId?: number;
}
