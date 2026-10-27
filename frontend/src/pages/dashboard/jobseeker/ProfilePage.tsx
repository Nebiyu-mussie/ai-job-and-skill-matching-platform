import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Plus, X, Save, MapPin, Phone, Globe, Linkedin, Github } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { ETHIOPIAN_CITIES } from '@/lib/utils';

const schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  headline: z.string().max(120).optional(),
  bio: z.string().max(2000).optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  portfolio: z.string().url().optional().or(z.literal('')),
  linkedIn: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
});
type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [imageUploading, setImageUploading] = useState(false);
  
  // Skills management state
  const [skills, setSkills] = useState<Array<{ name: string; level: string; yearsOfExperience?: number }>>(
    user?.skills || []
  );
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate');
  const [newSkillYears, setNewSkillYears] = useState<string>('');

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      headline: user?.headline || '',
      bio: (user as any)?.bio || '',
      phone: (user as any)?.phone || '',
      city: user?.location?.city || '',
      portfolio: (user as any)?.portfolio || '',
      linkedIn: (user as any)?.linkedIn || '',
      github: (user as any)?.github || '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        headline: data.headline,
        bio: data.bio,
        phone: data.phone,
        location: data.city ? { city: data.city, country: 'Ethiopia' } : undefined,
        portfolio: data.portfolio,
        linkedIn: data.linkedIn,
        github: data.github,
        skills: skills, // Include skills in the payload
      };
      const res = await api.put('/users/profile', payload);
      return res.data.data.user;
    },
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => toast.error(getErrorMessage(error)),
  });

  const handleAddSkill = () => {
    if (!newSkillName.trim()) {
      toast.error('Please enter a skill name');
      return;
    }
    
    // Check if skill already exists
    if (skills.some(s => s.name.toLowerCase() === newSkillName.toLowerCase())) {
      toast.error('This skill already exists');
      return;
    }

    const newSkill = {
      name: newSkillName.trim(),
      level: newSkillLevel,
      ...(newSkillYears && { yearsOfExperience: parseInt(newSkillYears) }),
    };
    
    setSkills([...skills, newSkill]);
    setNewSkillName('');
    setNewSkillLevel('intermediate');
    setNewSkillYears('');
    toast.success('Skill added. Remember to save your profile!');
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
    toast.success('Skill removed. Remember to save your profile!');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    const formData = new FormData();
    formData.append('profileImage', file);
    try {
      const res = await api.post('/users/profile/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ profileImage: res.data.data.profileImage });
      toast.success('Profile photo updated');
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">Keep your profile updated to get better job matches.</p>
      </motion.div>

      {/* Profile completeness */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-foreground">Profile Completeness</span>
          <span className="text-sm font-bold text-primary">{user?.profileCompleteness}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${user?.profileCompleteness || 0}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className="h-full bg-gradient-to-r from-brand-500 to-purple-600 rounded-full"
          />
        </div>
      </div>

      {/* Photo + form */}
      <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-6">
        {/* Photo */}
        <div className="card p-6">
          <h2 className="font-semibold text-foreground mb-4">Profile Photo</h2>
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-brand-400 to-purple-600 flex items-center justify-center">
                {user?.profileImage
                  ? <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  : <span className="text-white text-2xl font-bold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>}
              </div>
              <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                <Camera className="w-3.5 h-3.5 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Upload photo</p>
              <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG or WebP. Max 2MB.</p>
              {imageUploading && <p className="text-xs text-primary mt-1">Uploading…</p>}
            </div>
          </div>
        </div>

        {/* Basic info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Basic Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">First Name</label>
              <input {...register('firstName')} className="input-field" />
              {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Last Name</label>
              <input {...register('lastName')} className="input-field" />
              {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Professional Headline</label>
            <input {...register('headline')} placeholder="e.g. Senior Software Engineer at Ethio Telecom" className="input-field" />
            <p className="text-xs text-muted-foreground mt-1">This shows below your name on your profile.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Bio / Summary</label>
            <textarea {...register('bio')} rows={4} placeholder="Tell employers about yourself, your experience, and career goals..." className="input-field resize-none" />
          </div>
        </div>

        {/* Contact */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Contact &amp; Location</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                <Phone className="w-3.5 h-3.5 inline mr-1.5" />Phone
              </label>
              <input {...register('phone')} placeholder="+251 9XX XXX XXXX" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                <MapPin className="w-3.5 h-3.5 inline mr-1.5" />City
              </label>
              <select {...register('city')} className="input-field">
                <option value="">Select city</option>
                {ETHIOPIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Online Presence</h2>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Globe className="w-3.5 h-3.5 inline mr-1.5" />Portfolio Website
            </label>
            <input {...register('portfolio')} placeholder="https://yoursite.com" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Linkedin className="w-3.5 h-3.5 inline mr-1.5" />LinkedIn
            </label>
            <input {...register('linkedIn')} placeholder="https://linkedin.com/in/yourname" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Github className="w-3.5 h-3.5 inline mr-1.5" />GitHub
            </label>
            <input {...register('github')} placeholder="https://github.com/yourname" className="input-field" />
          </div>
        </div>

        {/* Skills Section */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Skills</h2>
            <span className="text-xs text-muted-foreground">
              {skills.length} {skills.length === 1 ? 'skill' : 'skills'}
            </span>
          </div>
          
          {/* Add new skill */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-5">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Skill name (e.g., JavaScript, Python)"
                  className="input-field"
                />
              </div>
              <div className="sm:col-span-3">
                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value as any)}
                  className="input-field"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={newSkillYears}
                  onChange={(e) => setNewSkillYears(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Years"
                  className="input-field"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="w-full h-full btn-primary flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Add your technical and professional skills. Press Enter or click Add to include a skill.
            </p>
          </div>

          {/* Skills list */}
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {skills.map((skill, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-50 to-purple-50 border border-brand-200 rounded-full px-3 py-1.5 group hover:border-brand-300 transition-colors"
                >
                  <span className="text-sm font-medium text-foreground">{skill.name}</span>
                  <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-white/50 rounded">
                    {skill.level}
                  </span>
                  {skill.yearsOfExperience && (
                    <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-white/50 rounded">
                      {skill.yearsOfExperience}y
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(index)}
                    className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                    title="Remove skill"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-muted/30 rounded-lg border-2 border-dashed">
              <p className="text-sm text-muted-foreground">No skills added yet.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add skills above to showcase your expertise to employers.
              </p>
            </div>
          )}
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="btn-primary px-8 py-2.5 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
