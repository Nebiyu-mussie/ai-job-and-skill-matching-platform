import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth.middleware';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { user, tokens } = await authService.register(req.body);
    setRefreshTokenCookie(res, tokens.refreshToken);

    const userData = user.toObject() as any;
    delete userData.password;
    delete userData.refreshTokens;

    ApiResponse.created(res, {
      user: userData,
      accessToken: tokens.accessToken,
    }, 'Account created successfully');
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const device = req.headers['user-agent'];

    const { user, tokens } = await authService.login({ email, password, device });
    setRefreshTokenCookie(res, tokens.refreshToken);

    const userData = user.toObject() as any;
    delete userData.password;
    delete userData.refreshTokens;

    ApiResponse.success(res, {
      user: userData,
      accessToken: tokens.accessToken,
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (req.user && refreshToken) {
      await authService.logout(req.user._id.toString(), refreshToken);
    }
    clearRefreshTokenCookie(res);
    ApiResponse.success(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

export const logoutAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();
    await authService.logoutAll(req.user._id.toString());
    clearRefreshTokenCookie(res);
    ApiResponse.success(res, null, 'Logged out from all devices');
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (!token) throw ApiError.unauthorized('Refresh token required');

    const tokens = await authService.refreshToken(token);
    setRefreshTokenCookie(res, tokens.refreshToken);

    ApiResponse.success(res, { accessToken: tokens.accessToken }, 'Token refreshed');
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.params;
    const user = await authService.verifyEmail(token);
    ApiResponse.success(res, { userId: user._id }, 'Email verified successfully');
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await authService.forgotPassword(req.body.email);
    ApiResponse.success(
      res,
      null,
      'If an account with that email exists, a password reset link has been sent'
    );
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    await authService.resetPassword(token, password);
    ApiResponse.success(res, null, 'Password reset successfully');
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user._id.toString(), currentPassword, newPassword);
    clearRefreshTokenCookie(res);
    ApiResponse.success(res, null, 'Password changed successfully. Please log in again.');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();
    const user = req.user.toObject() as any;
    delete user.password;
    delete user.refreshTokens;
    ApiResponse.success(res, { user });
  } catch (error) {
    next(error);
  }
};
