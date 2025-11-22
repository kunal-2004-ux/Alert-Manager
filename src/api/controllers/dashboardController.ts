import { Request, Response, NextFunction } from 'express';
import { AlertService } from '../../services/alertService';

const alertService = new AlertService();

export const getSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const summary = await alertService.getDashboardSummary();
        res.json(summary);
    } catch (error) {
        next(error);
    }
};

export const getTopDrivers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
        const drivers = await alertService.getTopDrivers(limit);

        // Add no-cache headers
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.setHeader('Pragma', 'no-cache');

        res.json(drivers);
    } catch (error) {
        next(error);
    }
};

export const getResolved = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const last = req.query.last as string; // '24h' or '7d'
        const alerts = await alertService.getResolvedAlerts(last);
        res.json(alerts);
    } catch (error) {
        next(error);
    }
};

export const getAlertDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const alert = await alertService.getAlertDetails(id);
        res.json(alert);
    } catch (error: any) {
        if (error.message === 'Alert not found') {
            res.status(404).json({ error: error.message });
        } else {
            next(error);
        }
    }
};

export const getTrends = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const trends = await alertService.getDashboardTrends();
        res.json(trends);
    } catch (error) {
        next(error);
    }
};

export const getEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const events = await alertService.getRecentEvents();
        res.json(events);
    } catch (error) {
        next(error);
    }
};
