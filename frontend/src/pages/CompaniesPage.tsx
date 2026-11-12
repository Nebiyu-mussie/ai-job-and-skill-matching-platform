import { motion } from 'framer-motion';
import { Building2, MapPin, Briefcase, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';

interface Employer {
  _id: string;
  companyName: string;
  slug: string;
  logo?: string;
  industry: string;
  location: {
    city: string;
    country: string;
  };
  description?: string;
  isVerified: boolean;
  activeJobCount?: number;
  totalHires?: number;
  rating?: number;
}

export default function CompaniesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['employers'],
    queryFn: async () => {
      const response = await api.get('/employers');
      console.log('Employers Response:', response.data);
      return response.data.data;
    },
  });

  const employers = data || [];

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Company Directory</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover amazing companies and explore career opportunities
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner size="lg" text="Loading companies..." />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-2xl mx-auto">
              <p className="text-red-600">Failed to load companies. Please try again later.</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && employers.length === 0 && (
            <div className="bg-card border border-border rounded-xl p-12 shadow-sm max-w-2xl mx-auto text-center">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">No Companies Yet</h2>
              <p className="text-muted-foreground">
                Be the first employer to register and showcase your company!
              </p>
            </div>
          )}

          {/* Company Grid */}
          {!isLoading && !error && employers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {employers.map((employer: Employer, index: number) => (
                <motion.div
                  key={employer._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link
                    to={`/companies/${employer.slug}`}
                    className="block bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all hover:border-brand-500 group"
                  >
                    {/* Company Logo */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-brand-500/10 to-purple-500/10 flex items-center justify-center flex-shrink-0 group-hover:from-brand-500/20 group-hover:to-purple-500/20 transition-colors">
                        {employer.logo ? (
                          <img
                            src={employer.logo}
                            alt={`${employer.companyName} logo`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Building2 className="w-8 h-8 text-brand-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-foreground truncate group-hover:text-brand-500 transition-colors">
                            {employer.companyName}
                          </h3>
                          {employer.isVerified && (
                            <span title="Verified Company">
                              <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{employer.industry}</p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        {employer.location?.city}, {employer.location?.country}
                      </span>
                    </div>

                    {/* Description */}
                    {employer.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {employer.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-4 text-sm">
                        {employer.activeJobCount !== undefined && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Briefcase className="w-4 h-4" />
                            <span>{employer.activeJobCount} jobs</span>
                          </div>
                        )}
                        {employer.totalHires !== undefined && employer.totalHires > 0 && (
                          <div className="text-muted-foreground">
                            {employer.totalHires} hires
                          </div>
                        )}
                      </div>
                      {employer.rating && (
                        <div className="text-sm font-medium text-brand-500">
                          ★ {employer.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}