import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Search, BookOpen, Award, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function SkillGapPage() {
  const { user } = useAuthStore();
  const [selectedJobId, setSelectedJobId] = useState('');
  const [jobSearch, setJobSearch] = useState('');

  const { data: matchData } = useQuery({
    queryKey: ['my-matches-for-gap'],
    queryFn: async () => {
      const res = await api.get('/matches/my-matches?limit=20');
      return res.data.data;
    },
  });

  const { data: gapData, isLoading: gapLoading } = useQuery({
    queryKey: ['skill-gap', selectedJobId],
    queryFn: async () => {
      const res = await api.get(`/matches/skill-gap/${selectedJobId}`);
      return res.data.data;
    },
    enabled: !!selectedJobId,
  });

  const matches = matchData || [];
  const userSkills = user?.skills?.map((s) => s.name) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-foreground">Skill Gap Analysis</h1>
        <p className="text-muted-foreground mt-1">See which skills you're missing for specific jobs and how to learn them.</p>
      </motion.div>

      {/* Job selector */}
      <div className="card p-5">
        <h2 className="font-semibold text-foreground mb-3">Select a Job to Analyze</h2>
        <select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="input-field"
        >
          <option value="">— Choose from your top matches —</option>
          {matches.map((m: any) => (
            <option key={m._id} value={m.job?._id}>
              {m.job?.title} · {m.overallScore}% match
            </option>
          ))}
        </select>
      </div>

      {/* Your current skills */}
      <div className="card p-5">
        <h2 className="font-semibold text-foreground mb-3">Your Current Skills ({userSkills.length})</h2>
        {userSkills.length === 0 ? (
          <p className="text-sm text-muted-foreground">No skills added yet. Update your profile to add skills.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {userSkills.map((skill) => (
              <span key={skill} className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 text-sm font-medium">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Gap analysis results */}
      {selectedJobId && (
        <div className="space-y-5">
          {gapLoading ? (
            <div className="card p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Analyzing skill gap…</p>
              </div>
            </div>
          ) : gapData ? (
            <>
              {/* Summary */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="card p-4 text-center">
                  <p className="text-3xl font-black text-emerald-600">{gapData.userSkills?.length || 0}</p>
                  <p className="text-sm text-muted-foreground mt-1">Your Skills</p>
                </div>
                <div className="card p-4 text-center">
                  <p className="text-3xl font-black text-red-500">{gapData.missingSkills?.length || 0}</p>
                  <p className="text-sm text-muted-foreground mt-1">Missing Skills</p>
                </div>
                <div className="card p-4 text-center">
                  <p className="text-3xl font-black text-brand-600">{gapData.requiredSkills?.length || 0}</p>
                  <p className="text-sm text-muted-foreground mt-1">Required Skills</p>
                </div>
              </div>

              {/* Missing skills with recommendations */}
              {gapData.recommendations?.length > 0 && (
                <div className="card p-6">
                  <h2 className="font-bold text-foreground mb-5">
                    <TrendingUp className="w-5 h-5 inline mr-2 text-primary" />
                    Skills to Learn &amp; Recommendations
                  </h2>
                  <div className="space-y-5">
                    {gapData.recommendations.map((item: any) => (
                      <div key={item.skill} className="border border-border rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-foreground">{item.skill}</h3>
                          <span className={`badge px-2.5 py-1 text-xs ${item.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'}`}>
                            {item.priority} priority
                          </span>
                        </div>
                        {item.recommendations?.length > 0 && (
                          <div className="space-y-2">
                            {item.recommendations.map((rec: any, i: number) => (
                              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                {rec.type === 'course'
                                  ? <BookOpen className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                                  : <Award className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground">{rec.title}</p>
                                  <p className="text-xs text-muted-foreground">{rec.provider} {rec.duration && `· ${rec.duration}`}</p>
                                </div>
                                {rec.url && (
                                  <a href={rec.url} target="_blank" rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0">
                                    Learn <ArrowRight className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
