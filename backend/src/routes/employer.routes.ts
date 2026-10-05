import { Router } from 'express';
import {
  getMyEmployerProfile, updateEmployerProfile, uploadCompanyLogo,
  getEmployerPublicProfile, getEmployerDashboardStats, getAllEmployers,
} from '../controllers/employer.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadCompanyLogo as uploadLogoMiddleware } from '../config/cloudinary';

const router = Router();

router.get('/', getAllEmployers);
router.get('/profile', authenticate, authorize('employer'), getMyEmployerProfile);
router.put('/profile', authenticate, authorize('employer'), updateEmployerProfile);
router.post('/profile/logo', authenticate, authorize('employer'), uploadLogoMiddleware.single('logo'), uploadCompanyLogo);
router.get('/dashboard/stats', authenticate, authorize('employer'), getEmployerDashboardStats);
router.get('/:slug', getEmployerPublicProfile);

export default router;
