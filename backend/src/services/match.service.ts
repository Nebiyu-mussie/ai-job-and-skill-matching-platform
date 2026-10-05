import { MatchResult } from '../models/MatchResult.model';
import { Job } from '../models/Job.model';
import { User } from '../models/User.model';
import { Resume } from '../models/Resume.model';
import { aiService } from './ai.service';
import { notificationService } from './notification.service';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

interface MatchCalculationResult {
  matchResult: any;
  isHighMatch: boolean;
  shouldNotify: boolean;
}

class MatchService {
  /**
   * Calculate and save match between a user and a job
   */
  async calculateAndSaveMatch(
    userId: string,
    jobId: string,
    options: { notifyOnHighMatch?: boolean; resumeId?: string } = {}
  ): Promise<MatchCalculationResult> {
    try {
      // Fetch user and job data
      const [user, job, defaultResume] = await Promise.all([
        User.findById(userId).lean(),
        Job.findById(jobId).populate('employer').lean(),
        options.resumeId
          ? Resume.findById(options.resumeId).lean()
          : Resume.findOne({ user: userId, isDefault: true }).lean(),
      ]);

      if (!user) throw new Error('User not found');
      if (!job) throw new Error('Job not found');

      // Prepare candidate data
      const candidateData = {
        skills: user.skills?.map((s) => s.name) || [],
        experience: user.experience || [],
        education: user.education || [],
        location: user.location?.city,
        resumeText: defaultResume?.parsedData?.extractedText,
      };

      // Prepare job data
      const jobData = {
        requiredSkills: job.requiredSkills.map((s) => s.name),
        niceToHaveSkills: job.niceToHaveSkills || [],
        experienceLevel: job.experienceLevel,
        experienceYears: job.experienceYears,
        educationLevel: job.educationLevel,
        location: job.location.city,
        description: job.description,
      };

      // Call AI Service for matching
      const aiMatchResult = await aiService.matchJobToCandidate(candidateData, jobData);

      // Save or update match result in database
      const matchResult = await MatchResult.findOneAndUpdate(
        { user: userId, job: jobId },
        {
          user: userId,
          job: jobId,
          resume: defaultResume?._id,
          overallScore: aiMatchResult.overallScore,
          skillMatchScore: aiMatchResult.skillMatchScore,
          experienceMatchScore: aiMatchResult.experienceMatchScore,
          educationMatchScore: aiMatchResult.educationMatchScore,
          locationMatchScore: aiMatchResult.locationMatchScore,
          matchedSkills: aiMatchResult.matchedSkills,
          missingSkills: aiMatchResult.missingSkills,
          extraSkills: aiMatchResult.extraSkills,
          skillGapAnalysis: aiMatchResult.skillGapAnalysis,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).populate('job', 'title employer');

      const isHighMatch = aiMatchResult.overallScore >= 80;
      const shouldNotify = !!(options.notifyOnHighMatch && isHighMatch);

      // Send notification for high match (>= 80%)
      if (shouldNotify) {
        await this.sendHighMatchNotification(user, job as any, aiMatchResult.overallScore);
      }

      logger.info(
        `Match calculated: User ${userId} <-> Job ${jobId} = ${aiMatchResult.overallScore}% ${
          isHighMatch ? '(HIGH MATCH!)' : ''
        }`
      );

      return {
        matchResult,
        isHighMatch,
        shouldNotify,
      };
    } catch (error) {
      logger.error('Match calculation failed:', error);
      throw error;
    }
  }

  /**
   * Batch calculate matches for all job seekers against a specific job
   */
  async batchMatchJobSeekers(jobId: string, notifyHighMatches: boolean = true): Promise<{
    totalMatched: number;
    highMatches: number;
    averageScore: number;
  }> {
    try {
      const job = await Job.findById(jobId);
      if (!job) throw new Error('Job not found');

      // Get all active job seekers
      const jobSeekers = await User.find({ role: 'jobseeker', isActive: true }).limit(100);

      let totalScore = 0;
      let highMatches = 0;

      // Calculate matches in parallel (with concurrency limit)
      const batchSize = 5;
      for (let i = 0; i < jobSeekers.length; i += batchSize) {
        const batch = jobSeekers.slice(i, i + batchSize);
        const results = await Promise.allSettled(
          batch.map((seeker) =>
            this.calculateAndSaveMatch(seeker._id.toString(), jobId, {
              notifyOnHighMatch: notifyHighMatches,
            })
          )
        );

        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            totalScore += result.value.matchResult.overallScore;
            if (result.value.isHighMatch) highMatches++;
          }
        });
      }

