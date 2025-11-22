import dotenv from 'dotenv';
// Load env vars before importing other modules
const result = dotenv.config();
if (result.error) {
    console.error("Error loading .env file:", result.error);
}

import app from './app';
import Logger from './utils/logger';

console.log("Environment Check:");
console.log("CLERK_SECRET_KEY present:", !!process.env.CLERK_SECRET_KEY);
if (process.env.CLERK_SECRET_KEY) {
    console.log("CLERK_SECRET_KEY length:", process.env.CLERK_SECRET_KEY.length);
    console.log("CLERK_SECRET_KEY prefix:", process.env.CLERK_SECRET_KEY.substring(0, 7));
} else {
    console.error("CRITICAL: CLERK_SECRET_KEY is missing from process.env");
}
import cron from 'node-cron';
import { AlertProcessor } from './workers/alertProcessor';
import { CleanupService } from './services/cleanupService';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    Logger.info(`Server is running on port ${PORT}`);

    // Schedule Auto-Close Job (Every 5 minutes)
    cron.schedule('*/5 * * * *', async () => {
        Logger.info('Running Auto-Close Job...');
        const processor = new AlertProcessor();
        await processor.processAlerts();
    });

    // Schedule Data Cleanup Job (Every night at 2 AM)
    cron.schedule('0 2 * * *', async () => {
        Logger.info('Running Data Cleanup Job...');
        const cleanupService = new CleanupService();
        await cleanupService.cleanupOldAlerts(30); // Keep 30 days of history
    });

    Logger.info('Background worker scheduled (every 5 mins).');
});

// Graceful Shutdown
const shutdown = async () => {
    Logger.info('SIGTERM/SIGINT received. Shutting down gracefully...');

    // Close server (stop accepting new requests) - In a real app, we'd track active connections

    // Disconnect Database
    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        await prisma.$disconnect();
        Logger.info('Database disconnected.');
    } catch (err) {
        Logger.error('Error disconnecting database:', err);
    }

    process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
