import { Router, Request, Response, NextFunction } from 'express';
import {
  uploadResume as uploadResumeController,
  getMyResumes, getResumeById, setDefaultResume, deleteResume, reParseResume,
} from '../controllers/resume.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadResume } from '../config/cloudinary';
import { MulterError } from 'multer';

const router = Router();

// Multer error handling middleware
const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 5MB limit',
        timestamp: new Date().toISOString(),
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name. Use "resume" as the field name.',
        timestamp: new Date().toISOString(),
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error',
      timestamp: new Date().toISOString(),
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload failed',
      timestamp: new Date().toISOString(),
    });
  }
  
  return next();
};

router.post('/upload', authenticate, authorize('jobseeker'), uploadResume.single('resume'), handleMulterError, uploadResumeController);
router.get('/', authenticate, authorize('jobseeker'), getMyResumes);
router.get('/:id', authenticate, getResumeById);
router.patch('/:id/set-default', authenticate, authorize('jobseeker'), setDefaultResume);
router.delete('/:id', authenticate, authorize('jobseeker'), deleteResume);
router.post('/:id/reparse', authenticate, authorize('jobseeker'), reParseResume);

export default router;
