import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthRecord } from './entities/health-record.entity';
import { CreateHealthRecordDto } from './dto/create-health-record.dto';
import { QueryHealthRecordDto } from './dto/query-health-record.dto';

export interface HealthRecordListResult {
    items: HealthRecord[];
    total: number;
    page: number;
    limit: number;
}

@Injectable()
export class HealthRecordService {
    constructor(
        @InjectRepository(HealthRecord)
        private readonly healthRecordRepository: Repository<HealthRecord>,
    ) { }

    // BE-13 & BE-14: 健康数据录入 & 健康阈值预警
    async create(createDto: CreateHealthRecordDto): Promise<HealthRecord> {
        let isAbnormal = 0;
        const abnormalTypes: string[] = [];

        // 血压异常判断
        if (
            createDto.systolicBp !== undefined ||
            createDto.diastolicBp !== undefined
        ) {
            if (
                (createDto.systolicBp !== undefined && createDto.systolicBp > 140) ||
                (createDto.diastolicBp !== undefined && createDto.diastolicBp > 90)
            ) {
                isAbnormal = 1;
                abnormalTypes.push('hypertension');
            } else if (
                (createDto.systolicBp !== undefined && createDto.systolicBp < 90) ||
                (createDto.diastolicBp !== undefined && createDto.diastolicBp < 60)
            ) {
                isAbnormal = 1;
                abnormalTypes.push('hypotension');
            }
        }

        // 心率异常判断
        if (createDto.heartRate !== undefined) {
            if (createDto.heartRate > 100) {
                isAbnormal = 1;
                abnormalTypes.push('tachycardia');
            } else if (createDto.heartRate < 60) {
                isAbnormal = 1;
                abnormalTypes.push('bradycardia');
            }
        }

        // 血糖异常判断
        if (createDto.bloodSugar !== undefined) {
            if (createDto.bloodSugar > 7.0) {
                isAbnormal = 1;
                abnormalTypes.push('hyperglycemia');
            } else if (createDto.bloodSugar < 3.9) {
                isAbnormal = 1;
                abnormalTypes.push('hypoglycemia');
            }
        }

        // 体温异常判断
        if (createDto.temperature !== undefined) {
            if (createDto.temperature > 37.3) {
                isAbnormal = 1;
                abnormalTypes.push('fever');
            }
        }

        const abnormalType =
            abnormalTypes.length > 0 ? abnormalTypes.join(',') : undefined;

        const record = this.healthRecordRepository.create({
            elderlyId: parseInt(createDto.elderlyId, 10),
            systolicBp: createDto.systolicBp,
            diastolicBp: createDto.diastolicBp,
            heartRate: createDto.heartRate,
            bloodSugar: createDto.bloodSugar,
            temperature: createDto.temperature,
            isAbnormal,
            abnormalType,
        });

        return await this.healthRecordRepository.save(record);
    }

    // BE-15: 健康数据查询
    async findAll(query: QueryHealthRecordDto): Promise<HealthRecordListResult> {
        const { elderlyId, isAbnormal, page = 1, limit = 10 } = query;
        const queryBuilder =
            this.healthRecordRepository.createQueryBuilder('health_record');

        if (elderlyId) {
            queryBuilder.andWhere('health_record.elderlyId = :elderlyId', {
                elderlyId,
            });
        }
        if (isAbnormal !== undefined) {
            queryBuilder.andWhere('health_record.isAbnormal = :isAbnormal', {
                isAbnormal,
            });
        }

        queryBuilder.orderBy('health_record.recordTime', 'DESC');
        queryBuilder.skip((page - 1) * limit).take(limit);

        const [items, total] = await queryBuilder.getManyAndCount();

        return {
            items,
            total,
            page,
            limit,
        };
    }
}
