import { Router } from 'express';
import {
  createJob, getJobs, getJobById, updateJob, deleteJob,
  getEmployerJobs, getJobCandidates, getJobCategories, updateJobStatus,
} from '../controllers/job.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', optionalAuth, getJobs);
router.get('/categories', getJobCategories);
router.get('/employer/my-jobs', authenticate, authorize('employer', 'admin'), getEmployerJobs);
router.get('/:id', optionalAuth, getJobById);
router.post('/', authenticate, authorize('employer', 'admin'), createJob);
router.put('/:id', authenticate, authorize('employer', 'admin'), updateJob);
router.patch('/:id/status', authenticate, authorize('employer', 'admin'), updateJobStatus);
router.delete('/:id', authenticate, authorize('employer', 'admin'), deleteJob);
router.get('/:id/candidates', authenticate, authorize('employer', 'admin'), getJobCandidates);

export default router;
