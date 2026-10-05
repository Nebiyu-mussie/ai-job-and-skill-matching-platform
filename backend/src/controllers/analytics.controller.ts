import { Response, NextFunction } from 'express';
import { User } from '../models/User.model';
import { Job } from '../models/Job.model';
import { Application } from '../models/Application.model';
import { Employer } from '../models/Employer.model';
import { MatchResult } from '../models/MatchResult.model';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAdminAnalytics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') throw ApiError.forbidden();

    const [
      totalUsers,
      totalJobSeekers,
      totalEmployers,
      totalJobs,
      activeJobs,
      totalApplications,
      totalHires,
      verifiedEmployers,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'jobseeker', isActive: true }),
      User.countDocuments({ role: 'employer', isActive: true }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'active' }),
      Application.countDocuments(),
      Application.countDocuments({ status: 'hired' }),
      Employer.countDocuments({ isVerified: true }),
    ]);

    // Monthly trends (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const [userTrend, jobTrend, applicationTrend] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: twelveMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Job.aggregate([
        { $match: { createdAt: { $gte: twelveMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Application.aggregate([
        { $match: { createdAt: { $gte: twelveMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    // Top job categories
    const topCategories = await Job.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Top skills in demand
    const topSkills = await Job.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$requiredSkills' },
      { $group: { _id: '$requiredSkills.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    // Average match scores
    const avgMatchScore = await MatchResult.aggregate([
      { $group: { _id: null, avg: { $avg: '$overallScore' } } },
    ]);

    // Application status distribution
    const applicationStatusDist = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    ApiResponse.success(res, {
      overview: {
        totalUsers,
        totalJobSeekers,
        totalEmployers,
        totalJobs,
        activeJobs,
        totalApplications,
        totalHires,
        verifiedEmployers,
        avgMatchScore: avgMatchScore[0]?.avg?.toFixed(1) || 0,
        hiringRate: totalApplications > 0
          ? ((totalHires / totalApplications) * 100).toFixed(1)
          : 0,
      },
      trends: {
        users: userTrend,
        jobs: jobTrend,
        applications: applicationTrend,
      },
      topCategories,
      topSkills,
      applicationStatusDist,
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployerAnalytics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const employer = await Employer.findOne({ user: req.user._id });
    if (!employer) throw ApiError.notFound('Employer profile not found');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalJobs,
      totalApplications,
      avgMatchScore,
      applicationsByStatus,
      applicationsByJob,
      applicationTrend,
      viewsTrend,
    ] = await Promise.all([
      Job.countDocuments({ employer: employer._id }),
      Application.countDocuments({ employer: employer._id }),
      Application.aggregate([
        { $match: { employer: employer._id, matchScore: { $exists: true } } },
        { $group: { _id: null, avg: { $avg: '$matchScore' } } },
      ]),
      Application.aggregate([
        { $match: { employer: employer._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Application.aggregate([
        { $match: { employer: employer._id } },
        {
          $lookup: {
            from: 'jobs',
            localField: 'job',
            foreignField: '_id',
            as: 'jobInfo',
          },
        },
        { $unwind: '$jobInfo' },
        {
          $group: {
            _id: { jobId: '$job', title: '$jobInfo.title' },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Application.aggregate([
        {
          $match: {
            employer: employer._id,
            appliedAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$appliedAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Job.aggregate([
        { $match: { employer: employer._id } },
        { $group: { _id: null, totalViews: { $sum: '$viewCount' } } },
      ]),
    ]);

    ApiResponse.success(res, {
      overview: {
        totalJobs,
        totalApplications,
        avgMatchScore: avgMatchScore[0]?.avg?.toFixed(1) || 0,
        totalViews: viewsTrend[0]?.totalViews || 0,
      },
      applicationsByStatus,
      applicationsByJob,
      applicationTrend,
    });
  } catch (error) {
    next(error);
  }
};

export const getJobSeekerAnalytics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const [
      totalApplications,
      applicationsByStatus,
      avgMatchScore,
      applicationTrend,
      topMatchedJobs,
    ] = await Promise.all([
      Application.countDocuments({ applicant: req.user._id }),
      Application.aggregate([
        { $match: { applicant: req.user._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      MatchResult.aggregate([
        { $match: { user: req.user._id } },
        { $group: { _id: null, avg: { $avg: '$overallScore' } } },
      ]),
      Application.aggregate([
        {
          $match: {
            applicant: req.user._id,
            appliedAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$appliedAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      MatchResult.find({ user: req.user._id })
        .sort({ overallScore: -1 })
        .limit(5)
        .populate('job', 'title location jobType')
        .lean(),
    ]);

    ApiResponse.success(res, {
      overview: {
        totalApplications,
        avgMatchScore: avgMatchScore[0]?.avg?.toFixed(1) || 0,
      },
      applicationsByStatus,
      applicationTrend,
      topMatchedJobs,
    });
  } catch (error) {
    next(error);
  }
};
