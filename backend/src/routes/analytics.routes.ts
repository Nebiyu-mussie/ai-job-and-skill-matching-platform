import { Router } from 'express';
import {
  getAdminAnalytics, getEmployerAnalytics, getJobseekerAnalytics,
} from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/admin', authenticate, authorize('admin'), getAdminAnalytics);
router.get('/employer', authenticate, authorize('employer'), getEmployerAnalytics);
router.get('/jobseeker', authenticate, authorize('jobseeker'), getJobseekerAnalytics);

export default router;
