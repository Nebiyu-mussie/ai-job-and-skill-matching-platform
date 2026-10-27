import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Search, Briefcase, MapPin, Star } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function CandidatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['employer-applications', searchTerm, statusFilter],
    queryFn: async () => {
      const response = await api.get('/applications/employer', {
        params: { 
          status: statusFilter || undefined,
          limit: 50,
        },
      });
      return response.data;
    },
  });

  // Extract applications array with fallback
  const applications = data?.data || [];
  
  // Filter by search term (client-side for now)
  const filteredApplications = applications.filter((app: any) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const applicant = app.applicant;
    
    // Search in name, headline, skills
    const matchesName = `${applicant?.firstName} ${applicant?.lastName}`.toLowerCase().includes(searchLower);
    const matchesHeadline = applicant?.headline?.toLowerCase().includes(searchLower);
    const matchesSkills = applicant?.skills?.some((skill: any) => 
      skill.name.toLowerCase().includes(searchLower)
    );
    
    return matchesName || matchesHeadline || matchesSkills;
  });

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Candidates</h1>
        <p className="text-muted-foreground mt-1">
          {data?.pagination?.total || 0} applicant{data?.pagination?.total !== 1 ? 's' : ''} found
        </p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, skills, or headline..."
            className="w-full pl-10 pr-4 py-3 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-3 border rounded-lg"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="reviewing">Reviewing</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="interview">Interview</option>
          <option value="rejected">Rejected</option>
          <option value="accepted">Accepted</option>
        </select>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchTerm || statusFilter ? 'No matching candidates found' : 'No candidates yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter 
              ? 'Try adjusting your search or filters'
              : 'Candidates will appear here when they apply to your job postings'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredApplications.map((application: any) => {
            const candidate = application.applicant;
            if (!candidate) return null;
            
            return (
              <Link
                key={application._id}
                to={`/dashboard/employer/applications/${application._id}`}
                className="border rounded-lg p-6 hover:shadow-lg transition hover:border-primary"
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center">
                      {candidate.profileImage ? (
                        <img 
                          src={candidate.profileImage} 
                          alt="" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span className="text-2xl font-bold">
                          {candidate.firstName?.[0]}{candidate.lastName?.[0]}
                        </span>
                      )}
                    </div>
                    {application.isStarred && (
                      <Star className="absolute -top-1 -right-1 h-5 w-5 fill-yellow-400 text-yellow-400" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-lg font-semibold truncate">
                        {candidate.firstName} {candidate.lastName}
                      </h3>
                      {application.matchScore != null && (
                        <span className={`text-sm font-semibold px-2 py-1 rounded ${
                          application.matchScore >= 80 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : application.matchScore >= 60
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {application.matchScore}%
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2 truncate">
                      {candidate.headline || 'Job Seeker'}
                    </p>
                    
                    {application.job && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <Briefcase className="h-3 w-3" />
                        <span className="truncate">{application.job.title}</span>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      {candidate.skills?.slice(0, 4).map((skill: any, idx: number) => (
                        <span 
                          key={idx} 
                          className="text-xs bg-secondary px-2 py-1 rounded"
                        >
                          {skill.name}
                        </span>
                      ))}
                      {candidate.skills?.length > 4 && (
                        <span className="text-xs text-muted-foreground px-2 py-1">
                          +{candidate.skills.length - 4} more
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className={`px-2 py-1 rounded capitalize ${
                        application.status === 'pending' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        application.status === 'shortlisted' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                        application.status === 'interview' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        application.status === 'accepted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        application.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {application.status}
                      </span>
                      <span>
                        Applied {new Date(application.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
