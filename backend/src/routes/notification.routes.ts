import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { notificationService } from '../services/notification.service';
import { ApiResponse } from '../utils/ApiResponse';

const router = Router();

router.get('/', authenticate, async (req: any, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await notificationService.getByUser(
      req.user._id.toString(),
      parseInt(page) || 1,
      parseInt(limit) || 20
    );
    ApiResponse.success(res, result);
  } catch (error) { next(error); }
});

router.patch('/:id/read', authenticate, async (req: any, res, next) => {
  try {
    await notificationService.markAsRead(req.params.id, req.user._id.toString());
    ApiResponse.success(res, null, 'Notification marked as read');
  } catch (error) { next(error); }
});

router.patch('/read-all', authenticate, async (req: any, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user._id.toString());
    ApiResponse.success(res, null, 'All notifications marked as read');
  } catch (error) { next(error); }
});

router.delete('/:id', authenticate, async (req: any, res, next) => {
  try {
    await notificationService.deleteNotification(req.params.id, req.user._id.toString());
    ApiResponse.success(res, null, 'Notification deleted');
  } catch (error) { next(error); }
});

export default router;
