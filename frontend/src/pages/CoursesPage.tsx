import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Award, TrendingUp } from 'lucide-react';

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Skill Development Courses</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upskill and advance your career with AI-powered learning recommendations
            </p>
          </div>

          {/* Coming Soon */}
          <div className="bg-card border border-border rounded-xl p-12 shadow-sm max-w-2xl mx-auto">
            <div className="space-y-6">
              <div className="flex justify-center gap-8 mb-6">
                <div className="w-12 h-12 rounded-lg bg-brand-500/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-brand-500" />
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-500" />
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Coming Soon</h2>
              <p className="text-muted-foreground">
                We're creating a comprehensive learning platform with courses, certifications, 
                and personalized skill development paths. Watch this space!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}