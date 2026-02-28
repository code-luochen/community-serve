import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { OrderModule } from './modules/order/order.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ElderlyProfileModule } from './modules/elderly-profile/elderly-profile.module';
import { ServicesModule } from './modules/services/services.module';

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
        port: parseInt(
          configService.get<string>('DATABASE_PORT') ?? '3306',
          10,
        ),
        username: configService.get<string>('DATABASE_USERNAME') ?? 'root',
        password: configService.get<string>('DATABASE_PASSWORD') ?? '',
        database: configService.get<string>('DATABASE_NAME') ?? 'community',
        autoLoadEntities: true,
        synchronize: true, // Only for development
        timezone: '+08:00',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    OrderModule,
    ElderlyProfileModule,
    ServicesModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
