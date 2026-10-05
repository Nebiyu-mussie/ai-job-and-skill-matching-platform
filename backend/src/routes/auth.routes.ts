import { Router } from 'express';
import {
  register, login, logout, logoutAll, refreshToken,
  verifyEmail, forgotPassword, resetPassword, changePassword, getMe,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.post('/logout-all', authenticate, logoutAll);
router.post('/refresh-token', refreshToken);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.put('/change-password', authenticate, changePassword);
router.get('/me', authenticate, getMe);

export default router;
