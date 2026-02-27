import {
  IsString,
  MinLength,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ELDERLY = 1,
  FAMILY = 2,
  MERCHANT = 3,
  ADMIN = 4,
}

export class LoginDto {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: UserRole, required: false })
  @IsOptional()
  @IsNumber()
  @IsEnum(UserRole)
  role?: number;
}
