import { IsString, IsOptional, MaxLength, IsNumber, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEmergencyDto {
    @ApiProperty({ description: '状态：1-处理中 2-已处理', required: true })
    @IsNumber()
    @IsIn([1, 2])
    status: number;

    @ApiProperty({ description: '处理结果描述', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    handleResult?: string;

    @ApiProperty({ description: '指定处理人ID（仅管理员可用）', required: false })
    @IsOptional()
    @IsNumber()
    handlerId?: number;
}
