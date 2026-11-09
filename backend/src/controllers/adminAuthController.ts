import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { AuditLog } from '../models/AuditLog.js';
import { config } from '../config/index.js';

const COOKIE_NAME = 'admin_token';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * POST /api/admin/auth/login
 * Authenticates admin and sets secure HttpOnly cookie.
 */
export const adminLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();

    // Query admin including hidden password field
    const admin = await Admin.findOne({ email: cleanEmail }).select('+password');

    if (!admin || !admin.isActive) {
      res.status(401).json({
        success: false,
        message: 'Invalid administrative email or password',
      });
      return;
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid administrative email or password',
      });
      return;
    }

    // Update lastLogin timestamp
    admin.lastLogin = new Date();
    await admin.save();

    // Sign JWT Token
    const token = jwt.sign(
      {
        id: admin._id.toString(),
        email: admin.email,
        role: admin.role,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    // Set HttpOnly, SameSite, Secure Cookie
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
      maxAge: SEVEN_DAYS_MS,
      path: '/',
    });

    // Record Audit Log
    try {
      await AuditLog.create({
        adminId: admin._id,
        adminEmail: admin.email,
        action: 'LOGIN',
        ipAddress: req.ip || '',
        timestamp: new Date(),
      });
    } catch (logErr) {
      console.warn('[AuditLog] Failed to record login audit log:', logErr);
    }

    res.status(200).json({
      success: true,
      message: 'Administrative session established successfully',
      data: {
        admin: {
          id: admin._id.toString(),
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/auth/logout
 * Clears HttpOnly authentication cookie.
 */
export const adminLogout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.admin) {
      try {
        await AuditLog.create({
          adminId: req.admin.id,
          adminEmail: req.admin.email,
          action: 'LOGOUT',
          ipAddress: req.ip || '',
          timestamp: new Date(),
        });
      } catch (logErr) {
        console.warn('[AuditLog] Failed to record logout audit log:', logErr);
      }
    }

    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
      path: '/',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/auth/me
 * Returns current authenticated admin profile.
 */
export const getAdminProfile = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    data: {
      admin: req.admin,
    },
  });
};
