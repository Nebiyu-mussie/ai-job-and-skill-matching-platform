import { z } from 'zod';

export const createJobSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Job title cannot be empty')
    .max(100, 'Job title cannot exceed 100 characters'),

  description: z
    .string()
    .trim()
    .min(100, 'Job description must be at least 100 characters'),

  category: z
    .string()
    .min(1, 'Job category cannot be empty'),

  jobType: z.enum(['full-time', 'part-time', 'contract', 'internship', 'freelance', 'temporary']),

  experienceLevel: z.enum(['entry', 'junior', 'mid', 'senior', 'lead', 'director', 'executive']),

  location: z.object({
    city: z.string().min(1, 'City cannot be empty'),
    region: z.string().optional(),
    country: z.string().default('Ethiopia'),
    isRemote: z.boolean().default(false),
    remoteType: z.enum(['fully-remote', 'hybrid', 'optional']).optional(),
  }),

  requiredSkills: z
    .array(
      z.object({
        name: z.string().min(1, 'Skill name cannot be empty'),
        level: z.string().optional(),
        isRequired: z.boolean().default(true),
      })
    )
    .min(1, 'At least one skill is required')
    .max(50, 'Cannot exceed 50 required skills'),

  niceToHaveSkills: z.array(z.string()).optional(),

  salary: z
    .object({
      min: z.number().min(0, 'Minimum salary must be non-negative'),
      max: z.number().min(0, 'Maximum salary must be non-negative'),
      currency: z.string().default('ETB'),
      period: z.enum(['hourly', 'monthly', 'annual']).default('monthly'),
      isNegotiable: z.boolean().default(false),
      isVisible: z.boolean().default(true),
    })
    .refine((data) => data.max >= data.min, {
      message: 'Maximum salary must be greater than or equal to minimum salary',
      path: ['max'],
    })
    .optional(),

  requirements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),

  experienceYears: z
    .object({
      min: z.number().min(0).default(0),
      max: z.number().min(0).optional(),
    })
    .optional(),

  educationLevel: z.string().optional(),

  applicationDeadline: z
    .string()
    .or(z.date())
    .transform((val) => (typeof val === 'string' ? new Date(val) : val))
    .optional(),

  applicationInstructions: z.string().optional(),
  externalApplicationUrl: z.string().url('Must be a valid URL').optional(),

  screeningQuestions: z
    .array(
      z.object({
        question: z.string().min(1, 'Question cannot be empty'),
        type: z.enum(['text', 'yes_no', 'multiple_choice']).default('text'),
        options: z.array(z.string()).optional(),
        isRequired: z.boolean().default(false),
      })
    )
    .optional(),

  status: z.enum(['draft', 'active', 'paused']).default('active'),
});

export const updateJobSchema = createJobSchema.partial();

export const jobQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('20').transform(Number),
  search: z.string().optional(),
  category: z.string().optional(),
  jobType: z.string().optional(), // comma-separated
  experienceLevel: z.string().optional(), // comma-separated
  city: z.string().optional(),
  country: z.string().optional(),
  isRemote: z.enum(['true', 'false']).optional(),
  minSalary: z.string().optional().transform((val) => val ? Number(val) : undefined),
  maxSalary: z.string().optional().transform((val) => val ? Number(val) : undefined),
  currency: z.string().optional(),
  skills: z.string().optional(), // comma-separated
  status: z.string().optional().default('active'),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type JobQueryInput = z.infer<typeof jobQuerySchema>;
