import { User } from '../models/User.model';
import { Skill } from '../models/Skill.model';
import { logger } from './logger';

export const seedAdmin = async (): Promise<void> => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ai-job-platform.com';

  console.log('👉 Running seedAdmin...');

  const adminExists = await User.findOne({ email: adminEmail });

  if (!adminExists) {
    await User.create({
      firstName: 'System',
      lastName: 'Admin',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'Admin123', // ✅ simpler password
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
    });

    console.log('✅ Admin user seeded');
  } else {
    console.log('✅ Admin already exists');
  }

  // Skills seeding disabled - use npm run seed to seed full database
  // const skillCount = await Skill.countDocuments();
  // if (skillCount === 0) {
  //   await seedSkills();
  //   console.log('✅ Skills seeded');
  // }
};

const seedSkills = async (): Promise<void> => {
  const skills = [
    // Programming
    { name: 'JavaScript', category: 'Programming', subcategory: 'Web Development' },
    { name: 'TypeScript', category: 'Programming', subcategory: 'Web Development' },
    { name: 'Python', category: 'Programming', subcategory: 'General Purpose' },
    { name: 'Java', category: 'Programming', subcategory: 'Enterprise' },
    { name: 'C++', category: 'Programming', subcategory: 'Systems' },
    { name: 'Go', category: 'Programming', subcategory: 'Systems' },
    { name: 'Rust', category: 'Programming', subcategory: 'Systems' },
    { name: 'PHP', category: 'Programming', subcategory: 'Web Development' },
    { name: 'Ruby', category: 'Programming', subcategory: 'Web Development' },
    // Frontend
    { name: 'React', category: 'Frontend', subcategory: 'Framework' },
    { name: 'Vue.js', category: 'Frontend', subcategory: 'Framework' },
    { name: 'Angular', category: 'Frontend', subcategory: 'Framework' },
    { name: 'Next.js', category: 'Frontend', subcategory: 'Framework' },
    { name: 'HTML', category: 'Frontend', subcategory: 'Markup' },
    { name: 'CSS', category: 'Frontend', subcategory: 'Styling' },
    { name: 'Tailwind CSS', category: 'Frontend', subcategory: 'Styling' },
    // Backend
    { name: 'Node.js', category: 'Backend', subcategory: 'Runtime' },
    { name: 'Express.js', category: 'Backend', subcategory: 'Framework' },
    { name: 'Django', category: 'Backend', subcategory: 'Framework' },
    { name: 'FastAPI', category: 'Backend', subcategory: 'Framework' },
    { name: 'Spring Boot', category: 'Backend', subcategory: 'Framework' },
    // Database
    { name: 'MongoDB', category: 'Database', subcategory: 'NoSQL' },
    { name: 'PostgreSQL', category: 'Database', subcategory: 'SQL' },
    { name: 'MySQL', category: 'Database', subcategory: 'SQL' },
    { name: 'Redis', category: 'Database', subcategory: 'Cache' },
    // Cloud & DevOps
    { name: 'AWS', category: 'Cloud', subcategory: 'Platform' },
    { name: 'Docker', category: 'DevOps', subcategory: 'Containerization' },
    { name: 'Kubernetes', category: 'DevOps', subcategory: 'Orchestration' },
    { name: 'CI/CD', category: 'DevOps', subcategory: 'Automation' },
    { name: 'Git', category: 'DevOps', subcategory: 'Version Control' },
    // AI/ML
    { name: 'Machine Learning', category: 'AI/ML', subcategory: 'General' },
    { name: 'Deep Learning', category: 'AI/ML', subcategory: 'Neural Networks' },
    { name: 'NLP', category: 'AI/ML', subcategory: 'Natural Language Processing' },
    { name: 'TensorFlow', category: 'AI/ML', subcategory: 'Framework' },
    { name: 'PyTorch', category: 'AI/ML', subcategory: 'Framework' },
    { name: 'Scikit-learn', category: 'AI/ML', subcategory: 'Framework' },
    // Soft Skills
    { name: 'Communication', category: 'Soft Skills', subcategory: 'Interpersonal' },
    { name: 'Team Leadership', category: 'Soft Skills', subcategory: 'Management' },
    { name: 'Problem Solving', category: 'Soft Skills', subcategory: 'Analytical' },
    { name: 'Project Management', category: 'Soft Skills', subcategory: 'Management' },
    // Ethiopian/African Market Specific
    { name: 'Amharic', category: 'Language', subcategory: 'Ethiopian' },
    { name: 'Oromo', category: 'Language', subcategory: 'Ethiopian' },
    { name: 'Tigrinya', category: 'Language', subcategory: 'Ethiopian' },
    { name: 'Swahili', category: 'Language', subcategory: 'African' },
    { name: 'Financial Analysis', category: 'Finance', subcategory: 'Analysis' },
    { name: 'Accounting', category: 'Finance', subcategory: 'General' },
    { name: 'Supply Chain Management', category: 'Operations', subcategory: 'Logistics' },
  ];

  await Skill.insertMany(skills);
};
