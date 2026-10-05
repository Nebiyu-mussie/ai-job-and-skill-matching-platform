import { Request, Response, NextFunction } from 'express';
import { Employer } from '../models/Employer.model';
import { User } from '../models/User.model';
import { Job } from '../models/Job.model';
import { Application } from '../models/Application.model';
import { ApiResponse, getPaginationParams, buildPaginationMeta } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth.middleware';
import { deleteFromCloudinary } from '../config/cloudinary';

export const getMyEmployerProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const employer = await Employer.findOne({ user: req.user._id })
      .populate('user', 'firstName lastName email phone')
      .lean();

    if (!employer) throw ApiError.notFound('Employer profile not found');

    ApiResponse.success(res, { employer });
  } catch (error) {
    next(error);
  }
};

export const updateEmployerProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const employer = await Employer.findOneAndUpdate(
      { user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!employer) throw ApiError.notFound('Employer profile not found');

    ApiResponse.success(res, { employer }, 'Employer profile updated');
  } catch (error) {
    next(error);
  }
};

export const uploadCompanyLogo = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();
    if (!req.file) throw ApiError.badRequest('No image uploaded');

    const file = req.file as any;
    const employer = await Employer.findOne({ user: req.user._id });
    if (!employer) throw ApiError.notFound('Employer profile not found');

    // Delete old logo
    if (employer.logoPublicId) {
      await deleteFromCloudinary(employer.logoPublicId);
    }

    const updated = await Employer.findByIdAndUpdate(
      employer._id,
      { logo: file.path, logoPublicId: file.filename },
      { new: true }
    );

    ApiResponse.success(res, { logo: file.path }, 'Company logo updated');
  } catch (error) {
    next(error);
  }
};

export const getEmployerPublicProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const employer = await Employer.findOne({ slug: req.params.slug })
      .populate('user', 'email')
      .lean();

    if (!employer || !employer.isActive) throw ApiError.notFound('Employer not found');

    const [jobCount, activeJobCount] = await Promise.all([
      Job.countDocuments({ employer: employer._id }),
      Job.countDocuments({ employer: employer._id, status: 'active' }),
    ]);

    const activeJobs = await Job.find({ employer: employer._id, status: 'active' })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title location jobType experienceLevel salary applicationDeadline')
      .lean();

    ApiResponse.success(res, { employer, jobCount, activeJobCount, activeJobs });
  } catch (error) {
    next(error);
  }
};

export const getEmployerDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const employer = await Employer.findOne({ user: req.user._id });
    if (!employer) throw ApiError.notFound('Employer profile not found');

    const [
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications,
      shortlistedApplications,
      hiredCount,
    ] = await Promise.all([
      Job.countDocuments({ employer: employer._id }),
      Job.countDocuments({ employer: employer._id, status: 'active' }),
      Application.countDocuments({ employer: employer._id }),
      Application.countDocuments({ employer: employer._id, status: 'pending' }),
      Application.countDocuments({ employer: employer._id, status: 'shortlisted' }),
      Application.countDocuments({ employer: employer._id, status: 'hired' }),
    ]);

    // Application funnel
    const funnelData = await Application.aggregate([
      { $match: { employer: employer._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Top performing jobs
    const topJobs = await Job.find({ employer: employer._id })
      .sort({ applicationCount: -1 })
      .limit(5)
      .select('title applicationCount viewCount status')
      .lean();

    // Recent applications
    const recentApplications = await Application.find({ employer: employer._id })
      .sort({ appliedAt: -1 })
      .limit(10)
      .populate('applicant', 'firstName lastName profileImage headline')
      .populate('job', 'title')
      .lean();

    ApiResponse.success(res, {
      stats: {
        totalJobs,
        activeJobs,
        totalApplications,
        pendingApplications,
        shortlistedApplications,
        hiredCount,
      },
      funnelData,
      topJobs,
      recentApplications,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllEmployers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search, industry, isVerified } = req.query;

    const filter: any = { isActive: true };
    if (search) {
      filter.$text = { $search: search as string };
    }
    if (industry) filter.industry = industry;
    if (isVerified !== undefined) filter.isVerified = isVerified === 'true';

    const [employers, total] = await Promise.all([
      Employer.find(filter)
        .sort({ isVerified: -1, totalJobsPosted: -1 })
        .skip(skip)
        .limit(limit)
        .select('companyName slug logo industry location isVerified activeJobCount totalHires rating')
        .lean(),
      Employer.countDocuments(filter),
    ]);

    ApiResponse.paginated(res, employers, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};