      const averageScore = jobSeekers.length > 0 ? Math.round(totalScore / jobSeekers.length) : 0;

      logger.info(
        `Batch matching complete for job ${jobId}: ${jobSeekers.length} seekers, ${highMatches} high matches, avg score: ${averageScore}%`
      );

      return {
        totalMatched: jobSeekers.length,
        highMatches,
        averageScore,
      };
    } catch (error) {
      logger.error('Batch matching failed:', error);
      throw error;
    }
  }

  /**
   * Calculate matches for a user against all active jobs
   */
  async matchUserToAllJobs(userId: string, notifyHighMatches: boolean = true): Promise<{
    totalJobs: number;
    topMatches: Array<{ jobId: string; score: number; title: string }>;
    highMatches: number;
  }> {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // Get all active jobs
      const jobs = await Job.find({ status: 'active' }).limit(50);

      const matches: Array<{ jobId: string; score: number; title: string }> = [];
      let highMatches = 0;

      // Calculate matches
      const batchSize = 5;
      for (let i = 0; i < jobs.length; i += batchSize) {
        const batch = jobs.slice(i, i + batchSize);
        const results = await Promise.allSettled(
          batch.map((job) =>
            this.calculateAndSaveMatch(userId, job._id.toString(), {
              notifyOnHighMatch: notifyHighMatches && i === 0, // Only notify for first batch
            })
          )
        );

        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const job = batch[index];
            matches.push({
              jobId: job._id.toString(),
              score: result.value.matchResult.overallScore,
              title: job.title,
            });
            if (result.value.isHighMatch) highMatches++;
          }
        });
      }

      // Sort by score and get top 10
      matches.sort((a, b) => b.score - a.score);
      const topMatches = matches.slice(0, 10);

      logger.info(
        `User ${userId} matched against ${jobs.length} jobs. Top match: ${topMatches[0]?.score}%, ${highMatches} high matches`
      );

      return {
        totalJobs: jobs.length,
        topMatches,
        highMatches,
      };
    } catch (error) {
      logger.error('User job matching failed:', error);
      throw error;
    }
  }

  /**
   * Get user's top job matches from database
   */
  async getUserTopMatches(
    userId: string,
    limit: number = 20,
    minScore: number = 60
  ): Promise<any[]> {
    try {
      const matches = await MatchResult.find({
        user: userId,
        overallScore: { $gte: minScore },
      })
        .sort({ overallScore: -1 })
        .limit(limit)
        .populate({
          path: 'job',
          match: { status: 'active' },
          populate: { path: 'employer', select: 'companyName logo isVerified' },
        })
        .lean();

      // Filter out matches where job was deleted or inactive
      return matches.filter((m) => m.job !== null);
    } catch (error) {
      logger.error('Failed to get user top matches:', error);
      throw error;
    }
  }

  /**
   * Calculate match when user views a job (lazy calculation)
   */
  async calculateMatchOnView(userId: string, jobId: string): Promise<any> {
    try {
      // Check if match already exists
      const existing = await MatchResult.findOne({ user: userId, job: jobId });

      if (existing) {
        // Check if it's older than 7 days, recalculate
        const isOld =
          new Date().getTime() - existing.updatedAt.getTime() > 7 * 24 * 60 * 60 * 1000;

        if (!isOld) {
          return existing;
        }
      }

      // Calculate fresh match
      const result = await this.calculateAndSaveMatch(userId, jobId, {
        notifyOnHighMatch: false, // Don't notify on view
      });

      return result.matchResult;
    } catch (error) {
      logger.error('Match on view failed:', error);
      return null; // Don't break the job view flow
    }
  }

  /**
   * Trigger matching after resume parsing
   */
  async matchAfterResumeParsing(userId: string, resumeId: string): Promise<void> {
    try {
      logger.info(`Triggering job matching after resume parsing for user ${userId}`);

      // Match against top active jobs (limit to avoid overload)
      const result = await this.matchUserToAllJobs(userId, true);

      logger.info(
        `Resume parsing match complete: ${result.highMatches} high matches found for user ${userId}`
      );

      // Send consolidated notification if there are high matches
      if (result.highMatches > 0) {
        const user = await User.findById(userId);
        if (user) {
          await notificationService.notifyNewJobMatch(
            userId,
            result.topMatches.slice(0, 3).map((m) => ({
              title: m.title,
              company: '',
              matchScore: m.score,
              jobId: m.jobId,
            }))
          );
        }
      }
    } catch (error) {
      logger.error('Post-resume-parsing matching failed:', error);
      // Don't throw - this is a background process
    }
  }

  /**
   * Send high match notification via Socket.io and Email
   */
  private async sendHighMatchNotification(
    user: any,
    job: any,
    matchScore: number
  ): Promise<void> {
    try {
      const employer = job.employer;
      
      // Create database notification
      await notificationService.create({
        recipientId: user._id.toString(),
        type: 'new_job_match',
        title: '🎯 High Match Found!',
        message: `You have an ${matchScore}% match with "${job.title}" at ${
          employer?.companyName || 'a company'
        }`,
        link: `/jobs/${job._id}`,
        data: {
          jobId: job._id,
          matchScore,
          jobTitle: job.title,
          companyName: employer?.companyName,
        },
        priority: 'high',
        channel: 'both',
      });

      // 🎯 TASK 4: Emit Socket.io NEW_MATCH_ALERT event for real-time notification
      const { emitToUser } = require('../config/socket');
      emitToUser(user._id.toString(), 'NEW_MATCH_ALERT', {
        jobId: job._id,
        jobTitle: job.title,
        companyName: employer?.companyName,
        matchScore,
        message: `🔥 Perfect Match! New job "${job.title}" matches your profile by ${matchScore}%!`,
        link: `/jobs/${job._id}`,
        timestamp: new Date(),
      });

      logger.info(`High match notification sent to user ${user._id} for job ${job._id}`);
    } catch (error) {
      logger.error('Failed to send high match notification:', error);
    }
  }

  /**
   * Get match statistics for a job (employer view)
   */
  async getJobMatchStatistics(jobId: string): Promise<{
    totalMatches: number;
    highMatches: number;
    averageScore: number;
    topCandidates: any[];
  }> {
    try {
      const matches = await MatchResult.find({ job: jobId })
        .populate('user', 'firstName lastName profileImage skills experience headline')
        .sort({ overallScore: -1 })
        .lean();

      const totalMatches = matches.length;
      const highMatches = matches.filter((m) => m.overallScore >= 80).length;
      const averageScore =
        totalMatches > 0
          ? Math.round(matches.reduce((sum, m) => sum + m.overallScore, 0) / totalMatches)
          : 0;
      const topCandidates = matches.slice(0, 10);

      return {
        totalMatches,
        highMatches,
        averageScore,
        topCandidates,
      };
    } catch (error) {
      logger.error('Failed to get job match statistics:', error);
      throw error;
    }
  }

  /**
   * Clear old matches (cleanup job - can be run via cron)
   */
  async clearOldMatches(daysOld: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await MatchResult.deleteMany({
        updatedAt: { $lt: cutoffDate },
        isApplied: false,
        isSaved: false,
      });

      logger.info(`Cleared ${result.deletedCount} old match results (older than ${daysOld} days)`);
      return result.deletedCount || 0;
    } catch (error) {
      logger.error('Failed to clear old matches:', error);
      return 0;
    }
  }
}

export const matchService = new MatchService();
