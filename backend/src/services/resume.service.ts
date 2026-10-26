import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import natural from 'natural';
import axios from 'axios';
import { logger } from '../utils/logger';

const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills: Array<{ name: string; category?: string; level?: string }>;
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
    duration?: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    grade?: string;
  }>;
  certifications: Array<{ name: string; issuer?: string; date?: string }>;
  languages: Array<{ name: string; proficiency?: string }>;
  projects: Array<{
    name: string;
    description?: string;
    technologies?: string[];
    url?: string;
  }>;
  totalExperienceYears?: number;
  extractedText?: string;
  confidence?: number;
}

// Comprehensive skill keywords database
const SKILL_KEYWORDS = {
  // Programming Languages
  programmingLanguages: [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 
    'swift', 'kotlin', 'go', 'rust', 'scala', 'r', 'matlab', 'perl', 
    'objective-c', 'dart', 'elixir', 'haskell', 'lua', 'groovy', 'shell',
    'bash', 'powershell', 'sql', 'plsql', 'tsql', 'nosql'
  ],
  
  // Frontend Technologies
  frontend: [
    'react', 'angular', 'vue', 'vuejs', 'svelte', 'nextjs', 'next.js', 'nuxt',
    'html', 'html5', 'css', 'css3', 'sass', 'scss', 'less', 'tailwind', 
    'bootstrap', 'material-ui', 'mui', 'chakra', 'jquery', 'webpack', 'vite',
    'redux', 'mobx', 'recoil', 'zustand', 'styled-components', 'emotion'
  ],
  
  // Backend Technologies
  backend: [
    'nodejs', 'node.js', 'express', 'nestjs', 'django', 'flask', 'fastapi',
    'spring', 'spring boot', 'laravel', 'rails', 'ruby on rails', 'asp.net',
    '.net', 'graphql', 'rest', 'restful', 'api', 'microservices', 'grpc',
    'serverless', 'lambda', 'azure functions'
  ],
  
  // Databases
  databases: [
    'mongodb', 'postgresql', 'postgres', 'mysql', 'sql server', 'oracle',
    'redis', 'elasticsearch', 'cassandra', 'dynamodb', 'firebase', 'firestore',
    'couchdb', 'neo4j', 'mariadb', 'sqlite', 'supabase'
  ],
  
  // Cloud & DevOps
  cloud: [
    'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'k8s',
    'jenkins', 'gitlab ci', 'github actions', 'circleci', 'travis ci',
    'terraform', 'ansible', 'chef', 'puppet', 'nginx', 'apache', 'linux',
    'ci/cd', 'devops', 'cloudformation', 'helm', 'prometheus', 'grafana'
  ],
  
  // Mobile Development
  mobile: [
    'react native', 'flutter', 'ios', 'android', 'swift', 'swiftui', 
    'kotlin', 'xamarin', 'ionic', 'cordova', 'capacitor'
  ],
  
  // Data Science & AI
  dataScience: [
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras',
    'scikit-learn', 'pandas', 'numpy', 'jupyter', 'nlp', 'computer vision',
    'opencv', 'data analysis', 'statistics', 'tableau', 'power bi',
    'data visualization', 'spark', 'hadoop', 'airflow', 'mlops'
  ],
  
  // Testing & Quality
  testing: [
    'jest', 'mocha', 'chai', 'pytest', 'junit', 'selenium', 'cypress',
    'playwright', 'testing library', 'jasmine', 'karma', 'unit testing',
    'integration testing', 'e2e testing', 'tdd', 'bdd'
  ],
  
  // Other Tools & Concepts
  tools: [
    'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'slack',
    'agile', 'scrum', 'kanban', 'figma', 'sketch', 'adobe xd', 'photoshop',
    'illustrator', 'postman', 'insomnia', 'swagger', 'oauth', 'jwt',
    'websocket', 'mqtt', 'rabbitmq', 'kafka', 'blockchain', 'web3',
    'solidity', 'ethereum', 'smart contracts'
  ]
};

// Soft skills keywords
const SOFT_SKILLS = [
  'leadership', 'communication', 'teamwork', 'problem solving', 'analytical',
  'critical thinking', 'creativity', 'adaptability', 'time management',
  'collaboration', 'presentation', 'negotiation', 'mentoring', 'coaching',
  'project management', 'strategic planning', 'decision making', 'interpersonal',
  'organizational', 'attention to detail', 'multitasking', 'customer service'
];

// Education keywords
const EDUCATION_KEYWORDS = [
  'bachelor', 'master', 'phd', 'doctorate', 'diploma', 'degree',
  'b.tech', 'b.e', 'm.tech', 'm.e', 'mba', 'bba', 'b.sc', 'm.sc',
  'computer science', 'engineering', 'information technology', 'software',
  'electronics', 'mechanical', 'electrical', 'civil', 'business',
  'administration', 'management', 'economics', 'finance', 'marketing'
];

