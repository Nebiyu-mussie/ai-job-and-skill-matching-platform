import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Plus, X, Save, MapPin, Phone, Globe, Linkedin, Github, ZoomIn, ZoomOut, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Cropper from 'react-easy-crop';
import api, { getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { ETHIOPIAN_CITIES } from '@/lib/utils';
import SkillAutocomplete from '@/components/ui/SkillAutocomplete';

// Type definition for cropped area
interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

const schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  headline: z.string().max(120).optional(),
  bio: z.string().max(2000).optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  portfolio: z.string().refine(
    (val) => !val || val === '' || /^https?:\/\/.+/.test(val),
    { message: 'Must be a valid URL starting with http:// or https://' }
  ).optional(),
  linkedIn: z.string().refine(
    (val) => !val || val === '' || /^https?:\/\/.+/.test(val),
    { message: 'Must be a valid URL starting with http:// or https://' }
  ).optional(),
  github: z.string().refine(
    (val) => !val || val === '' || /^https?:\/\/.+/.test(val),
    { message: 'Must be a valid URL starting with http:// or https://' }
  ).optional(),
});
type FormData = z.infer<typeof schema>;

// Helper function to create cropped image
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Set canvas size to match the crop area
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Canvas is empty'));
      }
    }, 'image/jpeg', 0.95);
  });
}

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [imageUploading, setImageUploading] = useState(false);
  
  // Image cropper state
  const [showCropper, setShowCropper] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  
  // Lightbox state
  const [showLightbox, setShowLightbox] = useState(false);
  
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

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Read file and show cropper
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageSrc(reader.result as string);
      setShowCropper(true);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    });
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropConfirm = async () => {
    if (!croppedAreaPixels || !imageSrc) return;

    setImageUploading(true);
    try {
      // Get cropped image blob
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      
      // Create form data
      const formData = new FormData();
      formData.append('profileImage', croppedBlob, 'profile.jpg');

      // Upload to server
      const res = await api.post('/users/profile/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      updateUser({ profileImage: res.data.data.profileImage });
      toast.success('Profile photo updated successfully');
      setShowCropper(false);
      setImageSrc('');
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    } finally {
      setImageUploading(false);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageSrc('');
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e);
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
              <button
                type="button"
                onClick={() => user?.profileImage && setShowLightbox(true)}
                className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-brand-400 to-purple-600 flex items-center justify-center ${
                  user?.profileImage ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
                }`}
                title={user?.profileImage ? 'Click to view full size' : undefined}
              >
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-2xl sm:text-3xl font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                )}
              </button>
              <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                <Camera className="w-3.5 h-3.5 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Upload photo</p>
              <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG or WebP. Max 5MB.</p>
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
            {errors.portfolio && <p className="text-xs text-destructive mt-1">{errors.portfolio.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Linkedin className="w-3.5 h-3.5 inline mr-1.5" />LinkedIn
            </label>
            <input {...register('linkedIn')} placeholder="https://linkedin.com/in/yourname" className="input-field" />
            {errors.linkedIn && <p className="text-xs text-destructive mt-1">{errors.linkedIn.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Github className="w-3.5 h-3.5 inline mr-1.5" />GitHub
            </label>
            <input {...register('github')} placeholder="https://github.com/yourname" className="input-field" />
            {errors.github && <p className="text-xs text-destructive mt-1">{errors.github.message}</p>}
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
                <SkillAutocomplete
                  value={newSkillName}
                  onChange={setNewSkillName}
                  onKeyPress={handleKeyPress}
                  placeholder="Type to search skills (e.g., JavaScript, Python)"
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
              Type to search from 200+ standard skills, or press Enter to add a custom skill.
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

      {/* Image Cropper Modal */}
      <AnimatePresence>
        {showCropper && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
            onClick={handleCropCancel}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Adjust Your Photo</h3>
                <button
                  onClick={handleCropCancel}
                  className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cropper Area */}
              <div className="relative h-96 bg-black">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>

              {/* Controls */}
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <ZoomOut className="w-4 h-4" />
                      Zoom
                      <ZoomIn className="w-4 h-4" />
                    </label>
                    <span className="text-sm text-muted-foreground">{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Drag to reposition • Scroll or use slider to zoom
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCropCancel}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCropConfirm}
                    disabled={imageUploading}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    {imageUploading ? (
                      'Uploading...'
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Set as Profile Photo
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {showLightbox && user?.profileImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setShowLightbox(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative max-w-2xl max-h-[90vh] cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowLightbox(false)}
                className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors backdrop-blur-sm"
                title="Close"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Full size image */}
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={user.profileImage}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
                />
              </div>

              {/* User info */}
              <div className="absolute -bottom-16 left-0 right-0 text-center">
                <p className="text-white font-semibold">
                  {user.firstName} {user.lastName}
                </p>
                {user.headline && (
                  <p className="text-white/70 text-sm mt-1">{user.headline}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
