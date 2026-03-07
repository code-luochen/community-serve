import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './modules/users/users.service';
import { ElderlyProfileService } from './modules/elderly-profile/elderly-profile.service';
import { FamilyBindingService } from './modules/family-binding/family-binding.service';
import { ServicesService } from './modules/services/services.service';
import { OrderService } from './modules/order/order.service';
import { HealthRecordService } from './modules/health-record/health-record.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const usersService = app.get(UsersService);
  const elderlyProfileService = app.get(ElderlyProfileService);
  const familyBindingService = app.get(FamilyBindingService);
  const servicesService = app.get(ServicesService);
  const orderService = app.get(OrderService);
  const healthRecordService = app.get(HealthRecordService);

  try {
    console.log('--- 开始添加测试数据 ---');

    // 1. 创建老人账号
    console.log('1. 创建老人账号...');
    let elderlyUser;
    try {
      elderlyUser = await usersService.create({
        username: 'elderly_test2',
        password: 'password123',
        role: 1,
        nickname: '王大爷2',
        realName: '王建国2',
      });
      console.log('老人账号创建成功！ID:', elderlyUser.id);
    } catch (e) {
      console.log('老人账号可能已存在，尝试获取...');
      elderlyUser = await usersService.findOne('elderly_test2');
    }

    // 2. 创建老人档案
    if (elderlyUser) {
        console.log('2. 建档...');
        try {
          await elderlyProfileService.createOrUpdateForUser(elderlyUser.id, {
            age: 72,
            gender: 1,
            // houseId: 1, // 可在创建小区和房屋字典后再绑定
            emergencyContact: '王小明',
            emergencyPhone: '13900139000',
          });
          console.log('老人档案创建/更新成功！');
        } catch (e) {
          console.log('老人档案处理异常:', e.message);
        }
    }

    // 3. 创建家属账号
    console.log('3. 创建家属账号...');
    let familyUser;
    try {
      familyUser = await usersService.create({
        username: 'family_test2',
        password: 'password123',
        role: 2,
        nickname: '王小明2',
        realName: '王小明2',
      });
      console.log('家属账号创建成功！ID:', familyUser.id);
    } catch (e) {
      console.log('家属账号可能已存在，尝试获取...');
      familyUser = await usersService.findOne('family_test2');
    }

    // 4. 绑定关系
    if (familyUser && elderlyUser) {
        console.log('4. 建立家庭绑定关系...');
        try {
            await familyBindingService.bindElderly(familyUser.id, {
                username: elderlyUser.username,
                relation: '父亲'
            });
            console.log('绑定关系成功！');
        } catch (e) {
            console.log('绑定关系处理异常:', e.message);
        }
    }

    // 5. 创建商户账号
    console.log('5. 创建商户账号...');
    let merchantUser;
    try {
      merchantUser = await usersService.create({
        username: 'merchant_test2',
        password: 'password123',
        role: 3,
        nickname: '社区健康服务站2',
        realName: '张站长2',
      });
      console.log('商户账号创建成功！ID:', merchantUser.id);
    } catch (e) {
      console.log('商户账号可能已存在，尝试获取...');
      merchantUser = await usersService.findOne('merchant_test2');
    }

    // 6. 发布服务
    let service;
    if (merchantUser) {
        console.log('6. 发布服务...');
        try {
            service = await servicesService.create(merchantUser.id.toString(), {
                name: '上门量血压测血糖',
                description: '专业护士上门，提供血压、血糖测量服务。',
                price: 50,
                type: 3, // 医护服务
                imageUrl: '',
            });
            console.log('服务发布成功！ID:', service.id);
        } catch (e) {
            console.log('发布服务失败:', e.message);
        }
    }

    // 7. 发起订单
    if (elderlyUser && merchantUser && service) {
        console.log('7. 创建订单...');
        try {
            const order = await orderService.create({
                elderlyId: elderlyUser.id.toString(),
                merchantId: merchantUser.id.toString(),
                serviceId: service.id,
                serviceSnapshot: { name: service.name, price: service.price },
                serviceTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
                // houseId 未设定，自动从老人档案读取
                remark: '请带上新的测血糖仪'
            });
            console.log('订单创建成功！ID:', order.id);
            
            // 模拟商户接单
            await orderService.updateStatus(order.id, { status: 1 }); // 1-已接单
            console.log('商户已接单！');
            
            // 模拟服务完成
            await orderService.updateStatus(order.id, { status: 3 }); // 3-已完成
            console.log('订单已完成！');
        } catch (e) {
            console.log('订单处理失败:', e.message);
        }
    }

    // 8. 录入健康数据
    if (elderlyUser) {
        console.log('8. 录入健康数据...');
        try {
            await healthRecordService.create({
                elderlyId: elderlyUser.id.toString(),
                heartRate: 75,
                systolicBp: 135,
                diastolicBp: 85,
                bloodSugar: 6.1,
                temperature: 36.5,
            });
            
            await healthRecordService.create({
                elderlyId: elderlyUser.id.toString(),
                heartRate: 88,
                systolicBp: 145, // 偏高
                diastolicBp: 95,
                bloodSugar: 5.8,
                temperature: 36.6,
            });
            console.log('健康数据录入成功！');
        } catch(e) {
            console.log('健康数据录入失败:', e.message);
        }
    }

    // 9. 创建管理员账号
    console.log('9. 创建管理员账号...');
    let adminUser;
    try {
      adminUser = await usersService.create({
        username: 'admin_test',
        password: 'password123',
        role: 4,
        nickname: '超级管理员',
        realName: '系统管理员',
      });
      console.log('管理员账号创建成功！ID:', adminUser.id);
    } catch (e) {
      console.log('管理员账号可能已存在，尝试获取...');
      adminUser = await usersService.findOne('admin_test');
    }

    console.log('--- 测试数据添加完成 ---');
  } catch (error) {
    console.error('执行出错：', error);
  } finally {
    await app.close();
  }
}

bootstrap();
