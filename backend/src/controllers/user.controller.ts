import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model';
import { Application } from '../models/Application.model';
import { ApiResponse, getPaginationParams, buildPaginationMeta } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth.middleware';
import { deleteFromCloudinary, isCloudinaryConfigured } from '../config/cloudinary';

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const user = await User.findById(req.user._id)
      .populate('employer')
      .lean();

    if (!user) throw ApiError.notFound('User not found');

    const userObj = user as any;
    delete userObj.password;
    delete userObj.refreshTokens;

    ApiResponse.success(res, { user: userObj });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const allowedFields = [
      'firstName', 'lastName', 'phone', 'location', 'headline', 'bio',
      'skills', 'experience', 'education', 'certifications', 'languages',
      'portfolio', 'linkedIn', 'github', 'jobPreferences',
    ];

    const updates: any = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Find the user first to calculate profile completeness
    const userDoc = await User.findById(req.user._id);
    if (!userDoc) throw ApiError.notFound('User not found');

    // Apply updates
    Object.assign(userDoc, updates);
    
    // Calculate profile completeness
    userDoc.profileCompleteness = userDoc.calculateProfileCompleteness();
    
    // Save the updated user
    await userDoc.save();

    // Convert to plain object and remove sensitive fields
    const userObj: any = userDoc.toObject();
    delete userObj.password;
    delete userObj.refreshTokens;

    ApiResponse.success(res, { user: userObj }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

export const uploadProfileImage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();
    if (!req.file) throw ApiError.badRequest('No image uploaded');

    const file = req.file as any;

    // Delete old profile image if using Cloudinary
    if (isCloudinaryConfigured && req.user.profileImagePublicId) {
      await deleteFromCloudinary(req.user.profileImagePublicId);
    }

    // Determine the file path/URL based on storage type
    let profileImageUrl: string;
    
    if (isCloudinaryConfigured) {
      profileImageUrl = file.path; // Cloudinary URL
    } else {
      // For local storage, use the filename only (served via /uploads route)
      profileImageUrl = `http://localhost:${process.env.PORT || 5001}/uploads/${file.filename}`;
    }
    
    const publicId = isCloudinaryConfigured ? file.filename : undefined;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        profileImage: profileImageUrl,
        ...(publicId && { profileImagePublicId: publicId }),
      },
      { new: true }
    ).select('-password -refreshTokens');

    if (!user) throw ApiError.notFound('User not found');

    ApiResponse.success(res, { 
      profileImage: profileImageUrl,
      user 
    }, 'Profile image updated');
  } catch (error) {
    next(error);
  }
};

export const getUserPublicProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)
      .select('firstName lastName profileImage headline bio skills experience education certifications languages portfolio linkedIn github location profileCompleteness createdAt')
      .lean();

    if (!user) throw ApiError.notFound('User not found');

    ApiResponse.success(res, { user });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const [
      totalApplications,
      pendingApplications,
      interviewApplications,
      rejectedApplications,
      profileCompleteness,
    ] = await Promise.all([
      Application.countDocuments({ applicant: req.user._id }),
      Application.countDocuments({ applicant: req.user._id, status: 'pending' }),
      Application.countDocuments({
        applicant: req.user._id,
        status: { $in: ['shortlisted', 'interviewed'] },
      }),
      Application.countDocuments({ applicant: req.user._id, status: 'rejected' }),
      User.findById(req.user._id).select('profileCompleteness'),
    ]);

    const recentApplications = await Application.find({ applicant: req.user._id })
      .sort({ appliedAt: -1 })
      .limit(5)
      .populate('job', 'title location')
      .populate({ path: 'job', populate: { path: 'employer', select: 'companyName logo' } })
      .lean();

    ApiResponse.success(res, {
      stats: {
        totalApplications,
        pendingApplications,
        interviewApplications,
        rejectedApplications,
        profileCompleteness: profileCompleteness?.profileCompleteness || 0,
      },
      recentApplications,
    });
  } catch (error) {
    next(error);
  }
};

export const addSkill = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const { name, level, yearsOfExperience } = req.body;

    const skillExists = req.user.skills?.some(
      (s) => s.name.toLowerCase() === name.toLowerCase()
    );
    if (skillExists) throw ApiError.conflict('Skill already added');

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          skills: { name, level: level || 'intermediate', yearsOfExperience },
        },
      },
      { new: true }
    );

    ApiResponse.success(res, { skills: user?.skills }, 'Skill added');
  } catch (error) {
    next(error);
  }
};

export const removeSkill = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { skills: { name: req.params.skillName } } },
      { new: true }
    );

    ApiResponse.success(res, { skills: user?.skills }, 'Skill removed');
  } catch (error) {
    next(error);
  }
};

export const searchCandidates = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();
    if (!['employer', 'admin'].includes(req.user.role)) {
      throw ApiError.forbidden('Only employers can search candidates');
    }

    const { page, limit, skip } = getPaginationParams(req.query);
    const { search, skills, location, experienceLevel, educationLevel } = req.query;

    const filter: any = { role: 'jobseeker', isActive: true };

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { headline: { $regex: search, $options: 'i' } },
      ];
    }

    if (skills) {
      const skillList = (skills as string).split(',');
      filter['skills.name'] = { $in: skillList.map((s) => new RegExp(s, 'i')) };
    }

    if (location) {
      filter['location.city'] = { $regex: location, $options: 'i' };
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('firstName lastName profileImage headline skills experience education location createdAt profileCompleteness')
        .sort({ profileCompleteness: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    ApiResponse.paginated(res, users, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};
