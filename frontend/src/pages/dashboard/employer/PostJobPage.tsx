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
    category: '',
    city: '',
    country: 'Ethiopia',
    isRemote: false,
    salaryMin: '',
    salaryMax: '',
    requiredSkills: '',
    requirements: '',
    responsibilities: '',
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
    onError: (error: any) => {
      console.error('Job post error:', error?.response?.data);
      
      // Handle validation errors with field-specific messages
      const errors = error?.response?.data?.errors;
      if (errors && Array.isArray(errors)) {
        errors.forEach((err: any) => {
          const field = err.path ? err.path.join('.') : 'Field';
          toast.error(`${field}: ${err.message}`);
        });
      } else {
        // Handle generic errors
        const message = error?.response?.data?.message || 'Failed to post job. Please check your inputs and try again.';
        toast.error(message);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse skills from comma-separated string
    const skillsArray = formData.requiredSkills
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((name) => ({ 
        name, 
        isRequired: true 
      }));

    // Parse requirements and responsibilities
    const requirementsArray = formData.requirements
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const responsibilitiesArray = formData.responsibilities
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const payload = {
      title: formData.title,
      description: formData.description,
      jobType: formData.jobType,
      experienceLevel: formData.experienceLevel,
      category: formData.category,
      location: {
        city: formData.city,
        country: formData.country,
        isRemote: formData.isRemote,
      },
      salary: {
        min: parseInt(formData.salaryMin) || 0,
        max: parseInt(formData.salaryMax) || 0,
        currency: 'ETB',
        period: 'monthly',
        isNegotiable: false,
        isVisible: true,
      },
      requiredSkills: skillsArray,
      requirements: requirementsArray,
      responsibilities: responsibilitiesArray,
      status: 'active',
    };

    console.log('Posting job with payload:', payload);
    postJobMutation.mutate(payload);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Post a New Job</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white border rounded-lg p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium mb-2">Job Title *</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Senior Frontend Developer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Job Category *</label>
          <select
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="">Select a category</option>
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Education">Education</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Customer Service">Customer Service</option>
            <option value="Operations">Operations</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Job Description *</label>
          <textarea
            required
            rows={6}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Provide a detailed description of the job role (minimum 100 characters)..."
            minLength={100}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.description.length}/100 characters minimum
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Requirements</label>
          <textarea
            rows={4}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            value={formData.requirements}
            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
            placeholder="Enter each requirement on a new line&#10;e.g.:&#10;Bachelor's degree in Computer Science&#10;3+ years of experience&#10;Strong problem-solving skills"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Responsibilities</label>
          <textarea
            rows={4}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            value={formData.responsibilities}
            onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
            placeholder="Enter each responsibility on a new line&#10;e.g.:&#10;Design and implement new features&#10;Code review and mentoring&#10;Collaborate with product team"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Job Type *</label>
            <select
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              value={formData.jobType}
              onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
            >
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="freelance">Freelance</option>
              <option value="temporary">Temporary</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Experience Level *</label>
            <select
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              value={formData.experienceLevel}
              onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
            >
              <option value="entry">Entry Level</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
              <option value="lead">Lead</option>
              <option value="director">Director</option>
              <option value="executive">Executive</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">City *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g. Addis Ababa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Country *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="e.g. Ethiopia"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-primary focus:ring-primary"
              checked={formData.isRemote}
              onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })}
            />
            <span className="text-sm font-medium">Remote Position</span>
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Min Salary (ETB)</label>
            <input
              type="number"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              value={formData.salaryMin}
              onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
              placeholder="e.g. 50000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Max Salary (ETB)</label>
            <input
              type="number"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              value={formData.salaryMax}
              onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
              placeholder="e.g. 80000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Required Skills * (comma-separated)</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            value={formData.requiredSkills}
            onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
            placeholder="e.g. JavaScript, React, Node.js, TypeScript"
          />
          <p className="text-xs text-gray-500 mt-1">
            Separate each skill with a comma
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/employer/jobs')}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={postJobMutation.isPending}
            className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {postJobMutation.isPending ? 'Posting...' : 'Post Job'}
          </button>
        </div>
      </form>
    </div>
  );
}
