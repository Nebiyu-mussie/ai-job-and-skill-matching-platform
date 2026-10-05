import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Search } from 'lucide-react';
import { useState } from 'react';

export default function CandidatesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['candidates', searchTerm],
    queryFn: async () => {
      const response = await api.get('/users/search', {
        params: { search: searchTerm, role: 'jobseeker' },
      });
      return response.data.data;
    },
  });

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Search Candidates</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by skills, location, or keywords..."
          className="w-full pl-10 pr-4 py-3 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {data?.users?.map((candidate: any) => (
          <div key={candidate._id} className="border rounded-lg p-6 hover:shadow-lg transition">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                {candidate.profileImage ? (
                  <img src={candidate.profileImage} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold">{candidate.firstName[0]}</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{candidate.firstName} {candidate.lastName}</h3>
                <p className="text-sm text-muted-foreground mb-2">{candidate.headline || 'Job Seeker'}</p>
                <div className="flex flex-wrap gap-1">
                  {candidate.skills?.slice(0, 5).map((skill: any, idx: number) => (
                    <span key={idx} className="text-xs bg-secondary px-2 py-1 rounded">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
