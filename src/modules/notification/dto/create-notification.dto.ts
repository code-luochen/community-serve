import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ description: 'User ID to receive the notification' })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ description: 'Type: order, health, emergency' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Title of the notification' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Content of the notification' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ required: false, description: 'Related business ID' })
  @IsNumber()
  @IsOptional()
  relatedId?: number;

  @ApiProperty({ required: false, description: 'Related elderly user ID for filtering' })
  @IsNumber()
  @IsOptional()
  elderlyId?: number;
}
