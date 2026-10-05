import { Request, Response, NextFunction } from 'express';
import { Job } from '../models/Job.model';
import { Application } from '../models/Application.model';
import { Employer } from '../models/Employer.model';
import { Bookmark } from '../models/Bookmark.model';
import { ApiResponse, getPaginationParams, buildPaginationMeta } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth.middleware';
import { aiService } from '../services/ai.service';
import { matchService } from '../services/match.service';
import { notificationService } from '../services/notification.service';
import { MatchResult } from '../models/MatchResult.model';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

export const createJob = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const employer = await Employer.findOne({ user: req.user._id });
    if (!employer) throw ApiError.notFound('Employer profile not found');
    if (!employer.isVerified && employer.subscriptionPlan === 'free') {
      // Allow unverified employers to post but mark as pending
    }
    if (employer.activeJobCount >= employer.jobPostLimit) {
      throw ApiError.forbidden(`Job post limit reached (${employer.jobPostLimit}). Please upgrade your plan.`);
    }

    const job = await Job.create({
      ...req.body,
      employer: employer._id,
    });

    // Update employer job counts
    await Employer.findByIdAndUpdate(employer._id, {
      $inc: { activeJobCount: 1, totalJobsPosted: 1 },
    });

    // Generate AI embedding for semantic search
    if (job.description) {
      const skillsText = job.requiredSkills.map((s) => s.name).join(', ');
      const text = `${job.title} ${skillsText} ${job.description}`;
      const embedding = await aiService.generateEmbedding(text);
      if (embedding.length > 0) {
        await Job.findByIdAndUpdate(job._id, { embeddingVector: embedding });
      }
    }

    // 🎯 TASK 2: Trigger batch matching when new job is posted
    if (job.status === 'active') {
      matchService.batchMatchJobSeekers(job._id.toString(), true).catch((err) => {
        logger.error(`Background batch matching failed for job ${job._id}:`, err);
      });
    }

    await job.populate('employer');
    ApiResponse.created(res, { job }, 'Job posted successfully');
  } catch (error) {
    next(error);
  }
};

