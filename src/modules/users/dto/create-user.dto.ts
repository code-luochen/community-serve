import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  Matches,
  Length,
  IsOptional,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../auth/dto/login.dto';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(4, 20)
  @Matches(/^[a-z0-9_]+$/, {
    message:
      'Username must contain only lowercase letters, numbers, and underscores',
  })
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(6, 16) // Task breakdown: 6-16
  password: string;

  @ApiProperty({ enum: UserRole })
  @IsNumber()
  @IsEnum(UserRole)
  role: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @ApiPropertyOptional({ description: '真实姓名' })
  @IsString()
  @IsOptional()
  realName?: string;

  @ApiProperty({ description: '联系电话' })
  @IsString()
  @IsNotEmpty({ message: '联系电话不能为空' })
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入正确的11位手机号码' })
  phone: string;

  @ApiPropertyOptional({ description: '头像URL' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({
    description: '所属小区ID（关联 community.id），用于数据隔离',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  communityId?: number;

  @ApiPropertyOptional({
    description: '关联 house_dict.id，精确楼栋/单元/门牌',
    example: 101,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  houseId?: number;
}
