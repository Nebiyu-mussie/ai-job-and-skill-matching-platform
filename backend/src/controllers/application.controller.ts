import { Response, NextFunction } from 'express';
import { Application } from '../models/Application.model';
import { Job } from '../models/Job.model';
import { Resume } from '../models/Resume.model';
import { Employer } from '../models/Employer.model';
import { ApiResponse, getPaginationParams, buildPaginationMeta } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth.middleware';
import { aiService } from '../services/ai.service';
import { notificationService } from '../services/notification.service';
import { MatchResult } from '../models/MatchResult.model';

export const applyForJob = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();
    if (req.user.role !== 'jobseeker') throw ApiError.forbidden('Only job seekers can apply');

    const { jobId, resumeId, coverLetter, screeningAnswers } = req.body;

    const [job, resume] = await Promise.all([
      Job.findById(jobId).populate('employer'),
      Resume.findOne({ _id: resumeId, user: req.user._id }),
    ]);

    if (!job) throw ApiError.notFound('Job not found');
    if (job.status !== 'active') throw ApiError.badRequest('This job is no longer accepting applications');
    if (!resume) throw ApiError.notFound('Resume not found');

    // Check duplicate application
    const existingApp = await Application.findOne({
      job: jobId,
      applicant: req.user._id,
    });
    if (existingApp) throw ApiError.conflict('You have already applied for this job');

    // Check deadline
    if (job.applicationDeadline && new Date() > job.applicationDeadline) {
      throw ApiError.badRequest('Application deadline has passed');
    }

    // Calculate match score via AI
    const userSkills = req.user.skills?.map((s) => s.name) || [];
    const jobSkills = job.requiredSkills.map((s) => s.name);

    let matchScore = 0;
    let matchDetails: any = {};

    try {
      const matchResult = await aiService.matchJobToCandidate(
        {
          skills: userSkills,
          experience: req.user.experience || [],
          education: req.user.education || [],
          location: req.user.location?.city,
          resumeText: resume.parsedData?.extractedText,
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

      matchScore = matchResult.overallScore;
      matchDetails = {
        skillMatch: matchResult.skillMatchScore,
        experienceMatch: matchResult.experienceMatchScore,
        educationMatch: matchResult.educationMatchScore,
        overallScore: matchResult.overallScore,
        matchedSkills: matchResult.matchedSkills,
        missingSkills: matchResult.missingSkills,
      };

      // Save match result
      await MatchResult.findOneAndUpdate(
        { user: req.user._id, job: jobId },
        {
          user: req.user._id,
          job: jobId,
          resume: resumeId,
          overallScore: matchResult.overallScore,
          skillMatchScore: matchResult.skillMatchScore,
          experienceMatchScore: matchResult.experienceMatchScore,
          educationMatchScore: matchResult.educationMatchScore,
          locationMatchScore: matchResult.locationMatchScore,
          matchedSkills: matchResult.matchedSkills,
          missingSkills: matchResult.missingSkills,
          extraSkills: matchResult.extraSkills,
          skillGapAnalysis: matchResult.skillGapAnalysis,
          isApplied: true,
        },
        { upsert: true, new: true }
      );
    } catch {
      // Continue with basic scoring if AI fails
      const matched = jobSkills.filter((s) =>
        userSkills.map((u) => u.toLowerCase()).includes(s.toLowerCase())
      );
      matchScore = jobSkills.length > 0
        ? Math.round((matched.length / jobSkills.length) * 100)
        : 50;
    }

    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      employer: (job.employer as any)._id,
      resume: resumeId,
      coverLetter,
      screeningAnswers,
      matchScore,
      matchDetails,
      statusHistory: [{ status: 'pending', changedAt: new Date() }],
    });

    // Update job application count
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

    // Notify employer
    const employer = job.employer as any;
    if (employer?.user) {
      await notificationService.notifyApplicationReceived(
        employer.user.toString(),
        `${req.user.firstName} ${req.user.lastName}`,
        job.title,
        application._id.toString()
      );
    }

    await application.populate([
      { path: 'job', select: 'title location jobType' },
      { path: 'resume', select: 'originalName' },
    ]);

    ApiResponse.created(res, { application }, 'Application submitted successfully');
  } catch (error) {
    next(error);
  }
};

