import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { Order } from '../order/entities/order.entity';
import { HealthRecord } from '../health-record/entities/health-record.entity';
import { Service } from '../services/entities/service.entity';

@Injectable()
export class StatisticsService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(HealthRecord)
        private readonly healthRecordRepository: Repository<HealthRecord>,
        @InjectRepository(Service)
        private readonly serviceRepository: Repository<Service>,
    ) { }

    async getDashboardData() {
        // 1. 用户统计
        const elderlyCount = await this.userRepository.count({
            where: { role: 1 },
        });
        const familyCount = await this.userRepository.count({
            where: { role: 2 },
        });
        const merchantCount = await this.userRepository.count({
            where: { role: 3 },
        });

        // 2. 订单统计
        const now = new Date();
        // 今日零点
        const todayStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
        );

        // 本周一零点
        const weekStart = new Date(todayStart);
        const day = weekStart.getDay() || 7; // getDay() returns 0 for Sunday
        weekStart.setDate(weekStart.getDate() - day + 1);

        // 本月一日零点
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const dailyOrders = await this.orderRepository.count({
            where: { createdAt: MoreThanOrEqual(todayStart) },
        });
        const weeklyOrders = await this.orderRepository.count({
            where: { createdAt: MoreThanOrEqual(weekStart) },
        });
        const monthlyOrders = await this.orderRepository.count({
            where: { createdAt: MoreThanOrEqual(monthStart) },
        });

        // 状态统计 (根据文档: 待处理等)
        const pendingOrders = await this.orderRepository.count({
            where: { status: 0 },
        }); // 0-待接单
        const completedOrders = await this.orderRepository.count({
            where: { status: 4 },
        }); // 4-已完成 (根据order entity)

        const totalOrders = await this.orderRepository.count();

        // 3. 健康预警统计
        const healthWarnings = await this.healthRecordRepository.count({
            where: { isAbnormal: 1 },
        });

        // 4. 服务类型分布统计 (1-生活服务 2-药品服务 3-医护服务)
        const lifeServices = await this.serviceRepository.count({
            where: { type: 1 },
        });
        const medicineServices = await this.serviceRepository.count({
            where: { type: 2 },
        });
        const medicalServices = await this.serviceRepository.count({
            where: { type: 3 },
        });

        // 组装返回数据标准格式建议与前端图表匹配
        return {
            users: {
                elderly: elderlyCount,
                family: familyCount,
                merchant: merchantCount,
                total: elderlyCount + familyCount + merchantCount,
            },
            orders: {
                daily: dailyOrders,
                weekly: weeklyOrders,
                monthly: monthlyOrders,
                pending: pendingOrders,
                completed: completedOrders,
                total: totalOrders,
            },
            health: {
                warnings: healthWarnings,
            },
            services: {
                life: lifeServices,
                medicine: medicineServices,
                medical: medicalServices,
                total: lifeServices + medicineServices + medicalServices,
            },
        };
    }

    async getMerchantStats(merchantId: number) {
        // 1. 待处理订单
        const pendingOrders = await this.orderRepository.count({
            where: { merchantId: merchantId.toString(), status: 0 },
        });

        // 2. 今日营收 (已完成状态)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayOrders = await this.orderRepository.find({
            where: {
                merchantId: merchantId.toString(),
                status: 4, // 4-已完成
                createdAt: MoreThanOrEqual(todayStart)
            },
        });
        const todayIncome = todayOrders.reduce((sum, order) => {
            const price = order.serviceSnapshot?.price || 0;
            return sum + Number(price);
        }, 0);

        // 3. 活跃服务数
        const activeServices = await this.serviceRepository.count({
            where: { merchantId, status: 1 },
        });

        // 4. 订单状态分布
        const allOrders = await this.orderRepository.find({
            where: { merchantId: merchantId.toString() },
        });

        const distribution = {
            pending: 0,
            processing: 0,
            completed: 0,
            canceled: 0
        };

        allOrders.forEach(order => {
            if (order.status === 0) distribution.pending++;
            else if ([1, 2, 3].includes(order.status)) distribution.processing++;
            else if (order.status === 4) distribution.completed++;
            else if (order.status === 5) distribution.canceled++;
        });

        return {
            pendingOrders,
            todayIncome,
            activeServices,
            totalOrders: allOrders.length,
            distribution
        };
    }

    async getFamilyStats(userId: number) {
        const familyUser = await this.userRepository.findOneBy({ id: userId });
        if (!familyUser) return null;

        // 提取关联老人账号: family_zhangsan_son -> elderly_zhangsan
        const parts = familyUser.username.split('_');
        if (parts.length < 2) return null;
        const elderlyUsername = parts[1];
        const elderlyUser = await this.userRepository.findOneBy({
            username: `elderly_${elderlyUsername}`
        });

        if (!elderlyUser) return null;

        // 1. 最新健康数据
        const latestHealth = await this.healthRecordRepository.findOne({
            where: { elderlyId: elderlyUser.id },
            order: { recordTime: 'DESC' }
        });

        // 2. 健康历史趋势 (最近7条)
        const healthHistory = await this.healthRecordRepository.find({
            where: { elderlyId: elderlyUser.id },
            order: { recordTime: 'DESC' },
            take: 7
        });

        // 3. 异常提醒数
        const abnormalCount = await this.healthRecordRepository.count({
            where: { elderlyId: elderlyUser.id, isAbnormal: 1 }
        });

        // 4. 最近订单 (5条)
        const latestOrders = await this.orderRepository.find({
            where: { elderlyId: elderlyUser.id.toString() },
            order: { createdAt: 'DESC' },
            take: 5
        });

        return {
            elderly: {
                id: elderlyUser.id,
                nickname: elderlyUser.nickname,
                realName: elderlyUser.realName
            },
            latestHealth,
            healthHistory: healthHistory.reverse(),
            abnormalCount,
            latestOrders
        };
    }
}
