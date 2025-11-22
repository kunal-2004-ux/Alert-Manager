import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../../utils/appError';

// Clerk middleware handles token verification
export const clerkAuth = ClerkExpressRequireAuth({
    // Optional: Custom error handling if needed, but Clerk's default is usually fine.
    // We can wrap it to throw our custom AppError if verification fails.
});

// Wrapper to align with our error handling
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    clerkAuth(req, res, (err: any) => {
        if (err) {
            // Clerk throws an error if auth fails
            next(new UnauthorizedError('Invalid or missing session token'));
        } else {
            // Clerk attaches auth info to req.auth
            next();
        }
    });
};
