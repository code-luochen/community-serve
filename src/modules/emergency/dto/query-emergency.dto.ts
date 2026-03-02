import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryEmergencyDto {
    @ApiProperty({ required: false, description: '根据老年人ID筛选' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    elderlyId?: number;

    @ApiProperty({ required: false, description: '根据状态筛选：0-待处理 1-处理中 2-已处理' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    status?: number;

    @ApiProperty({ required: false, description: '页码', default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    page?: number;

    @ApiProperty({ required: false, description: '每页条数', default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    limit?: number;
}
