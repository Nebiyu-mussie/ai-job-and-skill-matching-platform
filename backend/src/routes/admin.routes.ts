import { Router } from 'express';
import {
  getAllUsers, banUser, unbanUser, verifyEmployer, rejectEmployer,
  getAuditLogs, manageSkills, getPendingVerifications, deleteJob,
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All admin routes require admin role
router.use(authenticate, authorize('admin'));

router.get('/users', getAllUsers);
router.patch('/users/:id/ban', banUser);
router.patch('/users/:id/unban', unbanUser);
router.get('/employers/pending', getPendingVerifications);
router.patch('/employers/:id/verify', verifyEmployer);
router.patch('/employers/:id/reject', rejectEmployer);
router.get('/audit-logs', getAuditLogs);
router.post('/skills', manageSkills);
router.delete('/jobs/:id', deleteJob);

export default router;
