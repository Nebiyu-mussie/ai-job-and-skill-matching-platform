import { Router } from 'express';
import { Skill } from '../models/Skill.model';
import { ApiResponse, getPaginationParams, buildPaginationMeta } from '../utils/ApiResponse';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search, category } = req.query;

    const filter: any = { isActive: true };
    if (search) filter.$text = { $search: search as string };
    if (category) filter.category = category;

    const [skills, total] = await Promise.all([
      Skill.find(filter).sort({ demandScore: -1 }).skip(skip).limit(limit).lean(),
      Skill.countDocuments(filter),
    ]);

    ApiResponse.paginated(res, skills, buildPaginationMeta(total, page, limit));
  } catch (error) { next(error); }
});

router.get('/categories', async (_req, res, next) => {
  try {
    const categories = await Skill.distinct('category', { isActive: true });
    ApiResponse.success(res, { categories });
  } catch (error) { next(error); }
});

router.get('/trending', async (_req, res, next) => {
  try {
    const skills = await Skill.find({ isActive: true })
      .sort({ demandScore: -1 })
      .limit(20)
      .lean();
    ApiResponse.success(res, { skills });
  } catch (error) { next(error); }
});

export default router;
