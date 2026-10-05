import { Router } from 'express';
import {
  applyForJob, getMyApplications, getApplicationById, updateApplicationStatus,
  withdrawApplication, getEmployerApplications, starApplication,
} from '../controllers/application.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, authorize('jobseeker'), applyForJob);
router.get('/my', authenticate, authorize('jobseeker'), getMyApplications);
router.get('/employer', authenticate, authorize('employer', 'admin'), getEmployerApplications);
router.get('/:id', authenticate, getApplicationById);
router.put('/:id/status', authenticate, authorize('employer', 'admin'), updateApplicationStatus);
router.patch('/:id/withdraw', authenticate, authorize('jobseeker'), withdrawApplication);
router.patch('/:id/star', authenticate, authorize('employer'), starApplication);

export default router;
