import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Pencil } from 'lucide-react';

export default function EmployerProfilePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['employer-profile'],
    queryFn: async () => {
      const response = await api.get('/employers/profile');
      return response.data.data;
    },
  });

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  // Extract employer data from response
  const employer = data?.employer;

  if (!employer) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-muted-foreground">No employer profile found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Company Profile</h1>
        <Link
          to="/employer/settings"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Pencil className="w-4 h-4" />
          Edit Profile
        </Link>
      </div>

      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Company Information</h2>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Company Name</label>
            <p className="text-lg">{employer.companyName || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Industry</label>
            <p className="text-lg">{employer.industry || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Company Size</label>
            <p className="text-lg capitalize">{employer.companySize || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Website</label>
            <p className="text-lg">
              {employer.website ? (
                <a href={employer.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {employer.website}
                </a>
              ) : (
                'Not provided'
              )}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <p className="text-lg">{employer.description || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Location</label>
            <p className="text-lg">
              {employer.location ? 
                `${employer.location.city || ''}${employer.location.region ? ', ' + employer.location.region : ''}, ${employer.location.country || ''}`.trim() 
                : 'Not provided'
              }
            </p>
          </div>
          {employer.founded && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Founded</label>
              <p className="text-lg">{employer.founded}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Contact Email</label>
            <p className="text-lg">{employer.contactEmail || 'Not provided'}</p>
          </div>
          {employer.contactPhone && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Contact Phone</label>
              <p className="text-lg">{employer.contactPhone}</p>
            </div>
          )}
        </div>
      </div>

      {employer.benefits && employer.benefits.length > 0 && (
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Benefits</h2>
          <ul className="space-y-2">
            {employer.benefits.map((benefit: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(employer.socialLinks?.linkedIn || employer.socialLinks?.twitter || employer.socialLinks?.facebook) && (
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Social Links</h2>
          <div className="space-y-2">
            {employer.socialLinks.linkedIn && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">LinkedIn</label>
                <p>
                  <a href={employer.socialLinks.linkedIn} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {employer.socialLinks.linkedIn}
                  </a>
                </p>
              </div>
            )}
            {employer.socialLinks.twitter && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Twitter</label>
                <p>
                  <a href={employer.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {employer.socialLinks.twitter}
                  </a>
                </p>
              </div>
            )}
            {employer.socialLinks.facebook && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Facebook</label>
                <p>
                  <a href={employer.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {employer.socialLinks.facebook}
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
