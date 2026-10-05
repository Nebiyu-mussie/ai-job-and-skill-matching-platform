import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import JobCard from '@/components/jobs/JobCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { Briefcase, GraduationCap, TrendingUp } from 'lucide-react';

export default function RecommendationsPage() {
  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['recommendations', 'jobs'],
    queryFn: async () => {
      const response = await api.get('/recommendations/jobs');
      return response.data.data;
    },
  });

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['recommendations', 'courses'],
    queryFn: async () => {
      const response = await api.get('/recommendations/courses');
      return response.data.data;
    },
  });

  const { data: careerData } = useQuery({
    queryKey: ['recommendations', 'career-paths'],
    queryFn: async () => {
      const response = await api.get('/recommendations/career-paths');
      return response.data.data;
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Personalized Recommendations</h1>
        <p className="text-muted-foreground">
          Based on your profile, skills, and interests
        </p>
      </div>

      {/* Recommended Jobs */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Recommended Jobs</h2>
        </div>
        {jobsLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {jobsData?.jobs?.map((job: any) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </section>

      {/* Recommended Courses */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Recommended Courses</h2>
        </div>
        {coursesLoading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {coursesData?.courses?.slice(0, 6).map((course: any) => (
              <div key={course._id} className="border rounded-lg p-4 hover:shadow-lg transition">
                <h3 className="font-semibold mb-2">{course.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{course.provider}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {course.level}
                  </span>
                  <span className="font-semibold">{course.isFree ? 'Free' : `$${course.price}`}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Career Paths */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Career Path Suggestions</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {careerData?.careerPaths?.map((path: any, idx: number) => (
            <div key={idx} className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">{path.title}</h3>
              <div className="space-y-2 mb-4">
                <p className="text-sm">
                  <span className="font-medium">Current Fit:</span> {path.currentFit}%
                </p>
                <p className="text-sm">
                  <span className="font-medium">Timeline:</span> {path.timeline}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Avg Salary:</span> ${path.averageSalary.toLocaleString()}
                </p>
              </div>
              <div className="mb-3">
                <p className="text-sm font-medium mb-2">Required Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {path.requiredSkills.map((skill: string, i: number) => (
                    <span key={i} className="text-xs bg-secondary px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Next Steps:</p>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  {path.steps.slice(0, 3).map((step: string, i: number) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
