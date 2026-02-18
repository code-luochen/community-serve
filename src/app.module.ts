import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DATABASE_HOST') ?? '127.0.0.1',
        port: parseInt(configService.get<string>('DATABASE_PORT') ?? '3306', 10),
        username: configService.get<string>('DATABASE_USERNAME') ?? 'root',
        password: configService.get<string>('DATABASE_PASSWORD') ?? '',
        database: configService.get<string>('DATABASE_NAME') ?? 'community',
        autoLoadEntities: true,
        synchronize: true, // Only for development
        timezone: '+08:00',
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
