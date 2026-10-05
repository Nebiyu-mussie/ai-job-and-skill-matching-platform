import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '@/lib/api';

export interface JobFilters {
  search?: string;
  category?: string;
  jobType?: string;
  experienceLevel?: string;
  city?: string;
  isRemote?: boolean;
  minSalary?: number;
  maxSalary?: number;
  skills?: string;
  page?: number;
  limit?: number;
}

export const useJobs = (filters: JobFilters = {}) => {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
      const res = await api.get(`/jobs?${params.toString()}`);
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useJob = (id: string) => {
  return useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const res = await api.get(`/jobs/${id}`);
      return res.data.data.job;
    },
    enabled: !!id,
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/jobs', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
      toast.success('Job posted successfully!');
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/jobs/${id}`, data);
      return res.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
      toast.success('Job updated successfully');
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/jobs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
      toast.success('Job deleted');
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });
};

export const useEmployerJobs = (filters = {}) => {
  return useQuery({
    queryKey: ['employer-jobs', filters],
    queryFn: async () => {
      const res = await api.get('/jobs/employer/my-jobs', { params: filters });
      return res.data;
    },
  });
};

export const useJobCategories = () => {
  return useQuery({
    queryKey: ['job-categories'],
    queryFn: async () => {
      const res = await api.get('/jobs/categories');
      return res.data.data.categories;
    },
    staleTime: 30 * 60 * 1000,
  });
};

export const useBookmarkJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      const res = await api.post('/bookmarks', { jobId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job saved');
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });
};

export const useUnbookmarkJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      await api.delete(`/bookmarks/${jobId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job removed from saved');
    },
  });
};

export const useSavedJobs = () => {
  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const res = await api.get('/bookmarks');
      return res.data.data.bookmarks;
    },
  });
};
