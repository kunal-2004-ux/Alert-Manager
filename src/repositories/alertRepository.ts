import { PrismaClient, Alert, AlertStatus, Prisma } from '@prisma/client';
import { withRetry } from '../utils/retry';
import { dashboardCache } from '../services/cacheService';
import { BaseRepository } from './baseRepository';

const prisma = new PrismaClient();

export class AlertRepository extends BaseRepository<Alert, Prisma.AlertCreateInput> {
    constructor() {
        super('alert');
    }

    // Override create to invalidate cache
    async createAlert(data: Prisma.AlertCreateInput): Promise<Alert> {
        const alert = await withRetry(() => prisma.alert.create({ data }));
        // Invalidate dashboard caches when new alert is created
        dashboardCache.del(['alert_summary', 'top_drivers', 'alert_trends']);
        return alert;
    }

    async findById(id: string): Promise<Alert | null> {
        return prisma.alert.findUnique({
            where: { id },
        });
    }

    async findByFingerprint(fingerprint: string): Promise<Alert | null> {
        return prisma.alert.findUnique({
            where: { fingerprint },
        });
    }

    async countAlerts(sourceType: string, startTime: Date, metadataFilter: any, driverId?: string, category?: string): Promise<number> {
        const whereClause: any = {
            sourceType,
            timestamp: {
                gte: startTime,
            },
        };

        if (category) {
            whereClause.category = category;
        }

        if (driverId) {
            whereClause.OR = [
                { driverId: driverId },
                { metadata: { path: ['driverId'], equals: driverId } }
            ];
        } else if (metadataFilter && Object.keys(metadataFilter).length > 0) {
            whereClause.metadata = {
                contains: metadataFilter
            };
        }

        return prisma.alert.count({
            where: whereClause,
        });
    }

    async findOpenAlerts(): Promise<Alert[]> {
        return prisma.alert.findMany({
            where: {
                status: {
                    in: [AlertStatus.OPEN, AlertStatus.ESCALATED],
                },
            },
        });
    }

    async findOpenAlertsByDriverAndCategory(driverId: string, category: string): Promise<Alert[]> {
        return prisma.alert.findMany({
            where: {
                status: {
                    in: [AlertStatus.OPEN, AlertStatus.ESCALATED],
                },
                category: category,
                OR: [
                    { driverId: driverId },
                    { metadata: { path: ['driverId'], equals: driverId } }
                ]
            },
        });
    }

    async updateAlert(id: string, data: Partial<Alert>): Promise<Alert> {
        const updated = await prisma.alert.update({
            where: { id },
            data: data as any,
        });
        // Invalidate caches on update
        dashboardCache.del(['alert_summary', 'top_drivers', 'alert_trends']);
        return updated;
    }

    async getAlertSummary() {
        const cacheKey = 'alert_summary';
        const cached = dashboardCache.get(cacheKey);
        if (cached) return cached;

        const statusCounts = await prisma.alert.groupBy({
            by: ['status'],
            _count: {
                status: true,
            },
        });

        const severityCounts = await prisma.alert.groupBy({
            by: ['severity'],
            _count: {
                severity: true,
            },
        });

        const result = {
            byStatus: statusCounts.reduce((acc, curr) => ({ ...acc, [curr.status]: curr._count.status }), {}),
            bySeverity: severityCounts.reduce((acc, curr) => ({ ...acc, [curr.severity]: curr._count.severity }), {}),
        };

        dashboardCache.set(cacheKey, result);
        return result;
    }

    async getTopDrivers(limit: number = 5) {
        // No caching - always fetch fresh data
        const result: any[] = await prisma.$queryRaw`
            SELECT 
                COALESCE("driverId", metadata->>'driverId') as "driverId",
                COUNT(*) FILTER (WHERE status = 'OPEN')::int as "openAlerts",
                COUNT(*) FILTER (WHERE status = 'ESCALATED')::int as "escalatedAlerts",
                COUNT(*)::int as "totalAlerts"
            FROM "Alert"
            WHERE status IN ('OPEN', 'ESCALATED')
            AND COALESCE("driverId", metadata->>'driverId') IS NOT NULL
            GROUP BY COALESCE("driverId", metadata->>'driverId')
            ORDER BY "totalAlerts" DESC
            LIMIT ${limit}
        `;

        // Add timestamp to indicate data freshness
        return {
            drivers: result,
            updatedAt: new Date().toISOString()
        };
    }

    async getResolvedAlerts(since?: Date) {
        const where: any = {
            status: {
                in: [AlertStatus.AUTO_CLOSED, AlertStatus.RESOLVED]
            },
        };

        if (since) {
            where.timestamp = {
                gte: since,
            };
        }

        return prisma.alert.findMany({
            where,
            orderBy: {
                timestamp: 'desc',
            },
            take: 50, // Limit to recent 50
        });
    }

    async getAlertTrends(range: '24h' | '7d' = '24h', timezoneOffset: number = 0) {
        const cacheKey = `alert_trends_${range}_${timezoneOffset}`;
        const cached = dashboardCache.get(cacheKey);
        if (cached) return cached;

        const startDate = new Date();
        let unit = 'hour';

        if (range === '7d') {
            startDate.setDate(startDate.getDate() - 7);
            unit = 'day';
        } else {
            startDate.setHours(startDate.getHours() - 24);
            unit = 'hour';
        }

        // Actually, for simplicity and safety with $queryRaw:
        console.log('getAlertTrends params:', { range, timezoneOffset, startDate, unit });

        try {
            const result = await prisma.$queryRawUnsafe(`
                SELECT 
                    (DATE_TRUNC('${unit}', timestamp - ($2 * interval '1 minute')) + ($2 * interval '1 minute')) as "date",
                    status,
                    COUNT(*)::int as "count"
                FROM "Alert"
                WHERE timestamp >= $1
                GROUP BY 1, 2
                ORDER BY 1 ASC
            `, startDate, timezoneOffset);

            console.log('getAlertTrends result:', result);

            dashboardCache.set(cacheKey, result, 60); // Cache trends for 1 minute
            return result;
        } catch (error) {
            console.error('getAlertTrends error:', error);
            throw error;
        }
    }

    async getRecentEvents(limit: number = 20) {
        // Fetching recent audit logs for a stream of events
        return prisma.auditLog.findMany({
            orderBy: {
                timestamp: 'desc',
            },
            take: limit,
        });
    }
}
