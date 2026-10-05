import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../utils/jwt';
import { User, IUser } from '../models/User.model';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: IUser;
  userId?: string;
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(ApiError.unauthorized('Access token is required'));
    }

    let decoded: JWTPayload;
    try {
      decoded = verifyAccessToken(token);
    } catch {
      return next(ApiError.unauthorized('Invalid or expired access token'));
    }

    const user = await User.findById(decoded.id).select('+password');

    if (!user) {
      return next(ApiError.unauthorized('User no longer exists'));
    }

    if (!user.isActive) {
      return next(ApiError.unauthorized('Your account has been deactivated'));
    }

    if (user.isBanned) {
      return next(ApiError.forbidden(`Your account has been banned: ${user.banReason || 'Policy violation'}`));
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    next(ApiError.unauthorized('Authentication failed'));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next();
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);

    if (user && user.isActive && !user.isBanned) {
      req.user = user;
      req.userId = user._id.toString();
    }

    next();
  } catch {
    next();
  }
};
