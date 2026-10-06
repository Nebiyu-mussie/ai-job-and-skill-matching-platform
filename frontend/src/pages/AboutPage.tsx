import { motion } from 'framer-motion';
import { Target, Zap, Shield, Users } from 'lucide-react';

export default function AboutPage() {
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
            <h1 className="text-4xl font-bold text-foreground mb-4">About Us</h1>
            <div className="w-20 h-1 bg-gradient-to-r from-brand-500 to-purple-600 mx-auto rounded-full"></div>
          </div>

          {/* Mission Section */}
          <div className="bg-card border border-border rounded-xl p-8 mb-8 shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                <Target className="w-6 h-6 text-brand-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  At <span className="font-semibold text-foreground">AI Job & Skill Matching Platform</span>, we believe that finding the right job—or the perfect candidate—shouldn't depend on navigating keyword filters or getting lost in a resume black hole. We are building the future of hiring by leveraging advanced artificial intelligence to match talent with opportunity based on genuine skills, experience, and potential.
                </p>
              </div>
            </div>
          </div>

          {/* What We Do Section */}
          <div className="bg-card border border-border rounded-xl p-8 mb-8 shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">What We Do</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Our platform uses cutting-edge natural language processing and vector matching to understand the semantic meaning behind your experience. Whether you are a job seeker looking for a role that fits your unique skill stack, or an employer searching for the perfect technical fit, our AI bridges the gap with transparency, speed, and precision.
                </p>
              </div>
            </div>
          </div>

          {/* Key Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Intelligent Matching</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our AI algorithms analyze skills, experience, and job requirements to create perfect matches, going beyond simple keyword matching.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Built for Africa</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Designed specifically for the Ethiopian and African job market, connecting local talent with opportunities across the continent.
              </p>
            </div>
          </div>

          {/* Vision Statement */}
          <div className="bg-gradient-to-br from-brand-500/5 to-purple-600/5 border border-brand-200 dark:border-brand-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4 text-center">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed text-center max-w-2xl mx-auto">
              We envision a future where every talented individual finds meaningful work that matches their skills and aspirations, and every employer discovers the perfect candidate without the inefficiencies of traditional recruitment. Together, we're building a smarter, fairer job market powered by AI.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
