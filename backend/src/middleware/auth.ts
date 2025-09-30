import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { logger } from '../config/logger';
import { createError } from './errorHandler';

export interface AuthenticatedRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    tenantId: string;
  };
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw createError('Access token required', 401);
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Check if token is blacklisted (for logout functionality)
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw createError('Token has been revoked', 401);
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw createError('User not found or inactive', 401);
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(createError('Invalid token', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(createError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

export const requireAuth = authenticateToken;

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(createError('Authentication required', 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(createError('Insufficient permissions', 403));
      return;
    }

    next();
  };
};

export const requireTenantAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    // Super admins can access any tenant
    if (req.user.role === 'SUPER_ADMIN') {
      next();
      return;
    }

    // Get tenant ID from request params or body
    const tenantId = req.params.tenantId || req.body.tenantId || req.query.tenantId;

    if (!tenantId) {
      throw createError('Tenant ID required', 400);
    }

    // Check if user belongs to the requested tenant
    if (req.user.tenantId !== tenantId) {
      throw createError('Access denied to this tenant', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const requireDeviceAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('Authentication required', 401);
    }

    const deviceId = req.params.deviceId || req.body.deviceId;

    if (!deviceId) {
      throw createError('Device ID required', 400);
    }

    // Super admins can access any device
    if (req.user.role === 'SUPER_ADMIN') {
      next();
      return;
    }

    // Check if device belongs to user's tenant
    const device = await prisma.device.findFirst({
      where: {
        id: deviceId,
        tenantId: req.user.tenantId,
      },
      select: { id: true },
    });

    if (!device) {
      throw createError('Device not found or access denied', 404);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    // Try to authenticate, but don't fail if token is invalid
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      const isBlacklisted = await redis.get(`blacklist:${token}`);
      if (isBlacklisted) {
        next();
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          tenantId: true,
          isActive: true,
        },
      });

      if (user && user.isActive) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
        };
      }
    } catch (error) {
      // Ignore authentication errors for optional auth
      logger.debug('Optional auth failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default {
  authenticateToken,
  requireRole,
  requireTenantAccess,
  requireDeviceAccess,
  optionalAuth,
};
