import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmergencyService } from './emergency.service';
import { EmergencyController } from './emergency.controller';
import { EmergencyLog } from './entities/emergency-log.entity';

@Module({
    imports: [TypeOrmModule.forFeature([EmergencyLog])],
    controllers: [EmergencyController],
    providers: [EmergencyService],
    exports: [EmergencyService],
})
export class EmergencyModule { }