export const getJobs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const {
      search,
      category,
      jobType,
      experienceLevel,
      city,
      country,
      isRemote,
      minSalary,
      maxSalary,
      currency,
      skills,
      status = 'active',
    } = req.query;

    const filter: any = { status };

    if (search) {
      filter.$text = { $search: search as string };
    }
    if (category) filter.category = category;
    if (jobType) filter.jobType = { $in: (jobType as string).split(',') };
    if (experienceLevel) filter.experienceLevel = { $in: (experienceLevel as string).split(',') };
    if (city) filter['location.city'] = { $regex: city as string, $options: 'i' };
    if (country) filter['location.country'] = country;
    if (isRemote === 'true') filter['location.isRemote'] = true;
    if (minSalary) filter['salary.min'] = { $gte: parseInt(minSalary as string) };
    if (maxSalary) filter['salary.max'] = { $lte: parseInt(maxSalary as string) };
    if (skills) {
      const skillList = (skills as string).split(',');
      filter['requiredSkills.name'] = { $in: skillList.map((s) => new RegExp(s, 'i')) };
    }

    const sortOptions: any = search
      ? { score: { $meta: 'textScore' }, isFeatured: -1, createdAt: -1 }
      : { isFeatured: -1, createdAt: -1 };

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('employer', 'companyName logo location industry isVerified')
        .lean(),
      Job.countDocuments(filter),
    ]);

    // Add bookmark status if user is logged in
    let jobsWithMeta = jobs as any[];
    if (req.user) {
      const bookmarks = await Bookmark.find({
        user: req.user._id,
        job: { $in: jobs.map((j) => j._id) },
      }).lean();
      const bookmarkedIds = new Set(bookmarks.map((b) => b.job.toString()));

      jobsWithMeta = jobs.map((job) => ({
        ...job,
        isBookmarked: bookmarkedIds.has(job._id.toString()),
      }));
    }

    ApiResponse.paginated(
      res,
      jobsWithMeta,
      buildPaginationMeta(total, page, limit)
    );
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employer', 'companyName logo description location industry isVerified website benefits culture socialLinks')
      .lean();

    if (!job) throw ApiError.notFound('Job not found');

    // Increment view count
    await Job.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

    let jobWithMeta: any = { ...job };

    if (req.user) {
      const [bookmark, application] = await Promise.all([
        Bookmark.findOne({ user: req.user._id, job: job._id }),
        Application.findOne({ applicant: req.user._id, job: job._id }),
      ]);

      jobWithMeta.isBookmarked = !!bookmark;
      jobWithMeta.hasApplied = !!application;
      jobWithMeta.applicationStatus = application?.status;

      // 🎯 TASK 2: Calculate match score when user views a job
      if (req.user.role === 'jobseeker') {
        const matchResult = await matchService.calculateMatchOnView(
          req.user._id.toString(),
          req.params.id
        );
        jobWithMeta.matchScore = matchResult?.overallScore;
        jobWithMeta.matchDetails = matchResult
          ? {
              skillMatch: matchResult.skillMatchScore,
              experienceMatch: matchResult.experienceMatchScore,
              educationMatch: matchResult.educationMatchScore,
              matchedSkills: matchResult.matchedSkills,
              missingSkills: matchResult.missingSkills,
            }
          : null;
      }
    }

    ApiResponse.success(res, { job: jobWithMeta });
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const job = await Job.findById(req.params.id).populate('employer');
    if (!job) throw ApiError.notFound('Job not found');

    const employer = await Employer.findOne({ user: req.user._id });
    if (!employer || job.employer._id.toString() !== employer._id.toString()) {
      if (req.user.role !== 'admin') throw ApiError.forbidden('Not authorized to update this job');
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('employer');

    ApiResponse.success(res, { job: updatedJob }, 'Job updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const job = await Job.findById(req.params.id);
    if (!job) throw ApiError.notFound('Job not found');

    const employer = await Employer.findOne({ user: req.user._id });
    if (employer && job.employer.toString() === employer._id.toString()) {
      await Employer.findByIdAndUpdate(employer._id, { $inc: { activeJobCount: -1 } });
    } else if (req.user.role !== 'admin') {
      throw ApiError.forbidden('Not authorized to delete this job');
    }

    await Job.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ job: req.params.id });

    ApiResponse.success(res, null, 'Job deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getEmployerJobs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const employer = await Employer.findOne({ user: req.user._id });
    if (!employer) throw ApiError.notFound('Employer profile not found');

    const { page, limit, skip } = getPaginationParams(req.query);
    const { status } = req.query;

    const filter: any = { employer: employer._id };
    if (status) filter.status = status;

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(filter),
    ]);

    ApiResponse.paginated(res, jobs, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const getJobCandidates = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const job = await Job.findById(req.params.id);
    if (!job) throw ApiError.notFound('Job not found');

    const employer = await Employer.findOne({ user: req.user._id });
    if (!employer || job.employer.toString() !== employer._id.toString()) {
      if (req.user.role !== 'admin') throw ApiError.forbidden('Not authorized');
    }

    const { page, limit, skip } = getPaginationParams(req.query);
    const { status, sortBy = 'matchScore' } = req.query;

    const filter: any = { job: req.params.id };
    if (status) filter.status = status;

    const sortOptions: any = {};
    if (sortBy === 'matchScore') sortOptions.matchScore = -1;
    else if (sortBy === 'date') sortOptions.appliedAt = -1;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('applicant', 'firstName lastName email profileImage skills headline experience')
        .populate('resume', 'fileUrl parsedData')
        .lean(),
      Application.countDocuments(filter),
    ]);

    ApiResponse.paginated(res, applications, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const getJobCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await Job.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, name: '$_id', count: 1 } },
    ]);

    ApiResponse.success(res, { categories });
  } catch (error) {
    next(error);
  }
};

export const updateJobStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();
    const { status } = req.body;

    const job = await Job.findById(req.params.id);
    if (!job) throw ApiError.notFound('Job not found');

    const employer = await Employer.findOne({ user: req.user._id });
    if (employer && job.employer.toString() !== employer._id.toString()) {
      if (req.user.role !== 'admin') throw ApiError.forbidden('Not authorized');
    }

    // Handle active job count
    if (job.status !== 'active' && status === 'active') {
      await Employer.findByIdAndUpdate(job.employer, { $inc: { activeJobCount: 1 } });
    } else if (job.status === 'active' && status !== 'active') {
      await Employer.findByIdAndUpdate(job.employer, { $inc: { activeJobCount: -1 } });
    }

    const updated = await Job.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    ApiResponse.success(res, { job: updated }, `Job status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};
