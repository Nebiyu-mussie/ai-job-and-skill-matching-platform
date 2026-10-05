import { Router } from 'express';
import {
  getMatchScore, getMyMatches, getSkillGapAnalysis, rankCandidatesForJob,
} from '../controllers/match.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/my-matches', authenticate, authorize('jobseeker'), getMyMatches);
router.get('/job/:jobId', authenticate, authorize('jobseeker'), getMatchScore);
router.get('/skill-gap/:jobId', authenticate, authorize('jobseeker'), getSkillGapAnalysis);
router.post('/rank/:jobId', authenticate, authorize('employer', 'admin'), rankCandidatesForJob);

export default router;
