import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuditRepository {
    async createAuditLog(alertId: string, action: string, details?: any): Promise<void> {
        await prisma.auditLog.create({
            data: {
                alertId,
                action,
                details: details || {},
            },
        });
    }

    async getAuditLogs(alertId: string) {
        return prisma.auditLog.findMany({
            where: { alertId },
            orderBy: { timestamp: 'desc' },
        });
    }
}
