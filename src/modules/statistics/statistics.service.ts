import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { Order } from '../order/entities/order.entity';
import { HealthRecord } from '../health-record/entities/health-record.entity';
import { Service } from '../services/entities/service.entity';
import { FamilyBinding } from '../family-binding/entities/family-binding.entity';

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
    @InjectRepository(FamilyBinding)
    private readonly bindingRepository: Repository<FamilyBinding>,
  ) {}

  async getDashboardData(communityId?: number) {
    // Build community filter for user queries
    const communityFilter = communityId ? { communityId } : {};

    // 1. 用户统计
    const elderlyCount = await this.userRepository.count({
      where: { role: 1, ...communityFilter },
    });
    const familyCount = await this.userRepository.count({
      where: { role: 2, ...communityFilter },
    });
    const merchantCount = await this.userRepository.count({
      where: { role: 3, ...communityFilter },
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



    // If filtering by community, get elderly IDs in that community first
    let elderlyIdsInCommunity: string[] | undefined;
    if (communityId) {
      const elderlyUsers = await this.userRepository.find({
        where: { role: 1, communityId },
        select: ['id'],
      });
      elderlyIdsInCommunity = elderlyUsers.map((u) => u.id.toString());
    }

    // 3. 健康预警统计
    let healthWarnings: number;
    if (elderlyIdsInCommunity !== undefined) {
      if (elderlyIdsInCommunity.length === 0) {
        healthWarnings = 0;
      } else {
        healthWarnings = await this.healthRecordRepository
          .createQueryBuilder('hr')
          .where('hr.elderly_id IN (:...ids)', { ids: elderlyIdsInCommunity })
          .andWhere('hr.is_abnormal = :ab', { ab: 1 })
          .getCount();
      }
    } else {
      healthWarnings = await this.healthRecordRepository.count({
        where: { isAbnormal: 1 },
      });
    }

    // 4. 服务类型分布统计 (1-生活服务 2-药品服务 3-医护服务)
    // For community filter, filter by merchant communityId
    const merchantFilter = communityId
      ? await this.userRepository
          .find({ where: { role: 3, communityId }, select: ['id'] })
          .then((ms) => ms.map((m) => m.id))
      : undefined;

    const buildServiceFilter = (type: number) =>
      merchantFilter && merchantFilter.length > 0
        ? this.serviceRepository
            .createQueryBuilder('s')
            .where('s.type = :type', { type })
            .andWhere('s.merchant_id IN (:...ids)', { ids: merchantFilter })
            .getCount()
        : merchantFilter && merchantFilter.length === 0
          ? Promise.resolve(0)
          : this.serviceRepository.count({ where: { type } });

    const [lifeServices, medicineServices, medicalServices] = await Promise.all([
      buildServiceFilter(1),
      buildServiceFilter(2),
      buildServiceFilter(3),
    ]);

    // Order stats - filter by elderly in community
    const buildOrderCount = (where: object) => {
      if (elderlyIdsInCommunity !== undefined) {
        if (elderlyIdsInCommunity.length === 0) return Promise.resolve(0);
        return this.orderRepository
          .createQueryBuilder('o')
          .where('o.elderly_id IN (:...ids)', { ids: elderlyIdsInCommunity })
          .andWhere(where)
          .getCount();
      }
      return this.orderRepository.count({ where });
    };

    const dailyOrders = elderlyIdsInCommunity !== undefined
      ? (elderlyIdsInCommunity.length === 0 ? 0 : await this.orderRepository.createQueryBuilder('o').where('o.elderly_id IN (:...ids)', { ids: elderlyIdsInCommunity }).andWhere('o.created_at >= :d', { d: todayStart }).getCount())
      : await this.orderRepository.count({ where: { createdAt: MoreThanOrEqual(todayStart) } });

    const weeklyOrders = elderlyIdsInCommunity !== undefined
      ? (elderlyIdsInCommunity.length === 0 ? 0 : await this.orderRepository.createQueryBuilder('o').where('o.elderly_id IN (:...ids)', { ids: elderlyIdsInCommunity }).andWhere('o.created_at >= :d', { d: weekStart }).getCount())
      : await this.orderRepository.count({ where: { createdAt: MoreThanOrEqual(weekStart) } });

    const monthlyOrders = elderlyIdsInCommunity !== undefined
      ? (elderlyIdsInCommunity.length === 0 ? 0 : await this.orderRepository.createQueryBuilder('o').where('o.elderly_id IN (:...ids)', { ids: elderlyIdsInCommunity }).andWhere('o.created_at >= :d', { d: monthStart }).getCount())
      : await this.orderRepository.count({ where: { createdAt: MoreThanOrEqual(monthStart) } });

    const pendingOrders = elderlyIdsInCommunity !== undefined
      ? (elderlyIdsInCommunity.length === 0 ? 0 : await this.orderRepository.createQueryBuilder('o').where('o.elderly_id IN (:...ids)', { ids: elderlyIdsInCommunity }).andWhere('o.status = 0').getCount())
      : await this.orderRepository.count({ where: { status: 0 } });

    const completedOrders = elderlyIdsInCommunity !== undefined
      ? (elderlyIdsInCommunity.length === 0 ? 0 : await this.orderRepository.createQueryBuilder('o').where('o.elderly_id IN (:...ids)', { ids: elderlyIdsInCommunity }).andWhere('o.status = 4').getCount())
      : await this.orderRepository.count({ where: { status: 4 } });

    const totalOrders = elderlyIdsInCommunity !== undefined
      ? (elderlyIdsInCommunity.length === 0 ? 0 : await this.orderRepository.createQueryBuilder('o').where('o.elderly_id IN (:...ids)', { ids: elderlyIdsInCommunity }).getCount())
      : await this.orderRepository.count();

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
        createdAt: MoreThanOrEqual(todayStart),
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
      canceled: 0,
    };

    allOrders.forEach((order) => {
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
      distribution,
    };
  }

  async getFamilyStats(userId: number, elderlyId?: number) {
    const familyUser = await this.userRepository.findOneBy({ id: userId });
    if (!familyUser) return null;

    let elderlyUser: any;

    if (elderlyId) {
      // 校验该老人确实与该家属有有效绑定（status=1），防止越权查询
      const binding = await this.bindingRepository.findOne({
        where: { familyId: userId, elderlyId, status: 1 },
        relations: ['elderly'],
      });
      if (!binding || !binding.elderly) return null;
      elderlyUser = binding.elderly;
    } else {
      // 默认取最新的一条有效绑定老人
      const binding = await this.bindingRepository.findOne({
        where: { familyId: userId, status: 1 },
        relations: ['elderly'],
        order: { createdAt: 'DESC' },
      });
      if (!binding || !binding.elderly) return null;
      elderlyUser = binding.elderly;
    }

    // 1. 最新健康数据
    const latestHealth = await this.healthRecordRepository.findOne({
      where: { elderlyId: elderlyUser.id },
      order: { recordTime: 'DESC' },
    });

    // 2. 健康历史趋势 (最近7条)
    const healthHistory = await this.healthRecordRepository.find({
      where: { elderlyId: elderlyUser.id },
      order: { recordTime: 'DESC' },
      take: 7,
    });

    // 3. 异常提醒数
    const abnormalCount = await this.healthRecordRepository.count({
      where: { elderlyId: elderlyUser.id, isAbnormal: 1 },
    });

    // 4. 最近订单 (5条)
    const latestOrders = await this.orderRepository.find({
      where: { elderlyId: elderlyUser.id.toString() },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      elderly: {
        id: elderlyUser.id,
        nickname: elderlyUser.nickname,
        realName: elderlyUser.realName,
      },
      latestHealth,
      healthHistory: healthHistory.reverse(),
      abnormalCount,
      latestOrders,
    };
  }
}
