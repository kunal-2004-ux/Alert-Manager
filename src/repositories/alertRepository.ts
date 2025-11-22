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

    async countAlerts(sourceType: string, startTime: Date, metadataFilter: any): Promise<number> {
        const whereClause: any = {
            sourceType,
            timestamp: {
                gte: startTime,
            },
        };

        if (metadataFilter && Object.keys(metadataFilter).length > 0) {
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
        const cacheKey = `top_drivers_${limit}`;
        const cached = dashboardCache.get(cacheKey);
        if (cached) return cached;

        // Using raw query for JSON aggregation
        const result = await prisma.$queryRaw`
            SELECT 
                metadata->>'driverId' as "driverId", 
                COUNT(*)::int as "count"
            FROM "Alert"
            WHERE status IN ('OPEN', 'ESCALATED')
            AND metadata->>'driverId' IS NOT NULL
            GROUP BY metadata->>'driverId'
            ORDER BY "count" DESC
            LIMIT ${limit}
        `;

        dashboardCache.set(cacheKey, result);
        return result;
    }

    async getAutoClosedAlerts(since?: Date) {
        const where: any = {
            status: AlertStatus.AUTO_CLOSED,
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

    async getAlertTrends(days: number = 7) {
        const cacheKey = `alert_trends_${days}`;
        const cached = dashboardCache.get(cacheKey);
        if (cached) return cached;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Using raw query for date truncation (PostgreSQL specific)
        // Aggregating by day and status
        const result = await prisma.$queryRaw`
            SELECT 
                DATE_TRUNC('day', timestamp) as "date",
                status,
                COUNT(*)::int as "count"
            FROM "Alert"
            WHERE timestamp >= ${startDate}
            GROUP BY 1, 2
            ORDER BY 1 ASC
        `;

        dashboardCache.set(cacheKey, result, 300); // Cache trends for 5 minutes
        return result;
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
