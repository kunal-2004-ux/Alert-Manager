import { Request, Response, NextFunction } from 'express';
import { AlertService } from '../../services/alertService';

const alertService = new AlertService();

export const createAlert = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const alert = await alertService.createAlert(req.body);
        res.status(201).json(alert);
    } catch (error) {
        next(error);
    }
};

export const createBatchAlerts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!Array.isArray(req.body)) {
            throw new Error('Request body must be an array of alerts');
        }
        const alerts = await alertService.createBatch(req.body);
        res.status(201).json(alerts);
    } catch (error) {
        next(error);
    }
};

export const resolveAlert = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const alert = await alertService.resolveAlert(id);
        res.json(alert);
    } catch (error: any) {
        if (error.message === 'Alert not found') {
            res.status(404).json({ error: error.message });
        } else if (error.message.includes('already')) {
            res.status(400).json({ error: error.message });
        } else {
            next(error);
        }
    }
};
