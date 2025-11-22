import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export abstract class BaseRepository<T, CreateInput> {
    protected model: any;

    constructor(modelName: keyof PrismaClient) {
        this.model = (prisma as any)[modelName];
    }

    async create(data: CreateInput): Promise<T> {
        return this.model.create({ data });
    }

    async findById(id: string): Promise<T | null> {
        return this.model.findUnique({
            where: { id },
        });
    }

    async findAll(): Promise<T[]> {
        return this.model.findMany();
    }
}