export const getMyApplications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const { page, limit, skip } = getPaginationParams(req.query);
    const { status } = req.query;

    const filter: any = { applicant: req.user._id };
    if (status) filter.status = status;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('job', 'title location jobType salary status employer')
        .populate({
          path: 'job',
          populate: { path: 'employer', select: 'companyName logo' },
        })
        .lean(),
      Application.countDocuments(filter),
    ]);

    ApiResponse.paginated(res, applications, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const application = await Application.findById(req.params.id)
      .populate('job', 'title description location jobType salary requiredSkills employer')
      .populate({ path: 'job', populate: { path: 'employer', select: 'companyName logo' } })
      .populate('applicant', 'firstName lastName email profileImage skills experience')
      .populate('resume', 'fileUrl parsedData originalName');

    if (!application) throw ApiError.notFound('Application not found');

    // Check ownership
    const isApplicant = application.applicant._id.toString() === req.user._id.toString();
    const employer = await Employer.findOne({ user: req.user._id });
    const isEmployer = employer && application.employer.toString() === employer._id.toString();

    if (!isApplicant && !isEmployer && req.user.role !== 'admin') {
      throw ApiError.forbidden('Not authorized to view this application');
    }

    // Mark as read if employer is viewing
    if (isEmployer && !application.isRead) {
      await Application.findByIdAndUpdate(req.params.id, { isRead: true, reviewedAt: new Date() });
    }

    ApiResponse.success(res, { application });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const { status, note, rejectionReason, interviewSchedule } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('job', 'title employer')
      .populate('applicant', 'firstName lastName email');

    if (!application) throw ApiError.notFound('Application not found');

    const employer = await Employer.findOne({ user: req.user._id });
    if (!employer || application.employer.toString() !== employer._id.toString()) {
      if (req.user.role !== 'admin') throw ApiError.forbidden('Not authorized');
    }

    const previousStatus = application.status;
    application.status = status;
    application.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user._id,
      note,
    });

    if (status === 'rejected') application.rejectionReason = rejectionReason;
    if (status === 'shortlisted') {
      await Job.findByIdAndUpdate(application.job, { $inc: { shortlistCount: 1 } });
    }
    if (interviewSchedule && status === 'interviewed') {
      application.interviewSchedule = interviewSchedule;
    }

    await application.save();

    // Notify applicant
    const applicant = application.applicant as any;
    const job = application.job as any;
    if (applicant && status !== previousStatus) {
      await notificationService.notifyApplicationStatusUpdate(
        applicant._id.toString(),
        job.title,
        employer!.companyName,
        status,
        application._id.toString()
      );
    }

    ApiResponse.success(res, { application }, 'Application status updated');
  } catch (error) {
    next(error);
  }
};

export const withdrawApplication = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const application = await Application.findOne({
      _id: req.params.id,
      applicant: req.user._id,
    });

    if (!application) throw ApiError.notFound('Application not found');

    if (['hired', 'offered'].includes(application.status)) {
      throw ApiError.badRequest('Cannot withdraw from an accepted offer');
    }

    application.status = 'withdrawn';
    application.withdrawalReason = req.body.reason;
    application.statusHistory.push({
      status: 'withdrawn',
      changedAt: new Date(),
      changedBy: req.user._id,
    });
    await application.save();

    await Job.findByIdAndUpdate(application.job, { $inc: { applicationCount: -1 } });

    ApiResponse.success(res, null, 'Application withdrawn');
  } catch (error) {
    next(error);
  }
};

export const getEmployerApplications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const employer = await Employer.findOne({ user: req.user._id });
    if (!employer) throw ApiError.notFound('Employer profile not found');

    const { page, limit, skip } = getPaginationParams(req.query);
    const { status, jobId, sortBy = 'matchScore' } = req.query;

    const filter: any = { employer: employer._id };
    if (status) filter.status = status;
    if (jobId) filter.job = jobId;

    const sort: any = {};
    if (sortBy === 'matchScore') sort.matchScore = -1;
    else if (sortBy === 'date') sort.appliedAt = -1;
    else sort.appliedAt = -1;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('applicant', 'firstName lastName email profileImage skills headline experience education')
        .populate('job', 'title location jobType')
        .lean(),
      Application.countDocuments(filter),
    ]);

    ApiResponse.paginated(res, applications, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const starApplication = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const application = await Application.findById(req.params.id);
    if (!application) throw ApiError.notFound('Application not found');

    application.isStarred = !application.isStarred;
    await application.save();

    ApiResponse.success(
      res,
      { isStarred: application.isStarred },
      application.isStarred ? 'Application starred' : 'Application unstarred'
    );
  } catch (error) {
    next(error);
  }
};
