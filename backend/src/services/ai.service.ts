import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

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

interface MatchResult {
  overallScore: number;
  skillMatchScore: number;
  experienceMatchScore: number;
  educationMatchScore: number;
  locationMatchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  extraSkills: string[];
  skillGapAnalysis: Array<{
    skill: string;
    userLevel?: string;
    requiredLevel?: string;
    gap: string;
    recommendations: Array<{
      type: string;
      title: string;
      provider?: string;
      url?: string;
      duration?: string;
    }>;
  }>;
}

interface RecommendationResult {
  jobs: Array<{ jobId: string; score: number; reason: string }>;
  skills: Array<{ name: string; priority: string; reason: string }>;
  courses: Array<{ title: string; url: string; relevance: number }>;
  careerPaths: Array<{ title: string; steps: string[]; timeline: string }>;
}

class AIService {
  private client: AxiosInstance;
  private isAvailable: boolean = true;
  private lastHealthCheck: Date | null = null;

  constructor() {
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    
    this.client = axios.create({
      baseURL: aiServiceUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.AI_SERVICE_API_KEY || '',
      },
    });

    // Log AI service configuration on startup
    if (process.env.NODE_ENV === 'production' && aiServiceUrl.includes('localhost')) {
      logger.warn('⚠️  AI_SERVICE_URL is set to localhost in production. AI features will use fallback calculations.');
      logger.warn('   Set AI_SERVICE_URL environment variable to your deployed Python AI service URL.');
      this.isAvailable = false;
    } else {
      logger.info(`🤖 AI Service configured: ${aiServiceUrl}`);
    }
  }

  async parseResume(fileUrl: string, fileType: string): Promise<ParsedResume> {
    // If AI service is known to be unavailable, skip API call
    if (!this.isAvailable && process.env.NODE_ENV === 'production') {
      logger.info('AI service unavailable, using fallback resume parsing');
      return this.fallbackParsedResume();
    }

    try {
      const response = await this.client.post('/api/v1/parse-resume', {
        file_url: fileUrl,
        file_type: fileType,
      });
      this.isAvailable = true;
      return response.data;
    } catch (error: any) {
      logger.warn(`AI resume parsing failed: ${error.message}. Using fallback.`);
      this.isAvailable = false;
      // Return basic fallback if AI service is down
      return this.fallbackParsedResume();
    }
  }

  async matchJobToCandidate(
    candidateData: {
      skills: string[];
      experience: any[];
      education: any[];
      location?: string;
      resumeText?: string;
    },
    jobData: {
      requiredSkills: string[];
      experienceLevel: string;
      experienceYears?: { min: number; max?: number };
      educationLevel?: string;
      location?: string;
      description: string;
    }
  ): Promise<MatchResult> {
    // If AI service is known to be unavailable, skip API call
    if (!this.isAvailable && process.env.NODE_ENV === 'production') {
      logger.info('AI service unavailable, using fallback matching calculation');
      return this.fallbackMatchResult(candidateData.skills, jobData.requiredSkills);
    }

    try {
      const response = await this.client.post('/api/v1/match', {
        candidate: candidateData,
        job: jobData,
      });
      this.isAvailable = true;
      return response.data;
    } catch (error: any) {
      logger.warn(`AI matching failed: ${error.message}. Using fallback calculation.`);
      this.isAvailable = false;
      return this.fallbackMatchResult(candidateData.skills, jobData.requiredSkills);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.client.post('/api/v1/embed', { text });
      return response.data.embedding;
    } catch (error) {
      logger.error('AI embedding generation failed:', error);
      return [];
    }
  }

  async getRecommendations(
    userId: string,
    userProfile: {
      skills: string[];
      experience: any[];
      education: any[];
      jobPreferences?: any;
      appliedJobs?: string[];
    }
  ): Promise<RecommendationResult> {
    try {
      const response = await this.client.post('/api/v1/recommend', {
        user_id: userId,
        profile: userProfile,
      });
      return response.data;
    } catch (error) {
      logger.error('AI recommendations failed:', error);
      return { jobs: [], skills: [], courses: [], careerPaths: [] };
    }
  }

  async rankCandidates(
    jobId: string,
    candidates: Array<{
      userId: string;
      skills: string[];
      experience: any[];
      education: any[];
      resumeText?: string;
    }>,
    jobRequirements: {
      skills: string[];
      experienceLevel: string;
      description: string;
    }
  ): Promise<Array<{ userId: string; score: number; rank: number }>> {
    try {
      const response = await this.client.post('/api/v1/rank-candidates', {
        job_id: jobId,
        candidates,
        job_requirements: jobRequirements,
      });
      return response.data;
    } catch (error) {
      logger.error('AI ranking failed:', error);
      return candidates.map((c, i) => ({
        userId: c.userId,
        score: Math.random() * 40 + 60,
        rank: i + 1,
      }));
    }
  }

  async analyzeSkillGap(
    userSkills: string[],
    targetJobSkills: string[],
    experienceLevel: string
  ): Promise<{
    missingSkills: string[];
    partialSkills: string[];
    recommendations: any[];
  }> {
    try {
      const response = await this.client.post('/api/v1/skill-gap', {
        user_skills: userSkills,
        target_skills: targetJobSkills,
        experience_level: experienceLevel,
      });
      return response.data;
    } catch (error) {
      logger.error('Skill gap analysis failed:', error);
      
      // Normalize skills for comparison
      const normalizeSkill = (skill: string) => skill.trim().toLowerCase();
      const userSkillsNormalized = userSkills.map(normalizeSkill);
      
      const missing = targetJobSkills.filter(
        (skill) => !userSkillsNormalized.includes(normalizeSkill(skill))
      );
      
      return { missingSkills: missing, partialSkills: [], recommendations: [] };
    }
  }

  private fallbackParsedResume(): ParsedResume {
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

  private fallbackMatchResult(
    userSkills: string[],
    requiredSkills: string[]
  ): MatchResult {
    // Normalize skills: trim whitespace and convert to lowercase for comparison
    const normalizeSkill = (skill: string) => skill.trim().toLowerCase();
    
    const userSkillsNormalized = userSkills.map(normalizeSkill);
    const requiredSkillsNormalized = requiredSkills.map(normalizeSkill);
    
    // Find matched skills (case-insensitive, whitespace-trimmed)
    const matched = requiredSkills.filter((skill, index) =>
      userSkillsNormalized.includes(requiredSkillsNormalized[index])
    );
    
    const missing = requiredSkills.filter((skill, index) =>
      !userSkillsNormalized.includes(requiredSkillsNormalized[index])
    );
    
    const skillScore = requiredSkills.length > 0 
      ? Math.round((matched.length / requiredSkills.length) * 100) 
      : 50;

    return {
      overallScore: Math.round(skillScore * 0.6 + 40 * 0.4),
      skillMatchScore: skillScore,
      experienceMatchScore: 50,
      educationMatchScore: 50,
      locationMatchScore: 50,
      matchedSkills: matched,
      missingSkills: missing,
      extraSkills: [],
      skillGapAnalysis: missing.map((skill) => ({
        skill,
        gap: 'Missing',
        recommendations: [],
      })),
    };
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      this.isAvailable = response.status === 200;
      return this.isAvailable;
    } catch {
      this.isAvailable = false;
      return false;
    }
  }
}

export const aiService = new AIService();
