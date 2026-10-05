import { Router } from 'express';
import { Course } from '../models/Course.model';
import { ApiResponse, getPaginationParams, buildPaginationMeta } from '../utils/ApiResponse';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { ApiError } from '../utils/ApiError';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search, category, level, skills, isFree } = req.query;

    const filter: any = { isActive: true };
    if (search) filter.$text = { $search: search as string };
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (isFree === 'true') filter.isFree = true;
    if (skills) {
      const skillList = (skills as string).split(',');
      filter.skills = { $in: skillList.map((s) => new RegExp(s, 'i')) };
    }

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .sort({ rating: -1, enrollments: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Course.countDocuments(filter),
    ]);

    ApiResponse.paginated(res, courses, buildPaginationMeta(total, page, limit));
  } catch (error) { next(error); }
});

router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const course = await Course.create(req.body);
    ApiResponse.created(res, { course });
  } catch (error) { next(error); }
});

export default router;
