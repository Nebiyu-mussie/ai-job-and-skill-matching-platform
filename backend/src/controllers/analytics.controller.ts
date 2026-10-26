import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model';
import { Employer } from '../models/Employer.model';
import { Job } from '../models/Job.model';
import { Application } from '../models/Application.model';
import { MatchResult } from '../models/MatchResult.model';
import { Notification } from '../models/Notification.model';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth.middleware';
import mongoose from 'mongoose';

export const getAdminAnalytics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') throw ApiError.forbidden();

    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Execute all queries in parallel
    const [
      totalUsers,
      activeUsers,
      newUsers,
      totalEmployers,
      verifiedEmployers,
      pendingEmployers,
      activeJobs,
      totalJobs,
      newJobs,
      totalApplications,
      pendingApplications,
      newApplications,
      totalMatches,
      avgMatchScore,
      dbStats,
      usersByRole,
      applicationsByStatus,
      recentActivity,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true, lastLogin: { $gte: last30Days } }),
      User.countDocuments({ createdAt: { $gte: last30Days } }),
      Employer.countDocuments({ isActive: true }),
      Employer.countDocuments({ isVerified: true, isActive: true }),
      Employer.countDocuments({ isVerified: false, isActive: true }),
      Job.countDocuments({ status: 'active' }),
      Job.countDocuments(),
      Job.countDocuments({ createdAt: { $gte: last30Days } }),
      Application.countDocuments(),
      Application.countDocuments({ status: 'pending' }),
      Application.countDocuments({ createdAt: { $gte: last7Days } }),
      MatchResult.countDocuments(),
      MatchResult.aggregate([
        { $group: { _id: null, avgScore: { $avg: '$matchScore' } } },
      ]).then((result) => Math.round(result[0]?.avgScore || 0)),
      mongoose.connection.db?.stats(),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Application.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      getRecentActivity(),
    ]);

    // Calculate growth rates
    const usersLast30 = newUsers;
    const jobsLast30 = newJobs;
    const applicationsLast7 = newApplications;

    // Database health
    const dbHealth = {
      status: dbStats ? 'healthy' : 'unknown',
      size: dbStats ? (dbStats.dataSize / 1024 / 1024).toFixed(2) + ' MB' : 'unknown',
      collections: dbStats ? dbStats.collections : 0,
      documents: dbStats ? dbStats.objects : 0,
      indexes: dbStats ? dbStats.indexes : 0,
      indexSize: dbStats ? (dbStats.indexSize / 1024 / 1024).toFixed(2) + ' MB' : 'unknown',
    };

    const analytics = {
      users: {
        total: totalUsers,
        active: activeUsers,
        new: usersLast30,
        growth: usersLast30,
        byRole: usersByRole.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      },
      employers: {
        total: totalEmployers,
        verified: verifiedEmployers,
        pending: pendingEmployers,
        verificationRate: totalEmployers > 0 ? Math.round((verifiedEmployers / totalEmployers) * 100) : 0,
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
        new: jobsLast30,
        growth: jobsLast30,
      },
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        recent: applicationsLast7,
        byStatus: applicationsByStatus.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      },
      matching: {
        totalMatches,
        avgMatchScore,
      },
      database: dbHealth,
      recentActivity,
      summary: {
        totalUsers,
        totalEmployers,
        activeJobs,
        totalApplications,
      },
    };

    ApiResponse.success(res, analytics, 'Admin analytics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

async function getRecentActivity() {
  const recent7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [recentUsers, recentJobs, recentApplications] = await Promise.all([
    User.find({ createdAt: { $gte: recent7Days } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email role createdAt')
      .lean(),
    Job.find({ createdAt: { $gte: recent7Days } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('employer', 'companyName')
      .select('title status createdAt')
      .lean(),
    Application.find({ createdAt: { $gte: recent7Days } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('applicant', 'firstName lastName')
      .populate('job', 'title')
      .select('status createdAt')
      .lean(),
  ]);

  return {
    users: recentUsers.map((u) => ({
      type: 'user_registration',
      description: `${u.firstName} ${u.lastName} (${u.role}) joined`,
      timestamp: u.createdAt,
    })),
    jobs: recentJobs.map((j: any) => ({
      type: 'job_posted',
      description: `${j.title} posted by ${j.employer?.companyName || 'Unknown'}`,
      timestamp: j.createdAt,
    })),
    applications: recentApplications.map((a: any) => ({
      type: 'application_submitted',
      description: `${a.applicant?.firstName} ${a.applicant?.lastName} applied to ${a.job?.title}`,
      timestamp: a.createdAt,
    })),
  };
}

export const getJobseekerAnalytics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const userId = req.user._id;

    const [applications, savedJobs, matches, notifications] = await Promise.all([
      Application.countDocuments({ user: userId }),
      require('../models/Bookmark.model').Bookmark.countDocuments({ user: userId }),
      MatchResult.countDocuments({ user: userId }),
      Notification.countDocuments({ recipient: userId, isRead: false }),
    ]);

    const applicationsByStatus = await Application.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    ApiResponse.success(res, {
      applications,
      savedJobs,
      matches,
      unreadNotifications: notifications,
      applicationsByStatus: applicationsByStatus.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
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

    const [activeJobs, totalApplications, pendingApplications, recentApplications] = await Promise.all([
      Job.countDocuments({ employer: employer._id, status: 'active' }),
      Application.countDocuments({ employer: employer._id }),
      Application.countDocuments({ employer: employer._id, status: 'pending' }),
      Application.find({ employer: employer._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('applicant', 'firstName lastName profileImage')
        .populate('job', 'title')
        .lean(),
    ]);

    ApiResponse.success(res, {
      activeJobs,
      totalApplications,
      pendingApplications,
      recentApplications,
    });
  } catch (error) {
    next(error);
  }
};
