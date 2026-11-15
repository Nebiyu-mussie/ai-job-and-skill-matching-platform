import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import JobCard from '@/components/jobs/JobCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { Briefcase, GraduationCap, TrendingUp, ExternalLink, Sparkles } from 'lucide-react';

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

  const aiRecommendations = coursesData?.aiRecommendations || [];
  const dbCourses = coursesData?.courses || [];
  const targetSkills = coursesData?.targetSkills || [];

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
        ) : jobsData?.jobs?.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {jobsData.jobs.map((job: any) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No job recommendations available yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Complete your profile to get personalized suggestions!</p>
          </div>
        )}
      </section>

      {/* AI-Powered Course Recommendations */}
      {aiRecommendations.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">AI-Powered Course Recommendations</h2>
          </div>
          {targetSkills.length > 0 && (
            <p className="text-sm text-muted-foreground mb-4">
              Based on your skill gaps: <span className="font-medium">{targetSkills.slice(0, 5).join(', ')}</span>
              {targetSkills.length > 5 && ` and ${targetSkills.length - 5} more`}
            </p>
          )}
          {coursesLoading ? (
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {aiRecommendations.map((course: any, idx: number) => (
                <div 
                  key={idx} 
                  className="border rounded-lg p-5 hover:shadow-lg transition bg-gradient-to-br from-primary/5 to-transparent"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1 line-clamp-2">{course.title}</h3>
                      <p className="text-sm text-primary font-medium">{course.platform}</p>
                    </div>
                    <Sparkles className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{course.description}</p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-secondary px-2 py-1 rounded capitalize">
                      {course.level}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {course.duration}
                    </span>
                  </div>
                  
                  <a
                    href={course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium"
                  >
                    View Course <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Database Courses */}
      {dbCourses.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">More Recommended Courses</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {dbCourses.slice(0, 6).map((course: any) => (
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
        </section>
      )}

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
