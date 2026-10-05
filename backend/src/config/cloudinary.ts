import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';
import { logger } from '../utils/logger';

// Check if Cloudinary credentials are configured
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  logger.info('✅ Cloudinary configured');
} else {
  logger.warn('⚠️  Cloudinary credentials not configured. File uploads will be stored locally.');
}

// Local storage fallback
const localStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Storage configurations
const getResumeStorage = () => {
  if (!isCloudinaryConfigured) return localStorage;
  
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'ai-job-platform/resumes',
      allowed_formats: ['pdf', 'doc', 'docx'],
      resource_type: 'raw',
    } as any,
  });
};

const getProfileImageStorage = () => {
  if (!isCloudinaryConfigured) return localStorage;
  
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'ai-job-platform/profiles',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 400, height: 400, crop: 'fill' }],
    } as any,
  });
};

const getCompanyLogoStorage = () => {
  if (!isCloudinaryConfigured) return localStorage;
  
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'ai-job-platform/logos',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
      transformation: [{ width: 200, height: 200, crop: 'fit' }],
    } as any,
  });
};

export const uploadResume = multer({
  storage: getResumeStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  },
});

export const uploadProfileImage = multer({
  storage: getProfileImageStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  },
});

export const uploadCompanyLogo = multer({
  storage: getCompanyLogoStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  if (isCloudinaryConfigured) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      logger.error('Error deleting from Cloudinary:', error);
    }
  }
};

export { isCloudinaryConfigured };
export default cloudinary;
