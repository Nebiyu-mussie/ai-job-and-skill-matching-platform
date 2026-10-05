import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.model';
import { Employer } from '../models/Employer.model';
import { Job } from '../models/Job.model';
import { logger } from '../utils/logger';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_job_platform';

// Ethiopian Companies Data
const ethiopianCompanies = [
  {
    name: 'Ethio Telecom',
    industry: 'Telecommunications',
    size: 'enterprise' as const,
    city: 'Addis Ababa',
    website: 'https://ethiotelecom.et',
    description: 'Leading telecommunications service provider in Ethiopia, serving millions of customers nationwide.',
  },
  {
    name: 'Awash Bank',
    industry: 'Banking & Finance',
    size: 'large' as const,
    city: 'Addis Ababa',
    website: 'https://awashbank.com',
    description: 'One of the largest private banks in Ethiopia, providing comprehensive banking services.',
  },
  {
    name: 'Ethiopian Airlines IT',
    industry: 'Aviation Technology',
    size: 'large' as const,
    city: 'Addis Ababa',
    website: 'https://ethiopianairlines.com',
    description: 'Technology division of Africa\'s largest airline, driving digital transformation.',
  },
];

// Job Seeker Profiles
const jobSeekers = [
  {
    firstName: 'Abebe',
    lastName: 'Kebede',
    email: 'abebe.kebede@email.com',
    headline: 'Full Stack Developer | MERN Expert',
    bio: 'Experienced software engineer with 5 years in web development. Passionate about building scalable applications.',
    city: 'Addis Ababa',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'TypeScript'],
    experience: 5,
  },
  {
    firstName: 'Tigist',
    lastName: 'Haile',
    email: 'tigist.haile@email.com',
    headline: 'Senior Data Scientist | ML Specialist',
    bio: 'Data scientist specializing in machine learning and predictive analytics. Ph.D. in Computer Science.',
    city: 'Addis Ababa',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis', 'SQL'],
    experience: 7,
  },
  {
    firstName: 'Dawit',
    lastName: 'Mengistu',
    email: 'dawit.mengistu@email.com',
    headline: 'Mobile App Developer | Flutter Expert',
    bio: 'Mobile developer creating beautiful cross-platform applications for iOS and Android.',
    city: 'Bahir Dar',
    skills: ['Flutter', 'Dart', 'Firebase', 'Mobile UI/UX', 'React Native'],
    experience: 3,
  },
  {
    firstName: 'Meron',
    lastName: 'Tadesse',
    email: 'meron.tadesse@email.com',
    headline: 'DevOps Engineer | Cloud Infrastructure',
    bio: 'DevOps specialist with expertise in AWS, Docker, and Kubernetes. Building reliable infrastructure.',
    city: 'Addis Ababa',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
    experience: 4,
  },
  {
    firstName: 'Sara',
    lastName: 'Alemayehu',
    email: 'sara.alemayehu@email.com',
    headline: 'UI/UX Designer | Product Design',
    bio: 'Creative designer focused on user-centered design and creating delightful digital experiences.',
    city: 'Hawassa',
    skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping', 'Adobe XD'],
    experience: 3,
  },
  {
    firstName: 'Yohannes',
    lastName: 'Assefa',
    email: 'yohannes.assefa@email.com',
    headline: 'Backend Developer | API Specialist',
    bio: 'Backend engineer building robust RESTful APIs and microservices architecture.',
    city: 'Addis Ababa',
    skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Microservices', 'Redis'],
    experience: 4,
  },
  {
    firstName: 'Helen',
    lastName: 'Tesfaye',
    email: 'helen.tesfaye@email.com',
    headline: 'Frontend Developer | React Specialist',
    bio: 'Frontend developer passionate about creating responsive and accessible web applications.',
    city: 'Mekelle',
    skills: ['React', 'JavaScript', 'CSS', 'HTML', 'Redux'],
    experience: 2,
  },
  {
    firstName: 'Daniel',
    lastName: 'Bekele',
    email: 'daniel.bekele@email.com',
    headline: 'Cybersecurity Analyst | Ethical Hacker',
    bio: 'Security professional specialized in penetration testing and vulnerability assessment.',
    city: 'Addis Ababa',
    skills: ['Cybersecurity', 'Penetration Testing', 'Network Security', 'Linux', 'Python'],
    experience: 5,
  },
  {
    firstName: 'Bethlehem',
    lastName: 'Worku',
    email: 'bethlehem.worku@email.com',
    headline: 'Business Analyst | Agile Practitioner',
    bio: 'Business analyst bridging the gap between business needs and technical solutions.',
    city: 'Dire Dawa',
    skills: ['Business Analysis', 'Agile', 'SQL', 'JIRA', 'Requirements Gathering'],
    experience: 3,
  },
  {
    firstName: 'Michael',
    lastName: 'Wolde',
    email: 'michael.wolde@email.com',
    headline: 'QA Engineer | Test Automation',
    bio: 'Quality assurance engineer ensuring software quality through comprehensive testing strategies.',
    city: 'Addis Ababa',
    skills: ['Test Automation', 'Selenium', 'Java', 'API Testing', 'Cypress'],
    experience: 4,
  },
];

