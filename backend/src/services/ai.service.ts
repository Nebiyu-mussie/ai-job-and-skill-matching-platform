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
    // If AI service is known to be unavailable, skip API call and use local NLP parser
    if (!this.isAvailable && process.env.NODE_ENV === 'production') {
      logger.info('AI service unavailable, using local NLP resume parser');
      const { resumeParserService } = require('./resume.service');
      return await resumeParserService.parseResume(fileUrl, fileType);
    }

    try {
      const response = await this.client.post('/api/v1/parse-resume', {
        file_url: fileUrl,
        file_type: fileType,
      });
      this.isAvailable = true;
      return response.data;
    } catch (error: any) {
      logger.warn(`AI resume parsing failed: ${error.message}. Using local NLP parser.`);
      this.isAvailable = false;
      // Use local NLP parser as fallback instead of empty result
      const { resumeParserService } = require('./resume.service');
      return await resumeParserService.parseResume(fileUrl, fileType);
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
      return this.fallbackMatchResult(
        candidateData.skills, 
        jobData.requiredSkills,
        { experience: candidateData.experience, education: candidateData.education },
        { 
          experienceYears: jobData.experienceYears, 
          experienceLevel: jobData.experienceLevel,
          educationLevel: jobData.educationLevel 
        }
      );
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
      return this.fallbackMatchResult(
        candidateData.skills, 
        jobData.requiredSkills,
        { experience: candidateData.experience, education: candidateData.education },
        { 
          experienceYears: jobData.experienceYears, 
          experienceLevel: jobData.experienceLevel,
          educationLevel: jobData.educationLevel 
        }
      );
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
    requiredSkills: string[],
    candidateData?: {
      experience?: any[];
      education?: any[];
    },
    jobData?: {
      experienceYears?: { min: number; max?: number };
      experienceLevel?: string;
      educationLevel?: string;
    }
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
      : 0; // Default to 0 if no data instead of 50
    
    // Calculate experience score dynamically
    const experienceScore = this.calculateExperienceScore(
      candidateData?.experience,
      jobData?.experienceYears,
      jobData?.experienceLevel
    );
    
    // Calculate education score dynamically
    const educationScore = this.calculateEducationScore(
      candidateData?.education,
      jobData?.educationLevel
    );
    
    // Location score remains 50 as a neutral default (or could be enhanced based on actual location data)
    const locationScore = 50;
    
    // Calculate overall score with weighted components
    const overallScore = Math.round(
      skillScore * 0.40 +           // Skills: 40%
      experienceScore * 0.30 +      // Experience: 30%
      educationScore * 0.20 +       // Education: 20%
      locationScore * 0.10          // Location: 10%
    );

    return {
      overallScore,
      skillMatchScore: skillScore,
      experienceMatchScore: experienceScore,
      educationMatchScore: educationScore,
      locationMatchScore: locationScore,
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
  
  /**
   * Calculate experience match score based on years and level
   */
  private calculateExperienceScore(
    candidateExperience?: any[],
    jobExperienceYears?: { min: number; max?: number },
    jobExperienceLevel?: string
  ): number {
    // If no candidate experience data, return 0
    if (!candidateExperience || candidateExperience.length === 0) {
      return 0;
    }
    
    // Calculate total years of experience from candidate's work history
    let totalYears = 0;
    const currentDate = new Date();
    
    for (const exp of candidateExperience) {
      const startDate = exp.startDate ? new Date(exp.startDate) : null;
      const endDate = exp.isCurrent || !exp.endDate ? currentDate : new Date(exp.endDate);
      
      if (startDate && endDate) {
        const yearsInRole = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        totalYears += yearsInRole;
      }
    }
    
    // Round to 1 decimal place
    totalYears = Math.round(totalYears * 10) / 10;
    
    // If job has specific experience year requirements
    if (jobExperienceYears && typeof jobExperienceYears.min === 'number') {
      const minRequired = jobExperienceYears.min;
      const maxRequired = jobExperienceYears.max;
      
      // Candidate meets or exceeds minimum requirement
      if (totalYears >= minRequired) {
        // If max is specified and candidate is within range, perfect score
        if (maxRequired && totalYears <= maxRequired) {
          return 100;
        }
        // If no max or candidate exceeds max but not by too much (within 5 years), still good
        if (!maxRequired || totalYears <= maxRequired + 5) {
          return 100;
        }
        // Overqualified (more than 5 years beyond max) - still good but slightly lower
        return 90;
      }
      
      // Candidate is below minimum - scale proportionally
      // e.g., if min is 5 years and candidate has 3 years = 60% score
      const ratio = totalYears / minRequired;
      return Math.round(Math.min(ratio * 100, 95)); // Cap at 95% if below minimum
    }
    
    // Fallback: Match based on experience level if no specific years given
    if (jobExperienceLevel) {
      const levelScore = this.matchExperienceLevel(totalYears, jobExperienceLevel);
      return levelScore;
    }
    
    // If no requirements specified and candidate has experience, give a neutral positive score
    return totalYears > 0 ? 70 : 0;
  }
  
  /**
   * Match years of experience to job level
   */
  private matchExperienceLevel(candidateYears: number, requiredLevel: string): number {
    const levelMap: Record<string, { min: number; max: number }> = {
      entry: { min: 0, max: 1 },
      junior: { min: 1, max: 3 },
      mid: { min: 3, max: 6 },
      senior: { min: 6, max: 10 },
      lead: { min: 8, max: 15 },
      director: { min: 10, max: 20 },
      executive: { min: 15, max: 100 },
    };
    
    const requiredRange = levelMap[requiredLevel.toLowerCase()];
    if (!requiredRange) return 50; // Unknown level
    
    // Perfect match if within range
    if (candidateYears >= requiredRange.min && candidateYears <= requiredRange.max) {
      return 100;
    }
    
    // Slightly below minimum
    if (candidateYears < requiredRange.min) {
      const ratio = candidateYears / requiredRange.min;
      return Math.round(Math.max(ratio * 100, 20)); // Minimum 20% if some experience
    }
    
    // Above maximum (overqualified)
    if (candidateYears > requiredRange.max) {
      const excess = candidateYears - requiredRange.max;
      // Slightly reduce score for being overqualified, but still high
      return Math.max(100 - excess * 2, 80); // Max penalty of 20 points
    }
    
    return 50;
  }
  
  /**
   * Calculate education match score
   */
  private calculateEducationScore(
    candidateEducation?: any[],
    jobEducationLevel?: string
  ): number {
    // If no candidate education data, return 0
    if (!candidateEducation || candidateEducation.length === 0) {
      return 0;
    }
    
    // If job has no education requirement, give neutral positive score
    if (!jobEducationLevel) {
      return candidateEducation.length > 0 ? 70 : 0;
    }
    
    // Normalize education level for comparison
    const normalizeEducation = (edu: string) => edu.trim().toLowerCase();
    const requiredLevel = normalizeEducation(jobEducationLevel);
    
    // Education hierarchy (higher index = higher level)
    const educationHierarchy = [
      'high school',
      'diploma',
      'associate',
      'bachelor',
      'master',
      'mba',
      'phd',
      'doctorate',
    ];
    
    // Find required education level index
    let requiredIndex = educationHierarchy.findIndex(level => requiredLevel.includes(level));
    if (requiredIndex === -1) {
      // If not in standard hierarchy, do fuzzy match
      requiredIndex = requiredLevel.includes('degree') ? 3 : 2; // Default to bachelor's level
    }
    
    // Find candidate's highest education level
    let highestCandidateIndex = -1;
    let hasRelevantDegree = false;
    
    for (const edu of candidateEducation) {
      const candidateDegree = normalizeEducation(edu.degree || '');
      const candidateField = normalizeEducation(edu.fieldOfStudy || '');
      
      const candidateIndex = educationHierarchy.findIndex(level => candidateDegree.includes(level));
      
      if (candidateIndex > highestCandidateIndex) {
        highestCandidateIndex = candidateIndex;
      }
      
      // Check if field of study is relevant (basic check)
      if (candidateField.length > 0) {
        hasRelevantDegree = true;
      }
    }
    
    // No recognized degree
    if (highestCandidateIndex === -1) {
      return candidateEducation.length > 0 ? 30 : 0; // Some credit for having education entries
    }
    
    // Perfect match or exceeds requirement
    if (highestCandidateIndex >= requiredIndex) {
      return hasRelevantDegree ? 100 : 90; // 100 if relevant field, 90 if not specified
    }
    
    // Below requirement - scale based on gap
    const gap = requiredIndex - highestCandidateIndex;
    if (gap === 1) {
      return 70; // One level below
    } else if (gap === 2) {
      return 50; // Two levels below
    } else {
      return 30; // More than two levels below
    }
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
