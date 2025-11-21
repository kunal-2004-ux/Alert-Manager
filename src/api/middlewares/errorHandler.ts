import { Request, Response, NextFunction } from 'express';
import Logger from '../../utils/logger';

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    Logger.error('Request error', {
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.url,
        body: req.body,
        statusCode: err.statusCode || 500
    });

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        error: {
            message: err.message || 'Internal Server Error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        },
    });
};
