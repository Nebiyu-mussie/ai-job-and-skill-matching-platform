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
      // CRITICAL: Log exactly what we're about to send to the API
      console.log('=== AXIOS REQUEST DATA (RIGHT BEFORE API CALL) ===');
      console.log('Type of data:', typeof data);
      console.log('Is data an object?', typeof data === 'object' && data !== null);
      console.log('Data keys:', Object.keys(data));
      console.log('Full data being sent:', JSON.stringify(data, null, 2));
      console.log('================================================');
      
      const response = await api.post('/jobs', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Job posted successfully!');
      navigate('/employer/jobs');
    },
    onError: (error: any) => {
      console.error('=== JOB POST ERROR ===');
      console.error('Full error object:', error);
      console.error('Response data:', error?.response?.data);
      console.error('Response status:', error?.response?.status);
      console.error('====================');
      
      // Handle validation errors with field-specific messages
      const errors = error?.response?.data?.errors;
      if (errors && Array.isArray(errors)) {
        console.error('Validation errors count:', errors.length);
        errors.forEach((err: any, index: number) => {
          console.error(`Error ${index + 1}:`, {
            field: err.field,
            message: err.message,
            path: err.path,
            received: err.received,
            expected: err.expected,
          });
          const field = err.field || (err.path ? err.path.join('.') : 'Field');
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
    
    // Validate required fields BEFORE building payload
    if (!formData.title.trim()) {
      toast.error('Job title is required');
      return;
    }
    if (!formData.description.trim() || formData.description.length < 100) {
      toast.error('Job description must be at least 100 characters');
      return;
    }
    if (!formData.category || !formData.category.trim()) {
      toast.error('Job category is required');
      return;
    }
    if (!formData.city.trim()) {
      toast.error('City is required');
      return;
    }
    if (!formData.requiredSkills.trim()) {
      toast.error('At least one required skill is needed');
      return;
    }
    
    // Parse skills from comma-separated string - MUST be array of objects with name
    const skillsArray = formData.requiredSkills
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((name) => ({ 
        name, 
        isRequired: true 
      }));

    if (skillsArray.length === 0) {
      toast.error('At least one skill is required');
      return;
    }

    // Parse requirements and responsibilities - return undefined if empty (NOT empty array)
    const requirementsArray = formData.requirements
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const responsibilitiesArray = formData.responsibilities
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    // Parse salary values - must be actual numbers
    const minSalary = formData.salaryMin ? Number(formData.salaryMin) : 0;
    const maxSalary = formData.salaryMax ? Number(formData.salaryMax) : 0;

    // Build payload that EXACTLY matches backend Zod schema
    const payload: any = {
      // Required string fields (trimmed)
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category.trim(),
      
      // Required enum fields - already correct from select values
      jobType: formData.jobType,
      experienceLevel: formData.experienceLevel,
      
      // Required location object with required city, country; optional region, remoteType
      location: {
        city: formData.city.trim(),
        country: formData.country.trim(),
        isRemote: Boolean(formData.isRemote),
      },
      
      // Required skills array - must have at least 1 skill
      requiredSkills: skillsArray,
      
      // Status enum - default active
      status: 'active' as const,
    };

    // Add optional fields ONLY if they have content (undefined if empty, not empty array)
    if (requirementsArray.length > 0) {
      payload.requirements = requirementsArray;
    }
    if (responsibilitiesArray.length > 0) {
      payload.responsibilities = responsibilitiesArray;
    }

    // Add salary object ONLY if at least one value is provided
    if (minSalary > 0 || maxSalary > 0) {
      // Ensure max >= min as per Zod refine validation
      let finalMin = minSalary || 0;
      let finalMax = maxSalary || minSalary || 0;
      
      // Auto-correct if max < min
      if (finalMax < finalMin) {
        finalMax = finalMin;
      }
      
      payload.salary = {
        min: finalMin,
        max: finalMax,
        currency: 'ETB',
        period: 'monthly' as const,
        isNegotiable: false,
        isVisible: true,
      };
    }

    // DEFINITIVE DEBUG LOG - inspect exact payload being sent
    console.log('========================================');
    console.log('FINAL PAYLOAD:', JSON.stringify(payload, null, 2));
    console.log('========================================');
    console.log('Field Types:');
    console.log('  title:', typeof payload.title, '=', payload.title);
    console.log('  category:', typeof payload.category, '=', payload.category);
    console.log('  description:', typeof payload.description, '(length:', payload.description.length, ')');
    console.log('  jobType:', typeof payload.jobType, '=', payload.jobType);
    console.log('  experienceLevel:', typeof payload.experienceLevel, '=', payload.experienceLevel);
    console.log('  location:', typeof payload.location, '=', payload.location);
    console.log('  requiredSkills:', Array.isArray(payload.requiredSkills), 'length:', payload.requiredSkills.length);
    console.log('  status:', typeof payload.status, '=', payload.status);
    if (payload.salary) {
      console.log('  salary.min:', typeof payload.salary.min, '=', payload.salary.min);
      console.log('  salary.max:', typeof payload.salary.max, '=', payload.salary.max);
    }
    console.log('========================================');
    
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
