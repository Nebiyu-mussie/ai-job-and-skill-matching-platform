import { Response, NextFunction } from 'express';
import { Resume } from '../models/Resume.model';
import { User } from '../models/User.model';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth.middleware';
import { aiService } from '../services/ai.service';
import { matchService } from '../services/match.service';
import { notificationService } from '../services/notification.service';
import { deleteFromCloudinary } from '../config/cloudinary';
import { logger } from '../utils/logger';

export const uploadResume = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();
    
    // Check if multer error occurred
    if (!req.file) {
      throw ApiError.badRequest('No file uploaded. Please select a PDF, DOC, or DOCX file.');
    }

    const file = req.file as any;
    const fileType = file.originalname.split('.').pop()?.toLowerCase() as 'pdf' | 'doc' | 'docx';

    // Validate file type
    if (!['pdf', 'doc', 'docx'].includes(fileType)) {
      throw ApiError.badRequest('Invalid file type. Only PDF, DOC, and DOCX files are allowed.');
    }

    // Check max resumes per user (5)
    const resumeCount = await Resume.countDocuments({ user: req.user._id });
    if (resumeCount >= 5) {
      throw ApiError.badRequest('Maximum 5 resumes allowed. Please delete one to upload a new one.');
    }

    const resume = await Resume.create({
      user: req.user._id,
      originalName: file.originalname,
      fileUrl: file.path,
      filePublicId: file.filename,
      fileType: fileType || 'pdf',
      fileSize: file.size,
      isDefault: resumeCount === 0, // First resume is default
    });

    // Trigger async AI parsing (non-blocking)
    parseResumeAsync(resume._id.toString(), file.path, fileType, req.user._id.toString());

    ApiResponse.created(
      res,
      { resume },
      'Resume uploaded successfully. Parsing in progress...'
    );
  } catch (error) {
    logger.error('Resume upload error:', error);
    next(error);
  }
};

const parseResumeAsync = async (
  resumeId: string,
  fileUrl: string,
  fileType: string,
  userId: string
): Promise<void> => {
  try {
    logger.info(`Starting resume parsing for user ${userId}, resume ${resumeId}`);
    
    const parsedData = await aiService.parseResume(fileUrl, fileType);
    
    logger.info(`Resume parsing completed. Skills found: ${parsedData.skills?.length || 0}`);
    if (parsedData.skills?.length > 0) {
      logger.info(`Sample skills: ${parsedData.skills.slice(0, 5).map(s => s.name).join(', ')}`);
    }

    await Resume.findByIdAndUpdate(resumeId, {
      parsedData,
      isParsed: true,
      parsingError: undefined,
    });

    // Update user profile with extracted data
    if (parsedData.skills?.length > 0) {
      const user = await User.findById(userId);
      if (!user) {
        logger.error(`User ${userId} not found when trying to save skills`);
        return;
      }
      
      logger.info(`Current user skills count: ${user.skills.length}`);
      
      // Merge new skills with existing skills (avoid duplicates)
      const existingSkillNames = new Set(
        user.skills.map(s => s.name.toLowerCase())
      );
      
      const newSkills = parsedData.skills
        .filter(s => s.name && s.name.trim().length > 0) // Ensure skill has a name
        .filter(s => !existingSkillNames.has(s.name.toLowerCase()))
        .map(s => ({
          name: s.name,
          level: (s.level as 'beginner' | 'intermediate' | 'advanced' | 'expert') || 'intermediate',
          yearsOfExperience: undefined,
        }));

      logger.info(`New skills to add: ${newSkills.length}`);

      if (newSkills.length > 0) {
        logger.info(`Adding skills: ${newSkills.map(s => s.name).join(', ')}`);
        
        const updatedUser = await User.findByIdAndUpdate(
          userId, 
          {
            $push: { skills: { $each: newSkills } },
          },
          { new: true } // Return the updated document
        );
        
        if (updatedUser) {
          logger.info(`Successfully added ${newSkills.length} skills. Total user skills now: ${updatedUser.skills.length}`);
        } else {
          logger.error(`Failed to update user ${userId} with new skills`);
        }
      } else {
        logger.info(`No new skills to add (${parsedData.skills.length} skills extracted but all are duplicates or invalid)`);
      }
    } else {
      logger.warn(`No skills extracted from resume ${resumeId}`);
    }

    // Notify user
    await notificationService.create({
      recipientId: userId,
      type: 'resume_parsed',
      title: 'Resume Parsed Successfully',
      message: `Your resume has been analyzed. ${parsedData.skills?.length || 0} skills extracted.`,
      link: '/dashboard/profile',
      channel: 'in_app',
    });

    // 🎯 TASK 2: Trigger automatic job matching after resume parsing
    matchService.matchAfterResumeParsing(userId, resumeId).catch((err) => {
      logger.error(`Background matching failed for user ${userId}:`, err);
    });

    logger.info(`Resume ${resumeId} parsed successfully`);
  } catch (error) {
    await Resume.findByIdAndUpdate(resumeId, {
      isParsed: false,
      parsingError: (error as Error).message,
    });
    logger.error(`Resume parsing failed for ${resumeId}:`, error);
  }
};

export const getMyResumes = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const resumes = await Resume.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    ApiResponse.success(res, { resumes });
  } catch (error) {
    next(error);
  }
};

export const getResumeById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!resume) throw ApiError.notFound('Resume not found');

    ApiResponse.success(res, { resume });
  } catch (error) {
    next(error);
  }
};

export const setDefaultResume = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!resume) throw ApiError.notFound('Resume not found');

    // Unset all defaults
    await Resume.updateMany({ user: req.user._id }, { isDefault: false });
    resume.isDefault = true;
    await resume.save();

    ApiResponse.success(res, { resume }, 'Default resume updated');
  } catch (error) {
    next(error);
  }
};

export const deleteResume = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!resume) throw ApiError.notFound('Resume not found');

    // Delete from cloudinary
    if (resume.filePublicId) {
      await deleteFromCloudinary(resume.filePublicId);
    }

    await Resume.findByIdAndDelete(req.params.id);

    // Set new default if deleted was default
    if (resume.isDefault) {
      const latestResume = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 });
      if (latestResume) {
        latestResume.isDefault = true;
        await latestResume.save();
      }
    }

    ApiResponse.success(res, null, 'Resume deleted');
  } catch (error) {
    next(error);
  }
};

export const reParseResume = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!resume) throw ApiError.notFound('Resume not found');

    parseResumeAsync(resume._id.toString(), resume.fileUrl, resume.fileType, req.user._id.toString());

    ApiResponse.success(res, null, 'Resume re-parsing initiated');
  } catch (error) {
    next(error);
  }
};
