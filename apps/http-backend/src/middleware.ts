import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export interface AuthRequest extends Request {
    userId?: string;
}

export function middleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

    if (!token) {
        res.status(403).json({
            message: "Unauthorized"
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded && typeof decoded !== "string" && "userId" in decoded) {
            req.userId = String(decoded.userId);
            next();
            return;
        }
    } catch {
        // fall through to unauthorized response
    }

    res.status(403).json({
        message: "Unauthorized"
    });
}
