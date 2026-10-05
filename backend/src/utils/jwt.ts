import jwt, { SignOptions } from 'jsonwebtoken';
import { Response } from 'express';

export interface JWTPayload {
  id: string;
  role: string;
  email: string;
}

export const signAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  } as SignOptions);
};

export const signRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  } as SignOptions);
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as JWTPayload;
};

export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: parseInt(process.env.JWT_COOKIE_EXPIRE || '7') * 24 * 60 * 60 * 1000,
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
  });
};
