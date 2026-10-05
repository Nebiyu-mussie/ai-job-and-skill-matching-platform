import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '@/lib/api';

export const useApplyForJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      jobId: string;
      resumeId: string;
      coverLetter?: string;
      screeningAnswers?: any[];
    }) => {
      const res = await api.post('/applications', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Application submitted successfully!');
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });
};

export const useMyApplications = (filters: any = {}) => {
  return useQuery({
    queryKey: ['my-applications', filters],
    queryFn: async () => {
      const res = await api.get('/applications/my', { params: filters });
      return res.data;
    },
  });
};

export const useEmployerApplications = (filters: any = {}) => {
  return useQuery({
    queryKey: ['employer-applications', filters],
    queryFn: async () => {
      const res = await api.get('/applications/employer', { params: filters });
      return res.data;
    },
  });
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      note,
      rejectionReason,
      interviewSchedule,
    }: {
      id: string;
      status: string;
      note?: string;
      rejectionReason?: string;
      interviewSchedule?: any;
    }) => {
      const res = await api.put(`/applications/${id}/status`, {
        status, note, rejectionReason, interviewSchedule,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-applications'] });
      toast.success('Application status updated');
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });
};

export const useWithdrawApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const res = await api.patch(`/applications/${id}/withdraw`, { reason });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      toast.success('Application withdrawn');
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });
};

export const useRankCandidates = () => {
  return useMutation({
    mutationFn: async (jobId: string) => {
      const res = await api.post(`/matches/rank/${jobId}`);
      return res.data.data;
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });
};
