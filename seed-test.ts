import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { UsersService } from './src/modules/users/users.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const usersService = app.get(UsersService);

    const testUsers = [
        {
            username: 'elderly_zhangsan',
            password: 'Elderly@2026',
            nickname: '张爷爷',
            role: 1, // Elderly
        },
        {
            username: 'admin_xiaoqu01',
            password: 'Admin@2026',
            nickname: '小区管理员',
            role: 4, // Admin
        }
    ];

    for (const userData of testUsers) {
        const existing = await usersService.findOne(userData.username);
        if (!existing) {
            console.log(`Creating test user: ${userData.username}`);
            await usersService.create(userData);
        } else {
            console.log(`User ${userData.username} already exists.`);
        }
    }

    await app.close();
}

bootstrap().catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
});