// Certification keywords
const CERTIFICATION_KEYWORDS = [
  'aws certified', 'azure certified', 'google cloud certified', 'certified',
  'certification', 'pmp', 'scrum master', 'csm', 'safe', 'comptia',
  'cisco', 'ccna', 'ccnp', 'ceh', 'cissp', 'oracle certified', 'microsoft certified'
];

class ResumeParserService {
  /**
   * Main parsing method - extracts text and parses content
   */
  async parseResume(fileUrl: string, fileType: string): Promise<ParsedResume> {
    try {
      // Extract text from file
      const extractedText = await this.extractText(fileUrl, fileType);
      
      if (!extractedText || extractedText.trim().length < 50) {
        logger.warn('Insufficient text extracted from resume');
        return this.emptyResult();
      }

      // Parse the extracted text
      const parsed = this.parseExtractedText(extractedText);
      
      logger.info(`Resume parsed: ${parsed.skills.length} skills, ${parsed.experience.length} experiences found`);
      
      return parsed;
    } catch (error) {
      logger.error('Resume parsing error:', error);
      return this.emptyResult();
    }
  }

  /**
   * Extract text from PDF or Word document
   */
  private async extractText(fileUrl: string, fileType: string): Promise<string> {
    try {
      // Download file
      const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);

      if (fileType === 'pdf') {
        const data = await pdf(buffer);
        return data.text;
      } else if (fileType === 'doc' || fileType === 'docx') {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
      }

      throw new Error('Unsupported file type');
    } catch (error) {
      logger.error('Text extraction error:', error);
      throw error;
    }
  }

  /**
   * Parse extracted text to identify sections and extract information
   */
  private parseExtractedText(text: string): ParsedResume {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Extract contact information
    const email = this.extractEmail(text);
    const phone = this.extractPhone(text);
    const name = this.extractName(lines);
    
    // Extract skills
    const skills = this.extractSkills(text);
    
    // Extract experience
    const experience = this.extractExperience(text, lines);
    
    // Extract education
    const education = this.extractEducation(text, lines);
    
    // Extract certifications
    const certifications = this.extractCertifications(text);
    
    // Extract languages
    const languages = this.extractLanguages(text);
    
    // Calculate total experience years
    const totalExperienceYears = this.calculateTotalExperience(experience);
    
    // Calculate confidence score
    const confidence = this.calculateConfidence(skills, experience, education);

    return {
      name,
      email,
      phone,
      skills,
      experience,
      education,
      certifications,
      languages,
      projects: [],
      totalExperienceYears,
      extractedText: text.substring(0, 5000), // Store first 5000 chars
      confidence,
    };
  }

  /**
   * Extract email using regex
   */
  private extractEmail(text: string): string | undefined {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex);
    return matches ? matches[0] : undefined;
  }

  /**
   * Extract phone number using regex
   */
  private extractPhone(text: string): string | undefined {
    const phoneRegex = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const matches = text.match(phoneRegex);
    return matches ? matches[0] : undefined;
  }

  /**
   * Extract name (usually first non-empty line)
   */
  private extractName(lines: string[]): string | undefined {
    // Usually the name is in the first 3 lines and is relatively short
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const line = lines[i];
      // Name is usually 2-4 words, less than 50 characters, and doesn't contain common resume keywords
      if (line.length < 50 && line.split(' ').length <= 4) {
        const lowerLine = line.toLowerCase();
        if (!lowerLine.includes('resume') && 
            !lowerLine.includes('cv') && 
            !lowerLine.includes('@') &&
            !lowerLine.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/)) {
          return line;
        }
      }
    }
    return undefined;
  }

  /**
   * Extract skills using keyword matching and NLP
   */
  private extractSkills(text: string): Array<{ name: string; category?: string; level?: string }> {
    const textLower = text.toLowerCase();
    const foundSkills = new Set<string>();
    const skillsWithCategory: Array<{ name: string; category?: string; level?: string }> = [];

    // Check each category
    Object.entries(SKILL_KEYWORDS).forEach(([category, keywords]) => {
      keywords.forEach(keyword => {
        // Use word boundaries to avoid partial matches
        const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        if (regex.test(textLower)) {
          const properName = this.capitalizeSkill(keyword);
          if (!foundSkills.has(properName.toLowerCase())) {
            foundSkills.add(properName.toLowerCase());
            skillsWithCategory.push({
              name: properName,
              category: this.getCategoryName(category),
              level: this.inferSkillLevel(text, keyword)
            });
          }
        }
      });
    });

    // Also check for soft skills
    SOFT_SKILLS.forEach(skill => {
      const regex = new RegExp(`\\b${skill}\\b`, 'gi');
      if (regex.test(textLower)) {
        const properName = this.capitalizeSkill(skill);
        if (!foundSkills.has(properName.toLowerCase())) {
          foundSkills.add(properName.toLowerCase());
          skillsWithCategory.push({
            name: properName,
            category: 'Soft Skills',
            level: 'intermediate'
          });
        }
      }
    });

    return skillsWithCategory;
  }

  /**
   * Capitalize skill name properly
   */
  private capitalizeSkill(skill: string): string {
    // Special cases
    const specialCases: { [key: string]: string } = {
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'nodejs': 'Node.js',
      'nextjs': 'Next.js',
      'vuejs': 'Vue.js',
      'reactjs': 'React.js',
      'mongodb': 'MongoDB',
      'postgresql': 'PostgreSQL',
      'mysql': 'MySQL',
      'graphql': 'GraphQL',
      'restful': 'RESTful',
      'html': 'HTML',
      'css': 'CSS',
      'api': 'API',
      'ci/cd': 'CI/CD',
      'devops': 'DevOps',
      'mlops': 'MLOps',
      'ios': 'iOS',
      'aws': 'AWS',
      'gcp': 'GCP',
      'jwt': 'JWT',
      'oauth': 'OAuth',
      'sql': 'SQL',
      'nosql': 'NoSQL',
      'nlp': 'NLP',
      'opencv': 'OpenCV',
      'tensorflow': 'TensorFlow',
      'pytorch': 'PyTorch',
      'github': 'GitHub',
      'gitlab': 'GitLab',
      'bitbucket': 'Bitbucket',
      'jira': 'Jira',
    };

    const lowerSkill = skill.toLowerCase();
    if (specialCases[lowerSkill]) {
      return specialCases[lowerSkill];
    }

    // Default: capitalize first letter of each word
    return skill.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  /**
   * Get friendly category name
   */
  private getCategoryName(category: string): string {
    const categoryNames: { [key: string]: string } = {
      'programmingLanguages': 'Programming Languages',
      'frontend': 'Frontend',
      'backend': 'Backend',
      'databases': 'Databases',
      'cloud': 'Cloud & DevOps',
      'mobile': 'Mobile Development',
      'dataScience': 'Data Science & AI',
      'testing': 'Testing & QA',
      'tools': 'Tools & Technologies'
    };
    return categoryNames[category] || 'Other';
  }

  /**
   * Infer skill level based on context
   */
  private inferSkillLevel(text: string, skill: string): string {
    const textLower = text.toLowerCase();
    const skillLower = skill.toLowerCase();
    
    // Look for skill level indicators near the skill mention
    const expertIndicators = ['expert', 'advanced', 'proficient', 'senior', 'lead', 'architect'];
    const beginnerIndicators = ['basic', 'beginner', 'learning', 'junior', 'familiar'];
    
    // Find skill mentions with surrounding context
    const skillIndex = textLower.indexOf(skillLower);
    if (skillIndex !== -1) {
      const contextStart = Math.max(0, skillIndex - 100);
      const contextEnd = Math.min(textLower.length, skillIndex + 100);
      const context = textLower.substring(contextStart, contextEnd);
      
      if (expertIndicators.some(ind => context.includes(ind))) {
        return 'expert';
      }
      if (beginnerIndicators.some(ind => context.includes(ind))) {
        return 'beginner';
      }
    }
    
    return 'intermediate';
  }

  /**
   * Extract work experience
   */
  private extractExperience(text: string, lines: string[]): any[] {
    const experiences: any[] = [];
    const experienceSectionRegex = /(experience|work history|employment|professional background)/i;
    
    let inExperienceSection = false;
    let currentExperience: any = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();
      
      // Detect experience section
      if (experienceSectionRegex.test(line)) {
        inExperienceSection = true;
        continue;
      }
      
      // Stop at next major section
      if (inExperienceSection && /^(education|skills|certifications?|projects?)/i.test(line)) {
        inExperienceSection = false;
        if (currentExperience) {
          experiences.push(currentExperience);
          currentExperience = null;
        }
      }
      
      if (inExperienceSection) {
        // Look for job title patterns (often followed by company or dates)
        const datePattern = /\b(20\d{2}|19\d{2})\b/;
        const hasDate = datePattern.test(line);
        
        // Potential job title (contains common job keywords)
        const jobKeywords = /(engineer|developer|analyst|manager|designer|architect|consultant|specialist|lead|senior|junior|intern)/i;
        
        if (jobKeywords.test(line) || (hasDate && line.length > 10 && line.length < 100)) {
          // Save previous experience
          if (currentExperience) {
            experiences.push(currentExperience);
          }
          
          // Start new experience
          currentExperience = {
            title: line.includes('|') ? line.split('|')[0].trim() : line.split(/\d{4}/)[0].trim(),
            company: 'Unknown',
            startDate: undefined,
            endDate: undefined,
            isCurrent: /present|current/i.test(line),
            description: ''
          };
          
          // Extract dates
          const dates = line.match(/\b(20\d{2}|19\d{2})\b/g);
          if (dates && dates.length > 0) {
            currentExperience.startDate = dates[0];
            if (dates.length > 1) {
              currentExperience.endDate = dates[1];
            }
          }
        }
      }
    }
    
    if (currentExperience) {
      experiences.push(currentExperience);
    }
    
    return experiences.slice(0, 10); // Limit to 10 most recent
  }

  /**
   * Extract education
   */
  private extractEducation(text: string, lines: string[]): any[] {
    const education: any[] = [];
    const educationSectionRegex = /(education|academic|qualifications?)/i;
    
    let inEducationSection = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (educationSectionRegex.test(line)) {
        inEducationSection = true;
        continue;
      }
      
      if (inEducationSection && /^(experience|skills|certifications?|projects?)/i.test(line)) {
        break;
      }
      
      if (inEducationSection) {
        // Look for degree keywords
        const degreeMatch = EDUCATION_KEYWORDS.find(keyword => 
          line.toLowerCase().includes(keyword)
        );
        
        if (degreeMatch) {
          const dates = line.match(/\b(20\d{2}|19\d{2})\b/g);
          education.push({
            degree: line,
            institution: '',
            fieldOfStudy: '',
            startDate: dates && dates.length > 0 ? dates[0] : undefined,
            endDate: dates && dates.length > 1 ? dates[1] : undefined,
          });
        }
      }
    }
    
    return education.slice(0, 5);
  }

  /**
   * Extract certifications
   */
  private extractCertifications(text: string): any[] {
    const certifications: any[] = [];
    const textLower = text.toLowerCase();
    
    CERTIFICATION_KEYWORDS.forEach(keyword => {
      if (textLower.includes(keyword)) {
        certifications.push({
          name: this.capitalizeSkill(keyword),
          issuer: '',
          date: ''
        });
      }
    });
    
    return certifications.slice(0, 10);
  }

  /**
   * Extract languages
   */
  private extractLanguages(text: string): any[] {
    const languages: any[] = [];
    const commonLanguages = [
      'english', 'spanish', 'french', 'german', 'chinese', 'japanese',
      'korean', 'arabic', 'russian', 'portuguese', 'italian', 'hindi',
      'amharic', 'swahili'
    ];
    
    const textLower = text.toLowerCase();
    
    commonLanguages.forEach(lang => {
      if (textLower.includes(lang)) {
        languages.push({
          name: lang.charAt(0).toUpperCase() + lang.slice(1),
          proficiency: 'conversational'
        });
      }
    });
    
    return languages;
  }

  /**
   * Calculate total years of experience
   */
  private calculateTotalExperience(experiences: any[]): number {
    let totalMonths = 0;
    
    experiences.forEach(exp => {
      if (exp.startDate) {
        const start = new Date(exp.startDate);
        const end = exp.endDate ? new Date(exp.endDate) : new Date();
        const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                      (end.getMonth() - start.getMonth());
        if (months > 0 && months < 600) { // Sanity check
          totalMonths += months;
        }
      }
    });
    
    return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal
  }

  /**
   * Calculate confidence score based on extracted data
   */
  private calculateConfidence(skills: any[], experience: any[], education: any[]): number {
    let score = 0;
    
    // Skills contribute up to 40%
    if (skills.length >= 10) score += 40;
    else if (skills.length >= 5) score += 30;
    else if (skills.length >= 3) score += 20;
    else if (skills.length >= 1) score += 10;
    
    // Experience contributes up to 30%
    if (experience.length >= 3) score += 30;
    else if (experience.length >= 2) score += 20;
    else if (experience.length >= 1) score += 10;
    
    // Education contributes up to 30%
    if (education.length >= 2) score += 30;
    else if (education.length >= 1) score += 20;
    
    return Math.min(100, score);
  }

  /**
   * Return empty result structure
   */
  private emptyResult(): ParsedResume {
    return {
      skills: [],
      experience: [],
      education: [],
      certifications: [],
      languages: [],
      projects: [],
      confidence: 0,
    };
  }
}

export const resumeParserService = new ResumeParserService();
