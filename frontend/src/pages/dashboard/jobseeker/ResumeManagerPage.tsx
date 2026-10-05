import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload, Star, Trash2, RefreshCw, Download, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '@/lib/api';
import { formatFileSize, formatDate } from '@/lib/utils';

export default function ResumeManagerPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-resumes'],
    queryFn: async () => {
      const res = await api.get('/resumes');
      return res.data.data.resumes;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-resumes'] });
      toast.success('Resume uploaded! AI parsing in progress…');
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/resumes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-resumes'] });
      toast.success('Resume deleted');
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/resumes/${id}/set-default`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-resumes'] });
      toast.success('Default resume updated');
    },
  });

  const reparseMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/resumes/${id}/reparse`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-resumes'] });
      toast.success('Re-parsing initiated');
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) uploadMutation.mutate(file);
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    disabled: uploadMutation.isPending || (data?.length >= 5),
  });

  const resumes = data || [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-foreground">Resume Manager</h1>
        <p className="text-muted-foreground mt-1">Upload up to 5 resumes. Our AI will parse them automatically.</p>
      </motion.div>

      {/* Upload zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : resumes.length >= 5
            ? 'border-border bg-muted/30 cursor-not-allowed opacity-60'
            : 'border-border hover:border-primary hover:bg-primary/5'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          {uploadMutation.isPending ? (
            <>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center animate-pulse">
                <Upload className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">Uploading…</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume or click to browse'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX · Max 5MB · {resumes.length}/5 used</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Resume list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <div className="text-center py-12 card">
          <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No resumes uploaded yet. Upload one above.</p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {resumes.map((resume: any) => (
              <motion.div
                key={resume._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="card p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-red-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground truncate">{resume.originalName}</p>
                          {resume.isDefault && (
                            <span className="badge px-2 py-0.5 bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 text-xs">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatFileSize(resume.fileSize)} · Uploaded {formatDate(resume.createdAt)}
                        </p>
                      </div>

                      {/* Parse status */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {resume.isParsed ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Parsed
                          </span>
                        ) : resume.parsingError ? (
                          <span className="flex items-center gap-1 text-xs text-destructive">
                            <AlertCircle className="w-3.5 h-3.5" /> Failed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                            <Clock className="w-3.5 h-3.5 animate-pulse" /> Parsing…
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Parsed skills preview */}
                    {resume.isParsed && resume.parsedData?.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {resume.parsedData.skills.slice(0, 6).map((s: any) => (
                          <span key={s.name} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {s.name}
                          </span>
                        ))}
                        {resume.parsedData.skills.length > 6 && (
                          <span className="text-xs text-muted-foreground">+{resume.parsedData.skills.length - 6} more</span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      {!resume.isDefault && (
                        <button
                          onClick={() => setDefaultMutation.mutate(resume._id)}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Star className="w-3.5 h-3.5" /> Set Default
                        </button>
                      )}
                      <a href={resume.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                      {(resume.parsingError || !resume.isParsed) && (
                        <button
                          onClick={() => reparseMutation.mutate(resume._id)}
                          className="flex items-center gap-1.5 text-xs text-primary hover:underline transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Re-parse
                        </button>
                      )}
                      <button
                        onClick={() => deleteMutation.mutate(resume._id)}
                        className="flex items-center gap-1.5 text-xs text-destructive hover:underline ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
