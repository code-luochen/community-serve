
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async findOne(username: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { username },
            select: ['id', 'username', 'password', 'email', 'createdAt', 'updatedAt'] // Explicitly select password for auth check
        });
    }

    async findById(id: string): Promise<User | null> {
        return this.usersRepository.findOneBy({ id });
    }

    async create(userData: Partial<User>): Promise<User> {
        // Hash password before saving
        if (userData.password) {
            const salt = await bcrypt.genSalt();
            userData.password = await bcrypt.hash(userData.password, salt);
        }
        const user = this.usersRepository.create(userData);
        return this.usersRepository.save(user);
    }
}
