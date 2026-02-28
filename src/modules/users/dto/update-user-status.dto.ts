import { IsInt, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserStatusDto {
    @ApiProperty({ enum: [0, 1, 2], description: '状态：0-未激活 1-正常 2-禁用' })
    @IsInt()
    @IsEnum([0, 1, 2])
    @IsNotEmpty()
    status: number;
}
