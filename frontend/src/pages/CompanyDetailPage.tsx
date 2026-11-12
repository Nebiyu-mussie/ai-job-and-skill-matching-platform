import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import JobCard from '@/components/jobs/JobCard';
import { Building2, MapPin, Briefcase, Users, CheckCircle, Globe, Linkedin, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';

interface Location {
  city: string;
  country: string;
}

interface Employer {
  _id: string;
  companyName: string;
  slug: string;
  logo?: string;
  industry: string;
  location: Location;
  description?: string;
  isVerified: boolean;
  website?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
  };
  companySize?: string;
  foundedYear?: number;
}

interface Job {
  _id: string;
  title: string;
  location: {
    city: string;
    country: string;
    isRemote: boolean;
  };
  jobType: string;
  experienceLevel: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
    period: string;
    isVisible: boolean;
  };
  createdAt: string;
  isFeatured: boolean;
  applicationCount: number;
  employer: {
    companyName: string;
    logo?: string;
    slug: string;
  };
}

interface CompanyData {
  employer: Employer;
  jobCount: number;
  activeJobCount: number;
  activeJobs: Job[];
}

export default function CompanyDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['company', slug],
    queryFn: async () => {
      const response = await api.get(`/employers/${slug}`);
      console.log('Company Detail Response:', response.data);
      return response.data.data as CompanyData;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading company details..." />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">Company not found or failed to load.</p>
          </div>
        </div>
      </div>
    );
  }

  const { employer, activeJobs, activeJobCount } = data;

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Premium Header Section */}
          <div className="bg-gradient-to-br from-brand-500/5 via-purple-500/5 to-blue-500/5 border border-border rounded-2xl p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Company Logo */}
              <div className="w-32 h-32 rounded-2xl bg-white border-2 border-border flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden">
                {employer.logo ? (
                  <img
                    src={employer.logo}
                    alt={`${employer.companyName} logo`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-16 h-16 text-brand-500" />
                )}
              </div>

              {/* Company Info */}
              <div className="flex-1 space-y-4">
                {/* Name & Verification */}
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-4xl font-bold text-foreground">{employer.companyName}</h1>
                  {employer.isVerified && (
                    <span title="Verified Company" className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </span>
                  )}
                </div>

                {/* Industry & Location */}
                <div className="flex flex-wrap gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    <span className="text-lg">{employer.industry}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span className="text-lg">
                      {employer.location?.city}, {employer.location?.country}
                    </span>
                  </div>
                  {employer.companySize && (
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      <span className="text-lg">{employer.companySize}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {employer.description && (
                  <p className="text-muted-foreground text-lg leading-relaxed max-w-4xl">
                    {employer.description}
                  </p>
                )}

                {/* Social Links & Website */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {employer.website && (
                    <a
                      href={employer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-border rounded-lg hover:border-brand-500 transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      <span className="text-sm font-medium">Website</span>
                    </a>
                  )}
                  {employer.socialMedia?.linkedin && (
                    <a
                      href={employer.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-border rounded-lg hover:border-blue-500 transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span className="text-sm font-medium">LinkedIn</span>
                    </a>
                  )}
                  {employer.socialMedia?.twitter && (
                    <a
                      href={employer.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-border rounded-lg hover:border-blue-400 transition-colors"
                    >
                      <Twitter className="w-4 h-4" />
                      <span className="text-sm font-medium">Twitter</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Open Positions Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-foreground">
                Open Positions
                {activeJobCount > 0 && (
                  <span className="ml-3 text-xl text-muted-foreground font-normal">
                    ({activeJobCount})
                  </span>
                )}
              </h2>
            </div>

            {/* Jobs Grid */}
            {activeJobs && activeJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeJobs.map((job, index) => (
                  <motion.div
                    key={job._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <JobCard job={job} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No Open Positions
                </h3>
                <p className="text-muted-foreground">
                  {employer.companyName} doesn't have any open positions at this time.
                  Check back later for new opportunities!
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}