import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Bookmark } from '../models/Bookmark.model';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

const router = Router();

router.get('/', authenticate, authorize('jobseeker'), async (req: any, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'job',
        populate: { path: 'employer', select: 'companyName logo isVerified' },
      })
      .lean();
    ApiResponse.success(res, { bookmarks });
  } catch (error) { next(error); }
});

router.post('/', authenticate, authorize('jobseeker'), async (req: any, res, next) => {
  try {
    const { jobId, notes } = req.body;
    const existing = await Bookmark.findOne({ user: req.user._id, job: jobId });
    if (existing) throw ApiError.conflict('Job already bookmarked');
    const bookmark = await Bookmark.create({ user: req.user._id, job: jobId, notes });
    ApiResponse.created(res, { bookmark }, 'Job saved');
  } catch (error) { next(error); }
});

router.delete('/:jobId', authenticate, authorize('jobseeker'), async (req: any, res, next) => {
  try {
    await Bookmark.findOneAndDelete({ user: req.user._id, job: req.params.jobId });
    ApiResponse.success(res, null, 'Job removed from saved');
  } catch (error) { next(error); }
});

export default router;
