import { Router } from 'express';
import {
  getAdminAnalytics, getEmployerAnalytics, getJobSeekerAnalytics,
} from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/admin', authenticate, authorize('admin'), getAdminAnalytics);
router.get('/employer', authenticate, authorize('employer'), getEmployerAnalytics);
router.get('/jobseeker', authenticate, authorize('jobseeker'), getJobSeekerAnalytics);

export default router;
