import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FamilyBinding } from './entities/family-binding.entity';
import { CreateBindingDto } from './dto/create-binding.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class FamilyBindingService {
  constructor(
    @InjectRepository(FamilyBinding)
    private readonly bindingRepository: Repository<FamilyBinding>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async bindElderly(
    familyId: number,
    dto: CreateBindingDto,
  ): Promise<FamilyBinding> {
    const elderly = await this.userRepository.findOne({
      where: { username: dto.username, role: 1 },
      relations: ['profile'],
    });

    if (!elderly) {
      throw new NotFoundException('找不到对应账号的老人');
    }

    const existingBinding = await this.bindingRepository.findOne({
      where: { familyId, elderlyId: elderly.id },
    });

    if (existingBinding) {
      if (existingBinding.status === 1) {
        throw new ConflictException('已经绑定过该老人');
      } else if (existingBinding.status === 2) {
        // 如果之前已解绑（哨兵记录），用户重新添加则恢复绑定
        existingBinding.status = 1;
        existingBinding.relation = dto.relation || '';
        return this.bindingRepository.save(existingBinding);
      }
    }

    const newBinding = this.bindingRepository.create({
      familyId,
      elderlyId: elderly.id,
      relation: dto.relation,
      status: 1,
    });

    return this.bindingRepository.save(newBinding);
  }

  async getMyElderlyList(familyId: number) {
    // 自动同步隐式绑定（基于 username 命名规则）
    // 关键逻辑：只有当数据库中 完全没有 该绑定对的记录时才自动插入。
    // 若已存在记录（无论 status 是 1 还是 2），说明用户曾经手动操作过，尊重用户意愿，不再自动重建。
    const familyUser = await this.userRepository.findOneBy({ id: familyId });
    if (familyUser && familyUser.username.startsWith('family_')) {
      const parts = familyUser.username.split('_');
      if (parts.length >= 2) {
        const elderlyUsername = parts[1];
        const elderlyUser = await this.userRepository.findOne({
          where: [
            { username: elderlyUsername, role: 1 },
            { username: `elderly_${elderlyUsername}`, role: 1 },
          ],
        });

        if (elderlyUser) {
          const existingBinding = await this.bindingRepository.findOne({
            where: { familyId, elderlyId: elderlyUser.id },
          });

          // 只在从未有过任何绑定记录时才自动插入（!existingBinding 才插）
          // 若 existingBinding.status === 2 说明用户曾主动解绑，不重建
          if (!existingBinding) {
            const newBinding = this.bindingRepository.create({
              familyId,
              elderlyId: elderlyUser.id,
              relation: parts[2] || '亲属(自动同步)',
              status: 1,
            });
            await this.bindingRepository.save(newBinding);
          }
        }
      }
    }

    // 只返回 status=1 的有效绑定
    return this.bindingRepository.find({
      where: { familyId, status: 1 },
      relations: ['elderly', 'elderly.profile'],
      order: { createdAt: 'DESC' },
    });
  }

  async unbind(familyId: number, elderlyId: number): Promise<void> {
    const binding = await this.bindingRepository.findOne({
      where: { familyId, elderlyId },
    });

    if (!binding) {
      throw new NotFoundException('绑定关系不存在');
    }

    // 将状态置为 2（已解绑），作为"哨兵记录"保留在数据库中。
    // 这样 getMyElderlyList 中的自动同步逻辑检测到 existingBinding != null，就不会重新插入绑定，
    //彻底阻止了"解绑后自动复活"的问题。
    binding.status = 2;
    await this.bindingRepository.save(binding);
  }

  async getMyFamilyList(elderlyId: number) {
    return this.bindingRepository.find({
      where: { elderlyId, status: 1 },
      relations: ['family'],
      order: { createdAt: 'DESC' },
    });
  }
}
