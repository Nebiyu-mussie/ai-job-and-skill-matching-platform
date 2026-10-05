import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model';
import { Employer } from '../models/Employer.model';
import { Job } from '../models/Job.model';
import { Application } from '../models/Application.model';
import { AuditLog } from '../models/AuditLog.model';
import { Skill } from '../models/Skill.model';
import { ApiResponse, getPaginationParams, buildPaginationMeta } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth.middleware';
import { notificationService } from '../services/notification.service';

export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') throw ApiError.forbidden();

    const { page, limit, skip } = getPaginationParams(req.query);
    const { search, role, isActive, isBanned } = req.query;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isBanned !== undefined) filter.isBanned = isBanned === 'true';

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password -refreshTokens')
        .lean(),
      User.countDocuments(filter),
    ]);

    ApiResponse.paginated(res, users, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const banUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') throw ApiError.forbidden();

    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: true, banReason: reason, refreshTokens: [] },
      { new: true }
    ).select('-password -refreshTokens');

    if (!user) throw ApiError.notFound('User not found');

    await notificationService.create({
      recipientId: user._id.toString(),
      type: 'system',
      title: 'Account Suspended',
      message: `Your account has been suspended. Reason: ${reason}`,
      channel: 'email',
    });

    ApiResponse.success(res, { user }, 'User banned');
  } catch (error) {
    next(error);
  }
};

export const unbanUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') throw ApiError.forbidden();

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: false, banReason: undefined },
      { new: true }
    ).select('-password -refreshTokens');

    if (!user) throw ApiError.notFound('User not found');

    ApiResponse.success(res, { user }, 'User unbanned');
  } catch (error) {
    next(error);
  }
};

export const verifyEmployer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') throw ApiError.forbidden();

    const employer = await Employer.findByIdAndUpdate(
      req.params.id,
      {
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: req.user._id,
        jobPostLimit: 10,
      },
      { new: true }
    );

    if (!employer) throw ApiError.notFound('Employer not found');

    await notificationService.create({
      recipientId: employer.user.toString(),
      type: 'employer_verified',
      title: 'Company Verified! 🎉',
      message: `${employer.companyName} has been verified. You can now post up to 10 jobs.`,
      link: '/employer/dashboard',
      priority: 'high',
    });

    ApiResponse.success(res, { employer }, 'Employer verified');
  } catch (error) {
    next(error);
  }
};

export const rejectEmployer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') throw ApiError.forbidden();

    const { reason } = req.body;
    const employer = await Employer.findByIdAndUpdate(
      req.params.id,
      { isVerified: false },
      { new: true }
    );

    if (!employer) throw ApiError.notFound('Employer not found');

    await notificationService.create({
      recipientId: employer.user.toString(),
      type: 'system',
      title: 'Verification Request Update',
      message: `Your verification request was not approved. Reason: ${reason}`,
      priority: 'high',
    });

    ApiResponse.success(res, null, 'Employer verification rejected');
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') throw ApiError.forbidden();

    const { page, limit, skip } = getPaginationParams(req.query);
    const { action, resource, level, userId } = req.query;

    const filter: any = {};
    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (level) filter.level = level;
    if (userId) filter.user = userId;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'firstName lastName email role')
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    ApiResponse.paginated(res, logs, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const manageSkills = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') throw ApiError.forbidden();

    const { action } = req.body;

    if (action === 'create') {
      const skill = await Skill.create(req.body.skill);
     ApiResponse.created(res, { skill }, 'Skill created');
return;
    } else if (action === 'update') {
      const skill = await Skill.findByIdAndUpdate(req.body.skillId, req.body.updates, { new: true });
   ApiResponse.success(res, { skill }, 'Skill updated');
return;
    } else if (action === 'delete') {
      await Skill.findByIdAndUpdate(req.body.skillId, { isActive: false });
     ApiResponse.success(res, null, 'Skill deactivated');
return;
    }

    throw ApiError.badRequest('Invalid action');
  } catch (error) {
    next(error);
  }
};

export const getPendingVerifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') throw ApiError.forbidden();

    const { page, limit, skip } = getPaginationParams(req.query);

    const [employers, total] = await Promise.all([
      Employer.find({ isVerified: false, isActive: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'firstName lastName email createdAt')
        .lean(),
      Employer.countDocuments({ isVerified: false, isActive: true }),
    ]);

    ApiResponse.paginated(res, employers, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') throw ApiError.forbidden();

    await Job.findByIdAndDelete(req.params.id);
    ApiResponse.success(res, null, 'Job deleted by admin');
  } catch (error) {
    next(error);
  }
};
