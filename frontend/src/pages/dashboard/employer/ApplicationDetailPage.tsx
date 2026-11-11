import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  ArrowLeft, 
  Briefcase, 
  MapPin, 
  Calendar, 
  Mail, 
  Phone, 
  Download,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  GraduationCap,
  Target,
  TrendingUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['application-detail', id],
    queryFn: async () => {
      const response = await api.get(`/applications/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await api.put(`/applications/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['employer-applications'] });
      toast.success('Application status updated successfully');
      setSelectedStatus('');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update application status');
    },
  });

  const toggleStarMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch(`/applications/${id}/star`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['employer-applications'] });
      const currentApp = data?.data?.application;
      toast.success(currentApp?.isStarred ? 'Removed from starred' : 'Added to starred');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update starred status');
    },
  });

  // Early returns for loading and error states BEFORE accessing data
  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  const application = data?.data?.application;

  if (isError || !application) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/employer/candidates')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Candidates
        </button>
        <div className="flex flex-col items-center justify-center min-h-[60vh] border rounded-lg p-8">
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Application Not Found</h2>
          <p className="text-muted-foreground mb-6">This application may have been removed or doesn't exist.</p>
          <button
            onClick={() => navigate('/employer/candidates')}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
          >
            Back to Candidates
          </button>
        </div>
      </div>
    );
  }

  const candidate = application?.applicant;
  const job = application?.job;

  const handleStatusChange = () => {
    if (selectedStatus && selectedStatus !== application?.status) {
      updateStatusMutation.mutate(selectedStatus);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'reviewing': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'shortlisted': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'interview': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'accepted': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400';
    if (score >= 60) return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400';
    return 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400';
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return 'N/A';
    }
  };

  const formatMonthYear = (date: any) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short'
      });
    } catch {
      return 'N/A';
    }
  };

  const formatLocation = (location: any) => {
    if (!location) return null;
    
    // If location is a string, return it directly
    if (typeof location === 'string') return location;
    
    // If location is an object with city/country properties
    if (typeof location === 'object') {
      const parts = [];
      if (location.city) parts.push(location.city);
      if (location.country) parts.push(location.country);
      const locationStr = parts.join(', ');
      
      if (location.isRemote) {
        return locationStr ? `${locationStr} (Remote)` : 'Remote';
      }
      
      return locationStr || null;
    }
    
    return null;
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/employer/candidates')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Candidates
        </button>
        
        <button
          onClick={() => toggleStarMutation.mutate()}
          disabled={toggleStarMutation.isPending}
          className="p-2 hover:bg-secondary rounded-lg transition"
        >
          <Star 
            className={`h-6 w-6 ${application?.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
          />
        </button>
      </div>

      {/* Candidate Profile Card */}
      <div className="border rounded-lg p-6 bg-card">
        <div className="flex items-start gap-6 mb-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center">
            {candidate?.profileImage ? (
              <img 
                src={candidate.profileImage} 
                alt={`${candidate.firstName} ${candidate.lastName}`}
                className="w-full h-full object-cover" 
              />
            ) : (
              <span className="text-3xl font-bold">
                {candidate?.firstName?.[0]}{candidate?.lastName?.[0]}
              </span>
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {candidate?.firstName} {candidate?.lastName}
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              {candidate?.headline || 'Job Seeker'}
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {candidate?.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${candidate.email}`} className="hover:underline">
                    {candidate.email}
                  </a>
                </div>
              )}
              {candidate?.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{candidate.phone}</span>
                </div>
              )}
              {candidate?.location && formatLocation(candidate.location) && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{formatLocation(candidate.location)}</span>
                </div>
              )}
              {application?.appliedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Applied {formatDate(application.appliedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Job Info */}
        {job && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Briefcase className="h-4 w-4" />
              <span className="font-semibold">Applied for:</span>
            </div>
            <h3 className="text-xl font-semibold">{job.title}</h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              {job.location && formatLocation(job.location) && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{formatLocation(job.location)}</span>
                </div>
              )}
              {job.type && (
                <span className="px-2 py-1 bg-secondary rounded text-xs">{job.type}</span>
              )}
              {job.experienceLevel && (
                <span className="px-2 py-1 bg-secondary rounded text-xs capitalize">{job.experienceLevel}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI Match Score - Prominent Display */}
      {application?.matchScore != null && (
        <div className="border rounded-lg p-6 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="flex items-center gap-3 mb-4">
            <div className={`rounded-full p-3 ${getMatchScoreColor(application.matchScore)}`}>
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Match Score</h2>
              <p className="text-sm text-muted-foreground">Powered by AI analysis</p>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-6">
            <div className={`text-6xl font-bold ${getMatchScoreColor(application.matchScore)} rounded-xl p-4`}>
              {application.matchScore}%
            </div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    application.matchScore >= 80 ? 'bg-emerald-500' :
                    application.matchScore >= 60 ? 'bg-amber-500' : 'bg-gray-400'
                  }`}
                  style={{ width: `${application.matchScore}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {application.matchScore >= 80 ? 'Excellent match for this position' :
                 application.matchScore >= 60 ? 'Good potential match' : 'Moderate match'}
              </p>
            </div>
          </div>

          {/* AI Matching Breakdown */}
          {application?.matchDetails && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                AI Matching Analysis
              </h3>
              <div className="space-y-2 text-sm">
                {typeof application?.matchDetails === 'object' && application.matchDetails ? (
                  Object.entries(application.matchDetails).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="font-semibold">{String(value)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">{application?.matchDetails}</p>
                )}
              </div>
            </div>
          )}

          {application?.matchReason && (
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
              <h4 className="font-semibold mb-2">Why this match?</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{application.matchReason}</p>
            </div>
          )}
        </div>
      )}

      {/* Status Management */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Application Status</h2>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Current Status:</span>
          </div>
          <span className={`px-4 py-2 rounded-lg capitalize font-semibold ${getStatusColor(application?.status || '')}`}>
            {application?.status || 'N/A'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="flex-1 px-4 py-3 border rounded-lg"
          >
            <option value="">Select new status...</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview">Interview</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={handleStatusChange}
            disabled={!selectedStatus || selectedStatus === application?.status || updateStatusMutation.isPending}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </div>

      {/* Skills */}
      {candidate?.skills && candidate.skills.length > 0 && (
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5" />
            Skills & Expertise
          </h2>
          <div className="flex flex-wrap gap-2">
            {(candidate.skills || []).map((skill: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-lg">
                <span className="font-medium">{skill?.name || 'N/A'}</span>
                {skill?.level && (
                  <span className="text-xs text-muted-foreground capitalize">({skill.level})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {candidate?.experience && candidate.experience.length > 0 && (
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Work Experience
          </h2>
          <div className="space-y-4">
            {(candidate.experience || []).map((exp: any, idx: number) => (
              <div key={idx} className="border-l-2 border-primary pl-4 pb-4 last:pb-0">
                <h3 className="font-semibold text-lg">{exp?.title || 'N/A'}</h3>
                <p className="text-muted-foreground">{exp?.company || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">
                  {formatMonthYear(exp?.startDate)} - {exp?.current ? 'Present' : formatMonthYear(exp?.endDate)}
                </p>
                {exp?.description && (
                  <p className="mt-2 text-sm">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {candidate?.education && candidate.education.length > 0 && (
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Education
          </h2>
          <div className="space-y-4">
            {(candidate.education || []).map((edu: any, idx: number) => (
              <div key={idx} className="border-l-2 border-primary pl-4 pb-4 last:pb-0">
                <h3 className="font-semibold text-lg">{edu?.degree || 'N/A'}</h3>
                <p className="text-muted-foreground">{edu?.institution || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">
                  {edu?.startYear || 'N/A'} - {edu?.current ? 'Present' : (edu?.endYear || 'N/A')}
                </p>
                {edu?.fieldOfStudy && (
                  <p className="mt-1 text-sm">Field: {edu.fieldOfStudy}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resume Download */}
      {application?.resume && (
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Resume & Documents</h2>
          <a
            href={application?.resume || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/80 px-4 py-3 rounded-lg transition"
          >
            <Download className="h-5 w-5" />
            Download Resume
          </a>
        </div>
      )}

      {/* Cover Letter */}
      {application?.coverLetter && (
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Cover Letter</h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{application?.coverLetter || ''}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-4 pt-4 border-t">
        <button
          onClick={() => {
            if (application?.status === 'accepted') {
              toast.success('Application already accepted');
            } else {
              updateStatusMutation.mutate('accepted');
            }
          }}
          disabled={application?.status === 'accepted'}
          className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          <CheckCircle className="h-5 w-5" />
          Accept Candidate
        </button>
        <button
          onClick={() => {
            if (application?.status === 'rejected') {
              toast.success('Application already rejected');
            } else {
              updateStatusMutation.mutate('rejected');
            }
          }}
          disabled={application?.status === 'rejected'}
          className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          <XCircle className="h-5 w-5" />
          Reject Application
        </button>
      </div>
    </div>
  );
}
