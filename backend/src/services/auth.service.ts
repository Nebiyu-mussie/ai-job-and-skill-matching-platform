import crypto from 'crypto';
import { User, IUser } from '../models/User.model';
import { Employer } from '../models/Employer.model';
import { ApiError } from '../utils/ApiError';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { emailService } from '../utils/email';
import { logger } from '../utils/logger';

export interface RegisterDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'jobseeker' | 'employer';
  phone?: string;
  companyName?: string;
  industry?: string;
  city?: string;
  device?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
  device?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  async register(data: RegisterDTO): Promise<{ user: IUser; tokens: AuthTokens }> {
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const user = await User.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      password: data.password,
      role: data.role || 'jobseeker',
      phone: data.phone,
      location: data.city ? { city: data.city, country: 'Ethiopia' } : undefined,
    });

    // Create employer profile if role is employer
    if (data.role === 'employer' && data.companyName) {
      const employer = await Employer.create({
        user: user._id,
        companyName: data.companyName,
        industry: data.industry || 'Technology',
        location: { city: data.city || 'Addis Ababa', country: 'Ethiopia' },
        contactEmail: data.email,
      });
      user.employer = employer._id;
      await user.save();
    }

    // Generate email verification token
    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await emailService.sendWelcome(user.firstName, user.email, verificationUrl);

    const tokens = this.generateTokens(user);
    await this.saveRefreshToken(user, tokens.refreshToken, data.device);

    return { user, tokens };
  }

  async login(data: LoginDTO): Promise<{ user: IUser; tokens: AuthTokens }> {
    const user = await User.findOne({ email: data.email.toLowerCase() })
      .select('+password')
      .populate('employer');

    if (!user || !(await user.comparePassword(data.password))) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.unauthorized('Your account has been deactivated');
    }

    if (user.isBanned) {
      throw ApiError.forbidden(`Account banned: ${user.banReason || 'Policy violation'}`);
    }

    // Update login stats
    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save({ validateBeforeSave: false });

    const tokens = this.generateTokens(user);
    await this.saveRefreshToken(user, tokens.refreshToken, data.device);

    return { user, tokens };
  }

  async refreshToken(token: string): Promise<AuthTokens> {
    try {
      const decoded = verifyRefreshToken(token);
      const user = await User.findById(decoded.id);

      if (!user) throw ApiError.unauthorized('Invalid refresh token');

      const tokenEntry = user.refreshTokens.find((t) => t.token === token);
      if (!tokenEntry) throw ApiError.unauthorized('Refresh token not found');

      if (tokenEntry.expiresAt < new Date()) {
        // Remove expired token
        user.refreshTokens = user.refreshTokens.filter((t) => t.token !== token);
        await user.save({ validateBeforeSave: false });
        throw ApiError.unauthorized('Refresh token expired');
      }

      // Rotate refresh token
      user.refreshTokens = user.refreshTokens.filter((t) => t.token !== token);
      const tokens = this.generateTokens(user);
      await this.saveRefreshToken(user, tokens.refreshToken);

      return tokens;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.unauthorized('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    const user = await User.findById(userId);
    if (user) {
      user.refreshTokens = user.refreshTokens.filter((t) => t.token !== refreshToken);
      await user.save({ validateBeforeSave: false });
    }
  }

  async logoutAll(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshTokens: [] });
  }

  async verifyEmail(token: string): Promise<IUser> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) throw ApiError.badRequest('Invalid or expired verification token');

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return user;
  }

  async forgotPassword(email: string): Promise<void> {
    console.log('🔍 forgotPassword called for:', email);
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('⚠️  User not found for email:', email);
      // Don't reveal if user exists
      return;
    }

    console.log('✅ User found:', user.firstName, user.email);
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    console.log('🔗 Reset URL:', resetUrl);
    console.log('📧 Calling emailService.sendPasswordReset...');
    await emailService.sendPasswordReset(user.firstName, user.email, resetUrl);
    console.log('✅ emailService.sendPasswordReset completed');
  }

  async resetPassword(token: string, newPassword: string): Promise<IUser> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+password');

    if (!user) throw ApiError.badRequest('Invalid or expired reset token');

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = []; // Invalidate all refresh tokens
    await user.save();

    return user;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user) throw ApiError.notFound('User not found');

    if (!(await user.comparePassword(currentPassword))) {
      throw ApiError.unauthorized('Current password is incorrect');
    }

    user.password = newPassword;
    user.refreshTokens = [];
    await user.save();
  }

  private generateTokens(user: IUser): AuthTokens {
    const payload = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    };
    return {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    };
  }

  private async saveRefreshToken(
    user: IUser,
    token: string,
    device?: string
  ): Promise<void> {
    // Keep max 5 refresh tokens per user
    if (user.refreshTokens.length >= 5) {
      user.refreshTokens = user.refreshTokens.slice(-4);
    }

    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + parseInt(process.env.JWT_COOKIE_EXPIRE || '7')
    );

    user.refreshTokens.push({ token, createdAt: new Date(), expiresAt, device });
    await user.save({ validateBeforeSave: false });
  }
}

export const authService = new AuthService();
