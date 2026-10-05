import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Job } from '../models/Job.model';
import { Course } from '../models/Course.model';
import { MatchResult } from '../models/MatchResult.model';
import { Application } from '../models/Application.model';
import { ApiResponse } from '../utils/ApiResponse';

const router = Router();

// Get personalized job recommendations
router.get('/jobs', authenticate, authorize('jobseeker'), async (req: any, res, next) => {
  try {
    const user = req.user;
    const userSkills = user.skills?.map((s: any) => s.name) || [];

    // Get jobs user hasn't applied to
    const appliedJobIds = await Application.find({ applicant: user._id })
      .distinct('job');

    // Find matching active jobs
    const jobs = await Job.find({
      status: 'active',
      _id: { $nin: appliedJobIds },
      'requiredSkills.name': {
        $in: userSkills.map((s: string) => new RegExp(s, 'i')),
      },
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('employer', 'companyName logo isVerified location')
      .lean();

    // Get existing match scores
    const matchResults = await MatchResult.find({
      user: user._id,
      job: { $in: jobs.map((j: any) => j._id) },
    }).lean();

    const matchMap = new Map(
      matchResults.map((m) => [m.job.toString(), m.overallScore])
    );

    const recommendedJobs = jobs
      .map((job: any) => ({
        ...job,
        matchScore: matchMap.get(job._id.toString()) || 0,
      }))
      .sort((a: any, b: any) => b.matchScore - a.matchScore);

    ApiResponse.success(res, { jobs: recommendedJobs });
  } catch (error) { next(error); }
});

// Get course recommendations
router.get('/courses', authenticate, authorize('jobseeker'), async (req: any, res, next) => {
  try {
    const user = req.user;
    const userSkills = user.skills?.map((s: any) => s.name.toLowerCase()) || [];

    // Find top match results to identify missing skills
    const topMatches = await MatchResult.find({ user: user._id })
      .sort({ overallScore: -1 })
      .limit(5)
      .lean();

    const missingSkills = new Set<string>();
    topMatches.forEach((m) => {
      m.missingSkills.forEach((s) => missingSkills.add(s.toLowerCase()));
    });

    const skillsToLearn = Array.from(missingSkills).slice(0, 10);

    const courses = await Course.find({
      isActive: true,
      $or: [
        { skills: { $in: skillsToLearn.map((s) => new RegExp(s, 'i')) } },
        { skills: { $in: userSkills.map((s: string) => new RegExp(s, 'i')) } },
      ],
    })
      .sort({ rating: -1, enrollments: -1 })
      .limit(20)
      .lean();

    ApiResponse.success(res, { courses, targetSkills: skillsToLearn });
  } catch (error) { next(error); }
});

// Get career path recommendations
router.get('/career-paths', authenticate, authorize('jobseeker'), async (_req: any, res, next) => {
  try {

    const careerPaths = [
      {
        title: 'Senior Software Engineer',
        currentFit: 75,
        requiredSkills: ['System Design', 'Cloud Architecture', 'Leadership'],
        timeline: '2-3 years',
        averageSalary: 120000,
        steps: [
          'Master advanced data structures',
          'Learn system design principles',
          'Build leadership skills',
          'Contribute to open source',
          'Get AWS/GCP certification',
        ],
      },
      {
        title: 'Tech Lead',
        currentFit: 60,
        requiredSkills: ['Team Management', 'Architecture Design', 'Mentoring'],
        timeline: '3-5 years',
        averageSalary: 150000,
        steps: [
          'Lead small projects',
          'Mentor junior developers',
          'Learn agile methodologies',
          'Improve communication skills',
        ],
      },
    ];

    ApiResponse.success(res, { careerPaths });
  } catch (error) { next(error); }
});

export default router;
