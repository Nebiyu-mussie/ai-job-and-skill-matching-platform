import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Building2, Lock, AlertTriangle, Save, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

type TabType = 'profile' | 'security' | 'danger';

export default function EmployerSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const navigate = useNavigate();
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  const tabs = [
    { id: 'profile' as TabType, label: 'Company Profile', icon: Building2 },
    { id: 'security' as TabType, label: 'Security', icon: Lock },
    { id: 'danger' as TabType, label: 'Danger Zone', icon: AlertTriangle },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your company profile and account settings</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 border-b-2 transition-colors font-medium',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'security' && <SecurityTab logout={logout} />}
        {activeTab === 'danger' && <DangerZoneTab logout={logout} />}
      </div>
    </div>
  );
}

// Profile Tab Component
function ProfileTab() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>({});

  const { data, isLoading } = useQuery({
    queryKey: ['employer-profile'],
    queryFn: async () => {
      const response = await api.get('/employers/profile');
      const employer = response.data.data.employer;
      setFormData({
        companyName: employer.companyName || '',
        industry: employer.industry || '',
        companySize: employer.companySize || '',
        website: employer.website || '',
        description: employer.description || '',
        location: {
          city: employer.location?.city || '',
          region: employer.location?.region || '',
          country: employer.location?.country || '',
        },
        contactEmail: employer.contactEmail || '',
        contactPhone: employer.contactPhone || '',
        founded: employer.founded || '',
        benefits: employer.benefits?.join(', ') || '',
        socialLinks: {
          linkedIn: employer.socialLinks?.linkedIn || '',
          twitter: employer.socialLinks?.twitter || '',
          facebook: employer.socialLinks?.facebook || '',
        },
      });
      return response.data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      // Process benefits from comma-separated string to array
      const processedData = {
        ...data,
        benefits: data.benefits ? data.benefits.split(',').map((b: string) => b.trim()).filter(Boolean) : [],
      };

      // Remove empty optional fields to avoid validation errors
      if (!processedData.website || processedData.website.trim() === '') {
        delete processedData.website;
      }
      if (!processedData.founded || processedData.founded === '') {
        delete processedData.founded;
      }
      if (!processedData.contactPhone || processedData.contactPhone.trim() === '') {
        delete processedData.contactPhone;
      }

      // Clean up social links - remove empty ones
      if (processedData.socialLinks) {
        const cleanedSocialLinks: any = {};
        if (processedData.socialLinks.linkedIn && processedData.socialLinks.linkedIn.trim() !== '') {
          cleanedSocialLinks.linkedIn = processedData.socialLinks.linkedIn;
        }
        if (processedData.socialLinks.twitter && processedData.socialLinks.twitter.trim() !== '') {
          cleanedSocialLinks.twitter = processedData.socialLinks.twitter;
        }
        if (processedData.socialLinks.facebook && processedData.socialLinks.facebook.trim() !== '') {
          cleanedSocialLinks.facebook = processedData.socialLinks.facebook;
        }
        
        // Only include socialLinks if there are any non-empty values
        if (Object.keys(cleanedSocialLinks).length > 0) {
          processedData.socialLinks = cleanedSocialLinks;
        } else {
          delete processedData.socialLinks;
        }
      }

      const response = await api.put('/employers/profile', processedData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['employer-profile'] });
    },
    onError: (error: any) => {
      // Extract detailed validation error messages
      const errorData = error.response?.data;
      
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        // Handle validation errors array (from express-validator or similar)
        errorData.errors.forEach((err: any) => {
          toast.error(err.msg || err.message || 'Validation error');
        });
      } else if (errorData?.message) {
        // Check if it's a Mongoose validation error with details
        if (errorData.message.includes('validation failed')) {
          // Try to extract specific field errors from Mongoose
          const errorMsg = errorData.message;
          
          // Extract field-specific errors from Mongoose error message
          const fieldErrors = errorMsg.match(/([a-zA-Z]+): (.+?)(?:,|$)/g);
          if (fieldErrors && fieldErrors.length > 0) {
            fieldErrors.forEach((fieldError: string) => {
              const match = fieldError.match(/([a-zA-Z]+): (.+?)(?:,|$)/);
              if (match) {
                const field = match[1];
                const message = match[2].trim();
                toast.error(`${field}: ${message}`);
              }
            });
          } else {
            toast.error(errorData.message);
          }
        } else {
          toast.error(errorData.message);
        }
      } else {
        toast.error('Failed to update profile');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev: any) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company Information */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold">Company Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Company Name *</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Industry *</label>
            <input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Company Size</label>
            <select
              name="companySize"
              value={formData.companySize}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="501-1000">501-1000 employees</option>
              <option value="1000+">1000+ employees</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Website</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Founded Year</label>
            <input
              type="number"
              name="founded"
              value={formData.founded}
              onChange={handleChange}
              placeholder="2020"
              min="1800"
              max={new Date().getFullYear()}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Tell candidates about your company..."
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Location */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold">Location</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">City</label>
            <input
              type="text"
              name="location.city"
              value={formData.location?.city}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Region/State</label>
            <input
              type="text"
              name="location.region"
              value={formData.location?.region}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Country</label>
            <input
              type="text"
              name="location.country"
              value={formData.location?.country}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold">Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Contact Email</label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Contact Phone</label>
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold">Benefits</h3>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Employee Benefits (comma-separated)
          </label>
          <textarea
            name="benefits"
            value={formData.benefits}
            onChange={handleChange}
            rows={3}
            placeholder="Health Insurance, Remote Work, Flexible Hours, 401k"
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Separate benefits with commas
          </p>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold">Social Links</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">LinkedIn</label>
            <input
              type="url"
              name="socialLinks.linkedIn"
              value={formData.socialLinks?.linkedIn}
              onChange={handleChange}
              placeholder="https://linkedin.com/company/..."
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Twitter</label>
            <input
              type="url"
              name="socialLinks.twitter"
              value={formData.socialLinks?.twitter}
              onChange={handleChange}
              placeholder="https://twitter.com/..."
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Facebook</label>
            <input
              type="url"
              name="socialLinks.facebook"
              value={formData.socialLinks?.facebook}
              onChange={handleChange}
              placeholder="https://facebook.com/..."
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 font-medium"
        >
          <Save className="w-5 h-5" />
          {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

// Security Tab Component
function SecurityTab({ logout }: { logout: () => void }) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await api.put('/auth/change-password', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password changed successfully! Please log in again.');
      setTimeout(() => logout(), 2000);
    },
    onError: (error: any) => {
      const errorData = error.response?.data;
      
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        errorData.errors.forEach((err: any) => {
          toast.error(err.msg || err.message || 'Validation error');
        });
      } else {
        toast.error(errorData?.message || 'Failed to change password');
      }
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <form onSubmit={handlePasswordSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div>
          <h3 className="text-xl font-semibold">Change Password</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Update your password to keep your account secure
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Current Password</label>
          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              required
              className="w-full px-4 py-2 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">New Password</label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              required
              minLength={8}
              className="w-full px-4 py-2 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Confirm New Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              required
              minLength={8}
              className="w-full px-4 py-2 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={changePasswordMutation.isPending}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 font-medium"
        >
          <Lock className="w-5 h-5" />
          {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}

// Danger Zone Tab Component
function DangerZoneTab({ logout }: { logout: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      // This endpoint would need to be implemented in the backend
      const response = await api.delete('/employers/profile');
      return response.data;
    },
    onSuccess: () => {
      toast.success('Account deleted successfully');
      logout();
    },
    onError: (error: any) => {
      const errorData = error.response?.data;
      
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        errorData.errors.forEach((err: any) => {
          toast.error(err.msg || err.message || 'Validation error');
        });
      } else {
        toast.error(errorData?.message || 'Failed to delete account');
      }
    },
  });

  const handleDelete = () => {
    if (confirmDelete === 'DELETE') {
      deleteMutation.mutate();
    } else {
      toast.error('Please type DELETE to confirm');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2">
              Delete Account
            </h3>
            <p className="text-red-800 dark:text-red-200 mb-4">
              Once you delete your account, there is no going back. This action will:
            </p>
            <ul className="list-disc list-inside space-y-1 text-red-800 dark:text-red-200 mb-6">
              <li>Permanently delete your company profile</li>
              <li>Remove all job postings</li>
              <li>Delete all applications and candidate data</li>
              <li>Cancel any active subscriptions</li>
            </ul>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Confirm Account Deletion</h3>
            <p className="text-muted-foreground mb-4">
              This action cannot be undone. Type <strong>DELETE</strong> to confirm.
            </p>
            <input
              type="text"
              value={confirmDelete}
              onChange={(e) => setConfirmDelete(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmDelete('');
                }}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={confirmDelete !== 'DELETE' || deleteMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
