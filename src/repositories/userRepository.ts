import { PrismaClient, User, Prisma } from '@prisma/client';
import { BaseRepository } from './baseRepository';

const prisma = new PrismaClient();

export class UserRepository extends BaseRepository<User, Prisma.UserCreateInput> {
    constructor() {
        super('user');
    }

    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email },
        });
    }

    // create is inherited
    async createUser(data: Prisma.UserCreateInput): Promise<User> {
        return this.create(data);
    }
}
