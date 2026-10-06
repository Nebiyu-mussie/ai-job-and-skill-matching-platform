import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Sparkles, Bell } from 'lucide-react';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 mb-6">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">AI Job Platform Insights Hub</h1>
            <div className="w-20 h-1 bg-gradient-to-r from-brand-500 to-purple-600 mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-muted-foreground">Our blog is currently under construction!</p>
          </div>

          {/* Coming Soon Card */}
          <div className="bg-card border border-border rounded-xl p-8 mb-8 shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-500/10 mb-6">
              <Sparkles className="w-10 h-10 text-brand-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Coming Soon!</h2>
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              We're working hard to bring you valuable insights and updates. Soon, we'll be sharing deep dives into the future of recruitment powered by AI.
            </p>
          </div>

          {/* What to Expect */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">What to Expect</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">AI & Recruitment</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  How AI is transforming the recruitment landscape and making hiring more efficient, fair, and data-driven.
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Resume Optimization</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tips for optimizing your resume for semantic search engines and AI-powered matching algorithms.
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Skill Gap Analysis</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Understanding skill gaps in the market and how to upskill effectively to stay competitive.
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                  <Bell className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Platform Updates</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Latest features, improvements, and success stories from our growing community.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-br from-brand-500/5 to-purple-600/5 border border-brand-200 dark:border-brand-800 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-foreground mb-3">Stay Tuned!</h3>
            <p className="text-muted-foreground mb-6">
              Check back soon for our first articles. In the meantime, explore our platform and discover how AI can transform your job search or hiring process.
            </p>
            <a
              href="/jobs"
              className="inline-flex items-center justify-center px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium"
            >
              Browse Jobs
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
