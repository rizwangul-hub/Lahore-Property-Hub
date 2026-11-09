import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { Admin } from '../models/Admin.js';

export interface AdminTokenPayload {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: string;
        email: string;
        name: string;
        role: string;
      };
    }
  }
}

export const adminAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check HttpOnly cookie first, then Bearer header
    let token = req.cookies?.admin_token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. No session token provided.',
      });
      return;
    }

    let decoded: AdminTokenPayload;
    try {
      decoded = jwt.verify(token, config.jwtSecret) as AdminTokenPayload;
    } catch (jwtErr) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please log in again.',
      });
      return;
    }

    // Verify admin in database
    const admin = await Admin.findById(decoded.id).select('+isActive').lean();

    if (!admin || !admin.isActive) {
      res.status(403).json({
        success: false,
        message: 'Admin account is inactive or no longer exists.',
      });
      return;
    }

    req.admin = {
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};
