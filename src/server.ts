import dotenv from 'dotenv';
// Load env vars before importing other modules
dotenv.config();

import app from './app';
import Logger from './utils/logger';
import cron from 'node-cron';
import { AlertProcessor } from './workers/alertProcessor';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    Logger.info(`Server is running on port ${PORT}`);

    // Schedule Background Worker
    // Run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        Logger.info('Running scheduled alert processing task...');
        const processor = new AlertProcessor();
        await processor.processAlerts();
    });
    Logger.info('Background worker scheduled (every 5 mins).');
});
