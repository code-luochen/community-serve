# NestJS Business Logic & Component Standards

## 1. Entity (Domain)

Entities represent the core business object. Use `BaseEntity` and TypeORM decorators.

```typescript
import { BaseEntity } from 'typeorm';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('table_name')
export class FeatureEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Primary Key' })
  id: number;

  @Column()
  @ApiProperty({ description: 'Business property' })
  name: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
```

## 2. DTOs (Data Transfer Objects)

Strict input validation using `class-validator`.

### CreateFeatureDto
```typescript
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFeatureDto {
  @ApiProperty({ example: 'My Feature', description: 'Name of the feature' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false, description: 'Optional description' })
  @IsString()
  @IsOptional()
  description?: string;
}
```

### UpdateFeatureDto
```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateFeatureDto } from './create-feature.dto';

export class UpdateFeatureDto extends PartialType(CreateFeatureDto) {}
```

## 3. Service (Business Logic)

Encapsulate ALL business rules here. Handle exceptions explicitly.

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureEntity } from '../entities/feature.entity';
import { CreateFeatureDto } from '../dto/create-feature.dto';

@Injectable()
export class FeatureService {
  constructor(
    @InjectRepository(FeatureEntity)
    private readonly repository: Repository<FeatureEntity>,
  ) {}

  async create(createDto: CreateFeatureDto): Promise<FeatureEntity> {
    // Business logic: check duplicates, specific rules, etc.
    const exists = await this.repository.findOneBy({ name: createDto.name });
    if (exists) {
      throw new BadRequestException('Feature with this name already exists');
    }
    
    // Save
    const entity = this.repository.create(createDto);
    return this.repository.save(entity);
  }

  async findOne(id: number): Promise<FeatureEntity> {
    const entity = await this.repository.findOneBy({ id });
    if (!entity) {
      throw new NotFoundException(`Feature #${id} not found`);
    }
    return entity;
  }

  async update(id: number, updateDto: UpdateFeatureDto): Promise<FeatureEntity> {
    // 1. Verify existence first
    const entity = await this.findOne(id);
    
    // 2. Merge changes
    this.repository.merge(entity, updateDto);
    
    // 3. Save
    return this.repository.save(entity);
  }
}
```

## 4. Controller (API Interface)

RESTful routing, Swagger documentation, parameter validation.

```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FeatureService } from './feature.service';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';

@ApiTags('Features')
@Controller('features')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new feature' })
  create(@Body() createDto: CreateFeatureDto) {
    return this.featureService.create(createDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a feature by ID' })
  findOne(@Param('id') id: string) {
    return this.featureService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a feature' })
  update(@Param('id') id: string, @Body() updateDto: UpdateFeatureDto) {
    return this.featureService.update(+id, updateDto);
  }
}
```

## 5. Module (Registration)

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureService } from './feature.service';
import { FeatureController } from './feature.controller';
import { FeatureEntity } from './entities/feature.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FeatureEntity])],
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService], // Export if needed by other modules
})
export class FeatureModule {}
```
