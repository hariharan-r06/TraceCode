import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { AuthRequest, User } from '../types';

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ detail: 'No authorization token provided' });
    }

    const token = authHeader.substring(7);
    const payload = authService.verifyToken(token);

    if (!payload) {
        return res.status(401).json({ detail: 'Invalid or expired token' });
    }

    const user: User = {
        id: payload.user_id || payload.email,
        email: payload.email,
        name: payload.name || '',
        role: payload.role || 'student',
    };

    req.user = user;
    next();
};

export const optionalAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const payload = authService.verifyToken(token);

        if (payload) {
            req.user = {
                id: payload.user_id || payload.email,
                email: payload.email,
                name: payload.name || '',
                role: payload.role || 'student',
            };
        }
    }

    next();
};
