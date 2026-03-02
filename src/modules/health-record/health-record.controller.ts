import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HealthRecordService } from './health-record.service';
import { CreateHealthRecordDto } from './dto/create-health-record.dto';
import { QueryHealthRecordDto } from './dto/query-health-record.dto';

@ApiTags('健康监测 (Health Record)')
@Controller('health-record')
export class HealthRecordController {
  constructor(private readonly healthRecordService: HealthRecordService) {}

  @Post()
  @ApiOperation({ summary: 'BE-13/BE-14 健康数据录入与异常判断' })
  create(@Body() createHealthRecordDto: CreateHealthRecordDto) {
    return this.healthRecordService.create(createHealthRecordDto);
  }

  @Get()
  @ApiOperation({ summary: 'BE-15 健康数据查询 (支持个人与家属)' })
  findAll(@Query() query: QueryHealthRecordDto) {
    return this.healthRecordService.findAll(query);
  }
}
