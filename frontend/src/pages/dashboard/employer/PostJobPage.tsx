import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function PostJobPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    jobType: 'full-time',
    experienceLevel: 'mid',
    location: '',
    salaryMin: '',
    salaryMax: '',
    requiredSkills: '',
  });

  const postJobMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/jobs', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Job posted successfully!');
      navigate('/employer/jobs');
    },
    onError: () => {
      toast.error('Failed to post job');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skills = formData.requiredSkills.split(',').map((s) => ({ name: s.trim(), required: true }));
    postJobMutation.mutate({
      ...formData,
      requiredSkills: skills,
      salary: {
        min: parseInt(formData.salaryMin),
        max: parseInt(formData.salaryMax),
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Post a New Job</h1>

      <form onSubmit={handleSubmit} className="space-y-6 border rounded-lg p-6">
        <div>
          <label className="block text-sm font-medium mb-2">Job Title</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            required
            rows={6}
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Job Type</label>
            <select
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.jobType}
              onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
            >
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Experience Level</label>
            <select
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.experienceLevel}
              onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
            >
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Location</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Min Salary</label>
            <input
              type="number"
              required
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.salaryMin}
              onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Max Salary</label>
            <input
              type="number"
              required
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.salaryMax}
              onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Required Skills (comma-separated)</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.requiredSkills}
            onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
            placeholder="e.g. JavaScript, React, Node.js"
          />
        </div>

        <button
          type="submit"
          disabled={postJobMutation.isPending}
          className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {postJobMutation.isPending ? 'Posting...' : 'Post Job'}
        </button>
      </form>
    </div>
  );
}
