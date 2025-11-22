import { Request, Response, NextFunction } from 'express';
import Logger from '../../utils/logger';
import { AppError } from '../../utils/appError';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = 500;
    let message = 'Internal Server Error';

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }

    Logger.error('Request error', {
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.url,
        statusCode
    });

    res.status(statusCode).json({
        error: {
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        },
    });
};
