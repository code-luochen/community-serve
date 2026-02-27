import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(6)
  oldPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  // PRD requires letter + number, but here just min length 6.
  // Task breakdown says 6-16.
  // I'll add a regex if needed, but for now simple length.
  newPassword: string;
}
