import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useApplyForJob } from '@/hooks/useApplications';
import api from '@/lib/api';

interface ApplyModalProps {
  job: any;
  onClose: () => void;
}

export default function ApplyModal({ job, onClose }: ApplyModalProps) {
  const [resumeId, setResumeId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const applyMutation = useApplyForJob();

  const { data: resumesData } = useQuery({
    queryKey: ['my-resumes'],
    queryFn: async () => {
      const res = await api.get('/resumes');
      return res.data.data.resumes;
    },
  });

  const resumes = resumesData || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeId) return;
    applyMutation.mutate(
      { jobId: job._id, resumeId, coverLetter },
      { onSuccess: onClose }
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-card rounded-2xl shadow-2xl border border-border w-full max-w-lg"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-lg font-bold text-foreground">Apply for Position</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{job.title}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Resume selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Select Resume <span className="text-destructive">*</span>
              </label>
              {resumes.length === 0 ? (
                <div className="flex items-center gap-3 p-4 rounded-lg border border-dashed border-border bg-muted/50">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">No resumes uploaded</p>
                    <p className="text-xs text-muted-foreground">Upload a resume first from your dashboard.</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={resumeId}
                    onChange={(e) => setResumeId(e.target.value)}
                    className="input-field appearance-none pr-10"
                    required
                  >
                    <option value="">— Choose a resume —</option>
                    {resumes.map((r: any) => (
                      <option key={r._id} value={r._id}>
                        {r.originalName}{r.isDefault ? ' (Default)' : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              )}
            </div>

            {/* Cover letter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Cover Letter <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder={`Tell ${job.employer?.companyName || 'the employer'} why you're the right fit...`}
                rows={5}
                maxLength={3000}
                className="input-field resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">{coverLetter.length}/3000</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3">
                Cancel
              </button>
              <button
                type="submit"
                disabled={!resumeId || applyMutation.isPending || resumes.length === 0}
                className="btn-primary flex-1 py-3"
              >
                {applyMutation.isPending ? 'Submitting…' : 'Submit Application'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
