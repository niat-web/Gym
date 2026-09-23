import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User, IUser, UserRole } from '../models/User.js';
import { AuthError, ForbiddenError } from '../utils/AppError.js';

export interface JwtAccessPayload {
  sub: string;
  role: UserRole;
  ver: number;
  type: 'access';
}

export interface JwtRefreshPayload {
  sub: string;
  ver: number;
  type: 'refresh';
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      userId?: string;
      userRole?: UserRole;
    }
  }
}

/**
 * Require valid JWT access token and active user
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthError('Authorization token required', 'UNAUTHENTICATED');
    }

    const token = authHeader.split(' ')[1];
    let payload: JwtAccessPayload;

    try {
      payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccessPayload;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new AuthError('Access token expired', 'TOKEN_EXPIRED');
      }
      throw new AuthError('Invalid access token', 'TOKEN_INVALID');
    }

    if (payload.type !== 'access') {
      throw new AuthError('Invalid token type', 'TOKEN_INVALID');
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      throw new AuthError('User no longer exists', 'USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw new ForbiddenError('Your account has been deactivated', 'ACCOUNT_DEACTIVATED');
    }

    if (user.gymMeta?.membershipStatus === 'suspended') {
      throw new ForbiddenError('Your membership account is suspended', 'ACCOUNT_SUSPENDED');
    }

    if (user.tokenVersion !== payload.ver) {
      throw new AuthError('Session expired. Please log in again', 'TOKEN_STALE');
    }

    req.user = user;
    req.userId = user._id.toString();
    req.userRole = user.role;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Require user to possess at least one of the specified roles
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !req.userRole) {
      return next(new AuthError('Authentication required', 'UNAUTHENTICATED'));
    }

    if (!allowedRoles.includes(req.userRole)) {
      return next(
        new ForbiddenError(
          `Action not permitted for role '${req.userRole}'`,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
};
