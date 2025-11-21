import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './api/middlewares/errorHandler';
import Logger from './utils/logger';

import alertRoutes from './api/routes/alertRoutes';
import dashboardRoutes from './api/routes/dashboardRoutes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    Logger.http(`${req.method} ${req.url}`);
    next();
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/alerts', alertRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling
app.use(errorHandler);

export default app;
