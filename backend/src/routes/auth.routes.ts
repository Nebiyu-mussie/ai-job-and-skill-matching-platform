import { Router } from 'express';
import {
  register, login, logout, logoutAll, refreshToken,
  verifyEmail, forgotPassword, resetPassword, changePassword, getMe,
} from '../controllers/auth.controller';
import { authenticate, softAuthenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', softAuthenticate, logout); // Use softAuthenticate for graceful logout
router.post('/logout-all', softAuthenticate, logoutAll); // Use softAuthenticate for graceful logout
router.post('/refresh-token', refreshToken);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.put('/change-password', authenticate, changePassword);
router.get('/me', authenticate, getMe);

export default router;
