import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, BookOpen, ExternalLink, TrendingUp, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillGapRecommendation {
  type: 'course' | 'certification' | 'project' | 'book';
  title: string;
  provider?: string;
  url?: string;
  duration?: string;
  difficulty?: string;
}

interface SkillGapAnalysis {
  skill: string;
  userLevel?: string;
  requiredLevel?: string;
  gap: string;
  recommendations: SkillGapRecommendation[];
}

interface MatchDetails {
  skillMatch: number;
  experienceMatch: number;
  educationMatch: number;
  matchedSkills: string[];
  missingSkills: string[];
}

interface SkillAnalysisProps {
  matchScore: number;
  matchDetails: MatchDetails;
  skillGapAnalysis?: SkillGapAnalysis[];
}

export default function SkillAnalysis({ matchScore, matchDetails, skillGapAnalysis }: SkillAnalysisProps) {
  const { matchedSkills = [], missingSkills = [] } = matchDetails || {};

  const getMatchLevel = (score: number) => {
    if (score >= 80) return { label: 'Excellent Match', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' };
    if (score >= 60) return { label: 'Good Match', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' };
    if (score >= 40) return { label: 'Fair Match', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' };
    return { label: 'Low Match', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' };
  };

  const matchLevel = getMatchLevel(matchScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Skill Analysis
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered analysis of your skills vs job requirements
          </p>
        </div>
        <div className="text-right">
          <div className={cn('text-3xl font-black', matchLevel.color)}>
            {matchScore}%
          </div>
          <div className={cn('text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-1', matchLevel.bg, matchLevel.color)}>
            {matchLevel.label}
          </div>
        </div>
      </div>

      {/* Match Breakdown */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <div className="text-xs text-muted-foreground mb-1">Skills</div>
          <div className="text-xl font-bold text-foreground">{matchDetails.skillMatch}%</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <div className="text-xs text-muted-foreground mb-1">Experience</div>
          <div className="text-xl font-bold text-foreground">{matchDetails.experienceMatch}%</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <div className="text-xs text-muted-foreground mb-1">Education</div>
          <div className="text-xl font-bold text-foreground">{matchDetails.educationMatch}%</div>
        </div>
      </div>

      {/* Matched Skills */}
      {matchedSkills.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <h4 className="font-semibold text-sm text-foreground">
              Skills You Have ({matchedSkills.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {matchedSkills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-sm font-medium flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing Skills */}
      {missingSkills.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <h4 className="font-semibold text-sm text-foreground">
              Skills to Develop ({missingSkills.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {missingSkills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-sm font-medium flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Skill Gap Recommendations */}
      {skillGapAnalysis && skillGapAnalysis.length > 0 && (
        <div className="border-t border-border pt-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground">Recommended Learning Paths</h4>
          </div>

          <div className="space-y-4">
            {skillGapAnalysis.slice(0, 3).map((gap, index) => (
              <div
                key={gap.skill}
                className="p-4 rounded-lg bg-gradient-to-br from-brand-50 to-brand-100/50 dark:from-brand-950/30 dark:to-brand-900/20 border border-brand-200 dark:border-brand-800"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h5 className="font-semibold text-foreground text-sm">{gap.skill}</h5>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {gap.gap} • Priority: {index === 0 ? 'High' : index === 1 ? 'Medium' : 'Low'}
                    </p>
                  </div>
                </div>

                {gap.recommendations && gap.recommendations.length > 0 && (
                  <div className="space-y-2">
                    {gap.recommendations.slice(0, 2).map((rec, recIndex) => (
                      <div
                        key={recIndex}
                        className="flex items-start gap-3 p-3 rounded-md bg-white dark:bg-gray-800/50 border border-border"
                      >
                        <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
                          {rec.type === 'course' && <BookOpen className="w-4 h-4 text-brand-600 dark:text-brand-400" />}
                          {rec.type === 'certification' && <Award className="w-4 h-4 text-brand-600 dark:text-brand-400" />}
                          {rec.type === 'project' && <TrendingUp className="w-4 h-4 text-brand-600 dark:text-brand-400" />}
                          {rec.type === 'book' && <BookOpen className="w-4 h-4 text-brand-600 dark:text-brand-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground">{rec.title}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {rec.provider && (
                              <span className="text-xs text-muted-foreground">{rec.provider}</span>
                            )}
                            {rec.duration && (
                              <>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">{rec.duration}</span>
                              </>
                            )}
                            {rec.difficulty && (
                              <>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-brand-600 dark:text-brand-400 font-medium capitalize">
                                  {rec.difficulty}
                                </span>
                              </>
                            )}
                          </div>
                          {rec.url && (
                            <a
                              href={rec.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1 mt-2"
                            >
                              View Course <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {skillGapAnalysis.length > 3 && (
            <p className="text-xs text-muted-foreground text-center mt-4">
              +{skillGapAnalysis.length - 3} more skills to develop
            </p>
          )}
        </div>
      )}

      {/* Pro Tip */}
      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-900 dark:text-blue-200">
          <strong>💡 Pro Tip:</strong> Focus on the high-priority skills first to increase your match score. 
          Most courses can be completed in 2-4 weeks with dedicated study.
        </p>
      </div>
    </motion.div>
  );
}
