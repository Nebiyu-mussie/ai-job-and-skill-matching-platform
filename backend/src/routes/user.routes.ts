import { Router } from 'express';
import {
  getProfile, updateProfile, uploadProfileImage, getUserPublicProfile,
  getDashboardStats, addSkill, removeSkill, searchCandidates,
} from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadProfileImage as uploadProfileImageMiddleware } from '../config/cloudinary';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/profile/image', authenticate, uploadProfileImageMiddleware.single('profileImage'), uploadProfileImage);
router.get('/dashboard/stats', authenticate, authorize('jobseeker'), getDashboardStats);
router.post('/skills', authenticate, authorize('jobseeker'), addSkill);
router.delete('/skills/:skillName', authenticate, authorize('jobseeker'), removeSkill);
router.get('/search', authenticate, authorize('employer', 'admin'), searchCandidates);
router.get('/:id', getUserPublicProfile);

export default router;
