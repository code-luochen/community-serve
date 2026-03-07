import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Community } from './entities/community.entity';
import { HouseDict } from './entities/house-dict.entity';
import {
  CreateCommunityDto,
  UpdateCommunityDto,
} from './dto/community.dto';
import {
  CreateHouseDictDto,
  HouseDictQueryDto,
} from './dto/house-dict.dto';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(Community)
    private readonly communityRepo: Repository<Community>,
    @InjectRepository(HouseDict)
    private readonly houseDictRepo: Repository<HouseDict>,
  ) {}

  // ────────── Community CRUD ──────────

  async createCommunity(dto: CreateCommunityDto): Promise<Community> {
    const existing = await this.communityRepo.findOneBy({ name: dto.name });
    if (existing) {
      throw new ConflictException(`小区"${dto.name}"已存在`);
    }
    const community = this.communityRepo.create(dto);
    return this.communityRepo.save(community);
  }

  async findAllCommunities(): Promise<Community[]> {
    return this.communityRepo.find({ order: { id: 'ASC' } });
  }

  async findOneCommunity(id: number): Promise<Community> {
    const community = await this.communityRepo.findOne({
      where: { id },
      relations: ['houses'],
    });
    if (!community) {
      throw new NotFoundException(`小区 #${id} 不存在`);
    }
    return community;
  }

  async updateCommunity(id: number, dto: UpdateCommunityDto): Promise<Community> {
    const community = await this.findOneCommunity(id);
    Object.assign(community, dto);
    return this.communityRepo.save(community);
  }

  async deleteCommunity(id: number): Promise<void> {
    const community = await this.findOneCommunity(id);
    await this.communityRepo.remove(community);
  }

  // ────────── HouseDict CRUD ──────────

  async createHouse(dto: CreateHouseDictDto): Promise<HouseDict> {
    // Verify community exists
    const community = await this.communityRepo.findOneBy({ id: dto.communityId });
    if (!community) {
      throw new NotFoundException(`小区 #${dto.communityId} 不存在`);
    }
    const house = this.houseDictRepo.create(dto);
    return this.houseDictRepo.save(house);
  }

  async batchCreateHouses(items: CreateHouseDictDto[]): Promise<HouseDict[]> {
    // Verify all communityIds exist
    const communityIds = [...new Set(items.map((i) => i.communityId))];
    for (const cid of communityIds) {
      const exists = await this.communityRepo.findOneBy({ id: cid });
      if (!exists) throw new NotFoundException(`小区 #${cid} 不存在`);
    }
    const houses = items.map((item) => this.houseDictRepo.create(item));
    return this.houseDictRepo.save(houses);
  }

  async findHouses(query: HouseDictQueryDto): Promise<HouseDict[]> {
    const qb = this.houseDictRepo
      .createQueryBuilder('h')
      .leftJoinAndSelect('h.community', 'community')
      .orderBy('h.communityId', 'ASC')
      .addOrderBy('h.buildingNo', 'ASC')
      .addOrderBy('h.unitNo', 'ASC')
      .addOrderBy('h.roomNo', 'ASC');

    if (query.communityId) {
      qb.andWhere('h.communityId = :communityId', { communityId: query.communityId });
    }
    if (query.buildingNo) {
      qb.andWhere('h.buildingNo = :buildingNo', { buildingNo: query.buildingNo });
    }
    return qb.getMany();
  }

  /**
   * 返回级联树状结构供前端级联选择器使用：
   * { communityId, communityName, buildings: [{ buildingNo, units: [{ unitNo, rooms: [roomNo] }] }] }
   */
  async getAddressTree(): Promise<object[]> {
    const communities = await this.communityRepo.find({
      relations: ['houses'],
      order: { id: 'ASC' },
    });

    return communities.map((community) => {
      const buildingMap = new Map<string, Map<string, { id: number; roomNo: string }[]>>();

      for (const house of community.houses) {
        if (!buildingMap.has(house.buildingNo)) {
          buildingMap.set(house.buildingNo, new Map());
        }
        const unitMap = buildingMap.get(house.buildingNo)!;
        const unitKey = house.unitNo ?? '__no_unit__';
        if (!unitMap.has(unitKey)) {
          unitMap.set(unitKey, []);
        }
        unitMap.get(unitKey)!.push({ id: house.id, roomNo: house.roomNo });
      }

      const buildings = Array.from(buildingMap.entries()).map(
        ([buildingNo, unitMap]) => ({
          buildingNo,
          units: Array.from(unitMap.entries()).map(([unitNo, rooms]) => ({
            unitNo: unitNo === '__no_unit__' ? null : unitNo,
            rooms, // Now an array of { id, roomNo }
          })),
        }),
      );

      return {
        communityId: community.id,
        communityName: community.name,
        communityAddress: community.address,
        buildings,
      };
    });
  }

  /**
   * 根据 houseId 获取可读地址快照文本
   */
  async getHouseSnapshot(houseId: number): Promise<string> {
    const house = await this.houseDictRepo.findOne({
      where: { id: houseId },
      relations: ['community'],
    });
    if (!house) {
      throw new NotFoundException(`房屋地址 #${houseId} 不存在`);
    }
    const parts = [house.community.name, house.buildingNo];
    if (house.unitNo) parts.push(house.unitNo);
    parts.push(house.roomNo);
    return parts.join('-');
  }

  async findOneHouse(id: number): Promise<HouseDict> {
    const house = await this.houseDictRepo.findOne({
      where: { id },
      relations: ['community'],
    });
    if (!house) {
      throw new NotFoundException(`房屋地址 #${id} 不存在`);
    }
    return house;
  }

  async deleteHouse(id: number): Promise<void> {
    const house = await this.findOneHouse(id);
    await this.houseDictRepo.remove(house);
  }
}
