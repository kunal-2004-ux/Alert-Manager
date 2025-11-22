import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../services/authService';

const authService = new AuthService();

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await authService.login(req.body);
        res.json(result);
    } catch (error) {
        res.status(401).json({ error: 'Invalid credentials' });
    }
};
