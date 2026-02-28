import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}
