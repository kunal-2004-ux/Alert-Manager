import { PrismaClient } from '@prisma/client';
import Logger from '../utils/logger';

const prisma = new PrismaClient();

export class CleanupService {
    /**
     * Deletes alerts that are RESOLVED or AUTO_CLOSED and older than the specified days.
     * @param daysRetention Number of days to keep data
     */
    async cleanupOldAlerts(daysRetention: number = 30) {
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - daysRetention);

        try {
            const result = await prisma.alert.deleteMany({
                where: {
                    status: {
                        in: ['RESOLVED', 'AUTO_CLOSED']
                    },
                    timestamp: {
                        lt: dateThreshold
                    }
                }
            });

            Logger.info(`Cleanup Job: Deleted ${result.count} old alerts (older than ${daysRetention} days).`);
            return result.count;
        } catch (error) {
            Logger.error('Error during data cleanup:', error);
            throw error;
        }
    }
}
