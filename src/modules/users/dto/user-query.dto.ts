import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UserQueryDto {
    @ApiProperty({ required: false, default: 1 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Transform(({ value }) => parseInt(value, 10))
    page?: number = 1;

    @ApiProperty({ required: false, default: 10 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    @Transform(({ value }) => parseInt(value, 10))
    limit?: number = 10;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    username?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => parseInt(value, 10))
    role?: number;
}
