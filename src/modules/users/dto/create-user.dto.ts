import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  Matches,
  Length,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../auth/dto/login.dto';

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

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  realName?: string;
}
