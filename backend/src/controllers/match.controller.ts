import { Response, NextFunction } from 'express';
import { MatchResult } from '../models/MatchResult.model';
import { Job } from '../models/Job.model';
import { Resume } from '../models/Resume.model';
import { ApiResponse, getPaginationParams, buildPaginationMeta } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth.middleware';
import { aiService } from '../services/ai.service';
import { Employer } from '../models/Employer.model';
import { Application } from '../models/Application.model';

export const getMatchScore = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const { jobId } = req.params;

    // Check if we have a cached match result
    const cached = await MatchResult.findOne({
      user: req.user._id,
      job: jobId,
    }).populate('job', 'title employer requiredSkills');

    if (cached) {
      ApiResponse.success(res, { match: cached });
return;
    }

    // Get job and calculate fresh score
    const job = await Job.findById(jobId);
    if (!job) throw ApiError.notFound('Job not found');

    const defaultResume = await Resume.findOne({
      user: req.user._id,
      isDefault: true,
    });

    const userSkills = req.user.skills?.map((s) => s.name) || [];
    const jobSkills = job.requiredSkills.map((s) => s.name);

    const matchResultData = await aiService.matchJobToCandidate(
      {
        skills: userSkills,
        experience: req.user.experience || [],
        education: req.user.education || [],
        location: req.user.location?.city,
        resumeText: defaultResume?.parsedData?.extractedText,
      },
      {
        requiredSkills: jobSkills,
        experienceLevel: job.experienceLevel,
        experienceYears: job.experienceYears,
        educationLevel: job.educationLevel,
        location: job.location.city,
        description: job.description,
      }
    );

    const matchResult = await MatchResult.findOneAndUpdate(
      { user: req.user._id, job: jobId },
      {
        user: req.user._id,
        job: jobId,
        resume: defaultResume?._id,
        ...matchResultData,
      },
      { upsert: true, new: true }
    );

    ApiResponse.success(res, { match: matchResult });
  } catch (error) {
    next(error);
  }
};

export const getMyMatches = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const { page, limit, skip } = getPaginationParams(req.query);
    const { minScore = '0' } = req.query;

    const [matches, total] = await Promise.all([
      MatchResult.find({
        user: req.user._id,
        overallScore: { $gte: parseInt(minScore as string) },
      })
        .sort({ overallScore: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'job',
          select: 'title location jobType salary experienceLevel status applicationDeadline requiredSkills',
          populate: { path: 'employer', select: 'companyName logo isVerified' },
        })
        .lean(),
      MatchResult.countDocuments({
        user: req.user._id,
        overallScore: { $gte: parseInt(minScore as string) },
      }),
    ]);

    // Filter out closed/expired jobs
    const activeMatches = matches.filter(
      (m: any) => m.job && m.job.status === 'active'
    );

    ApiResponse.paginated(res, activeMatches, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const getSkillGapAnalysis = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) throw ApiError.notFound('Job not found');

    const userSkills = req.user.skills?.map((s) => s.name) || [];
    const jobSkills = job.requiredSkills.map((s) => s.name);

    const analysis = await aiService.analyzeSkillGap(
      userSkills,
      jobSkills,
      job.experienceLevel
    );

    ApiResponse.success(res, {
      jobTitle: job.title,
      userSkills,
      requiredSkills: jobSkills,
      ...analysis,
    });
  } catch (error) {
    next(error);
  }
};

export const rankCandidatesForJob = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const job = await Job.findById(req.params.jobId);
    if (!job) throw ApiError.notFound('Job not found');

    const employer = await Employer.findOne({ user: req.user._id });
    if (!employer || job.employer.toString() !== employer._id.toString()) {
      if (req.user.role !== 'admin') throw ApiError.forbidden('Not authorized');
    }

    // Get all applications for this job
    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'skills experience education')
      .populate('resume', 'parsedData')
      .lean();

    if (applications.length === 0) {
   ApiResponse.success(res, { rankings: [] });
return;
    }

    const candidates = applications.map((app: any) => ({
      userId: app.applicant._id.toString(),
      skills: app.applicant.skills?.map((s: any) => s.name) || [],
      experience: app.applicant.experience || [],
      education: app.applicant.education || [],
      resumeText: app.resume?.parsedData?.extractedText,
    }));

    const rankings = await aiService.rankCandidates(
      req.params.jobId,
      candidates,
      {
        skills: job.requiredSkills.map((s) => s.name),
        experienceLevel: job.experienceLevel,
        description: job.description,
      }
    );

    // Update match scores in applications
    for (const ranking of rankings) {
      await Application.findOneAndUpdate(
        { job: req.params.jobId, applicant: ranking.userId },
        { matchScore: ranking.score }
      );
    }

    // Return ranked applications
    const rankedApplications = rankings
      .map((r) => {
        const app = applications.find(
          (a: any) => a.applicant._id.toString() === r.userId
        );
        return app ? { ...app, aiScore: r.score, rank: r.rank } : null;
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.rank - b.rank);

    ApiResponse.success(res, { rankings: rankedApplications });
  } catch (error) {
    next(error);
  }
};