async function seed() {
  try {
    // Connect to MongoDB
    logger.info(`Connecting to MongoDB: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');

    // Clear existing data
    logger.info('Clearing existing data...');
    await User.deleteMany({});
    await Employer.deleteMany({});
    await Job.deleteMany({});
    logger.info('Data cleared');

    // Create Admin User
    logger.info('Creating admin user...');
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@aijobplatform.com',
      password: 'Admin@123',
      role: 'admin',
      isEmailVerified: true,
      location: { city: 'Addis Ababa', country: 'Ethiopia' },
    });
    logger.info(`Admin created: ${admin.email}`);

    // Create Employer Users and Profiles
    logger.info('Creating employers...');
    const employers = [];
    for (const company of ethiopianCompanies) {
      const employerUser = await User.create({
        firstName: company.name,
        lastName: 'HR',
        email: `hr@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
        password: 'Employer@123',
        role: 'employer',
        isEmailVerified: true,
        location: { city: company.city, country: 'Ethiopia' },
      });

      const employer = await Employer.create({
        user: employerUser._id,
        companyName: company.name,
        industry: company.industry,
        companySize: company.size,
        website: company.website,
        description: company.description,
        location: { city: company.city, country: 'Ethiopia' },
        contactEmail: employerUser.email,
        isVerified: true,
        verifiedAt: new Date(),
        subscriptionPlan: 'premium',
        jobPostLimit: 50,
        benefits: ['Health Insurance', 'Paid Time Off', 'Professional Development', 'Retirement Plan'],
      });

      await User.findByIdAndUpdate(employerUser._id, { employer: employer._id });
      employers.push(employer);
      logger.info(`Employer created: ${company.name}`);
    }

    // Create Job Seekers
    logger.info('Creating job seekers...');
    const seekers = [];
    for (const seeker of jobSeekers) {
      const user = await User.create({
        firstName: seeker.firstName,
        lastName: seeker.lastName,
        email: seeker.email,
        password: 'JobSeeker@123',
        role: 'jobseeker',
        isEmailVerified: true,
        headline: seeker.headline,
        bio: seeker.bio,
        location: { city: seeker.city, country: 'Ethiopia' },
        skills: seeker.skills.map(skill => ({
          name: skill,
          level: 'advanced' as const,
          yearsOfExperience: seeker.experience,
        })),
        experience: [
          {
            title: seeker.headline.split('|')[0].trim(),
            company: 'Previous Company',
            location: seeker.city,
            startDate: new Date(new Date().setFullYear(new Date().getFullYear() - seeker.experience)),
            isCurrent: true,
            description: `Working as ${seeker.headline.split('|')[0].trim()}`,
          },
        ],
        education: [
          {
            degree: 'Bachelor of Science',
            institution: 'Mekdela Amba University',
            fieldOfStudy: 'Computer Science',
            startDate: new Date('2015-09-01'),
            endDate: new Date('2019-06-30'),
            grade: 'Distinction',
          },
        ],
        languages: [
          { name: 'Amharic', proficiency: 'native' as const },
          { name: 'English', proficiency: 'fluent' as const },
        ],
        jobPreferences: {
          jobTypes: ['full-time', 'contract'],
          expectedSalary: { min: 30000, max: 60000, currency: 'ETB' },
          preferredLocations: [seeker.city, 'Addis Ababa'],
          remotePreference: 'flexible' as const,
        },
      });
      seekers.push(user);
      logger.info(`Job seeker created: ${seeker.firstName} ${seeker.lastName}`);
    }

    // Create Jobs
    logger.info('Creating job postings...');
    const jobTemplates = [
      {
        title: 'Senior Full Stack Developer',
        category: 'Software Development',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'TypeScript'],
        experienceLevel: 'senior' as const,
        experienceYears: { min: 5, max: 8 },
        salary: { min: 50000, max: 80000 },
        jobType: 'full-time' as const,
        description: 'We are seeking an experienced Full Stack Developer to join our engineering team.',
      },
      {
        title: 'Data Scientist',
        category: 'Data Science & Analytics',
        skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis', 'SQL'],
        experienceLevel: 'senior' as const,
        experienceYears: { min: 5, max: 10 },
        salary: { min: 60000, max: 100000 },
        jobType: 'full-time' as const,
        description: 'Join our data team to build AI-powered solutions for business intelligence.',
      },
      {
        title: 'Mobile Application Developer',
        category: 'Mobile Development',
        skills: ['Flutter', 'Dart', 'Firebase', 'Mobile UI/UX', 'React Native'],
        experienceLevel: 'mid' as const,
        experienceYears: { min: 3, max: 5 },
        salary: { min: 40000, max: 60000 },
        jobType: 'full-time' as const,
        description: 'Develop cutting-edge mobile applications for our growing user base.',
      },
      {
        title: 'DevOps Engineer',
        category: 'DevOps & Infrastructure',
        skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
        experienceLevel: 'mid' as const,
        experienceYears: { min: 3, max: 6 },
        salary: { min: 45000, max: 70000 },
        jobType: 'full-time' as const,
        description: 'Build and maintain our cloud infrastructure and deployment pipelines.',
      },
      {
        title: 'UI/UX Designer',
        category: 'Design',
        skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping', 'Adobe XD'],
        experienceLevel: 'mid' as const,
        experienceYears: { min: 2, max: 5 },
        salary: { min: 35000, max: 55000 },
        jobType: 'full-time' as const,
        description: 'Design beautiful and intuitive user experiences for our digital products.',
      },
      {
        title: 'Backend Developer',
        category: 'Software Development',
        skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Microservices', 'Redis'],
        experienceLevel: 'mid' as const,
        experienceYears: { min: 3, max: 5 },
        salary: { min: 42000, max: 65000 },
        jobType: 'full-time' as const,
        description: 'Build scalable backend services and APIs for our platform.',
      },
      {
        title: 'Frontend Developer',
        category: 'Software Development',
        skills: ['React', 'JavaScript', 'CSS', 'HTML', 'Redux'],
        experienceLevel: 'junior' as const,
        experienceYears: { min: 1, max: 3 },
        salary: { min: 28000, max: 45000 },
        jobType: 'full-time' as const,
        description: 'Create responsive and performant web applications.',
      },
      {
        title: 'Cybersecurity Specialist',
        category: 'Security',
        skills: ['Cybersecurity', 'Penetration Testing', 'Network Security', 'Linux', 'Python'],
        experienceLevel: 'senior' as const,
        experienceYears: { min: 5, max: 8 },
        salary: { min: 55000, max: 85000 },
        jobType: 'full-time' as const,
        description: 'Protect our systems and data through comprehensive security measures.',
      },
      {
        title: 'Business Analyst',
        category: 'Business & Strategy',
        skills: ['Business Analysis', 'Agile', 'SQL', 'JIRA', 'Requirements Gathering'],
        experienceLevel: 'mid' as const,
        experienceYears: { min: 3, max: 5 },
        salary: { min: 38000, max: 58000 },
        jobType: 'full-time' as const,
        description: 'Analyze business requirements and translate them into technical solutions.',
      },
      {
        title: 'QA Engineer',
        category: 'Quality Assurance',
        skills: ['Test Automation', 'Selenium', 'Java', 'API Testing', 'Cypress'],
        experienceLevel: 'mid' as const,
        experienceYears: { min: 2, max: 4 },
        salary: { min: 35000, max: 52000 },
        jobType: 'full-time' as const,
        description: 'Ensure product quality through comprehensive testing strategies.',
      },
      {
        title: 'Python Developer',
        category: 'Software Development',
        skills: ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'REST APIs'],
        experienceLevel: 'mid' as const,
        experienceYears: { min: 3, max: 5 },
        salary: { min: 40000, max: 62000 },
        jobType: 'full-time' as const,
        description: 'Develop backend services using Python and modern frameworks.',
      },
      {
        title: 'Cloud Architect',
        category: 'Cloud Computing',
        skills: ['AWS', 'Azure', 'Cloud Architecture', 'Microservices', 'Security'],
        experienceLevel: 'senior' as const,
        experienceYears: { min: 6, max: 10 },
        salary: { min: 70000, max: 110000 },
        jobType: 'full-time' as const,
        description: 'Design and implement scalable cloud infrastructure solutions.',
      },
      {
        title: 'Product Manager',
        category: 'Product Management',
        skills: ['Product Strategy', 'Agile', 'User Research', 'Roadmap Planning', 'Data Analysis'],
        experienceLevel: 'senior' as const,
        experienceYears: { min: 5, max: 8 },
        salary: { min: 60000, max: 90000 },
        jobType: 'full-time' as const,
        description: 'Lead product development from conception to launch.',
      },
      {
        title: 'Machine Learning Engineer',
        category: 'Artificial Intelligence',
        skills: ['Python', 'TensorFlow', 'PyTorch', 'Deep Learning', 'MLOps'],
        experienceLevel: 'senior' as const,
        experienceYears: { min: 4, max: 7 },
        salary: { min: 65000, max: 95000 },
        jobType: 'full-time' as const,
        description: 'Build and deploy machine learning models at scale.',
      },
      {
        title: 'Software Engineering Intern',
        category: 'Software Development',
        skills: ['JavaScript', 'Python', 'Git', 'Problem Solving', 'Communication'],
        experienceLevel: 'entry' as const,
        experienceYears: { min: 0, max: 1 },
        salary: { min: 15000, max: 25000 },
        jobType: 'internship' as const,
        description: 'Learn and grow with our engineering team as an intern.',
      },
    ];

    const jobs = [];
    let jobIndex = 0;
    for (const employer of employers) {
      // Each employer posts 5 jobs
      for (let i = 0; i < 5; i++) {
        const template = jobTemplates[jobIndex % jobTemplates.length];
        const job = await Job.create({
          employer: employer._id,
          title: template.title,
          description: template.description + ' ' + 
            `Join ${employer.companyName} and be part of our innovative team. We offer competitive compensation, ` +
            'great benefits, and opportunities for professional growth. Our work environment promotes collaboration, ' +
            'creativity, and continuous learning.',
          requirements: [
            `${template.experienceYears.min}+ years of professional experience`,
            'Strong problem-solving and analytical skills',
            'Excellent communication and teamwork abilities',
            'Bachelor\'s degree in related field or equivalent experience',
          ],
          responsibilities: [
            'Design, develop, and maintain software solutions',
            'Collaborate with cross-functional teams',
            'Write clean, efficient, and well-documented code',
            'Participate in code reviews and technical discussions',
            'Contribute to continuous improvement initiatives',
          ],
          requiredSkills: template.skills.map(skill => ({
            name: skill,
            level: template.experienceLevel,
            isRequired: true,
          })),
          niceToHaveSkills: ['Agile Methodologies', 'Team Leadership', 'Cloud Platforms'],
          jobType: template.jobType,
          experienceLevel: template.experienceLevel,
          experienceYears: template.experienceYears,
          educationLevel: 'Bachelor\'s Degree',
          location: {
            city: employer.location.city,
            country: 'Ethiopia',
            isRemote: Math.random() > 0.5,
            remoteType: Math.random() > 0.5 ? 'hybrid' as const : 'optional' as const,
          },
          salary: {
            min: template.salary.min,
            max: template.salary.max,
            currency: 'ETB',
            period: 'monthly' as const,
            isNegotiable: true,
            isVisible: true,
          },
          benefits: employer.benefits,
          category: template.category,
          tags: [...template.skills, template.category, employer.industry],
          applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          status: 'active' as const,
          isFeatured: i === 0, // First job for each employer is featured
          screeningQuestions: [
            {
              question: 'Why are you interested in this position?',
              type: 'text' as const,
              isRequired: true,
            },
            {
              question: 'Are you authorized to work in Ethiopia?',
              type: 'yes_no' as const,
              isRequired: true,
            },
          ],
        });

        jobs.push(job);
        jobIndex++;
      }

      // Update employer's active job count
      await Employer.findByIdAndUpdate(employer._id, {
        activeJobCount: 5,
        totalJobsPosted: 5,
      });

      logger.info(`Created 5 jobs for ${employer.companyName}`);
    }

    // Summary
    logger.info('\n========== SEEDING COMPLETED ==========');
    logger.info(`✓ Admin Users: 1`);
    logger.info(`✓ Employers: ${employers.length}`);
    logger.info(`✓ Job Seekers: ${seekers.length}`);
    logger.info(`✓ Job Postings: ${jobs.length}`);
    logger.info('\n📧 LOGIN CREDENTIALS:');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('Admin:');
    logger.info('  Email: admin@aijobplatform.com');
    logger.info('  Password: Admin@123');
    logger.info('\nEmployers (all use same password):');
    for (const company of ethiopianCompanies) {
      logger.info(`  Email: hr@${company.name.toLowerCase().replace(/\s+/g, '')}.com`);
    }
    logger.info('  Password: Employer@123');
    logger.info('\nJob Seekers (all use same password):');
    for (const seeker of jobSeekers.slice(0, 3)) {
      logger.info(`  Email: ${seeker.email}`);
    }
    logger.info('  ... and 7 more job seekers');
    logger.info('  Password: JobSeeker@123');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
}

// Run seed
seed();
