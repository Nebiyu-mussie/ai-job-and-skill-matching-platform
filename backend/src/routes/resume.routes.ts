import { Router } from 'express';
import {
  uploadResume as uploadResumeController,
  getMyResumes, getResumeById, setDefaultResume, deleteResume, reParseResume,
} from '../controllers/resume.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadResume } from '../config/cloudinary';

const router = Router();

router.post('/upload', authenticate, authorize('jobseeker'), uploadResume.single('resume'), uploadResumeController);
router.get('/', authenticate, authorize('jobseeker'), getMyResumes);
router.get('/:id', authenticate, getResumeById);
router.patch('/:id/set-default', authenticate, authorize('jobseeker'), setDefaultResume);
router.delete('/:id', authenticate, authorize('jobseeker'), deleteResume);
router.post('/:id/reparse', authenticate, authorize('jobseeker'), reParseResume);

export default router;
