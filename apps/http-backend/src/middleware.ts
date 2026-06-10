import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/config';

interface AuthRequest extends Request {
    userId?: string;
}

export function middleware(req: AuthRequest, res: Response, next: NextFunction) {
    const token = req.headers['authorization'] ?? "";

    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded && typeof decoded !== 'string' && 'userId' in decoded) {
        req.userId = String(decoded.userId);
        next();
    } else {
        res.status(403).json({
            message: "Unauthorized"
        });
    }
}