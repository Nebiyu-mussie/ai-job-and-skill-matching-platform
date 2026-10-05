import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, Users, TrendingUp, Zap, Target, Star, MapPin, Building2 } from 'lucide-react';

const stats = [
  { label: 'Active Jobs', value: '2,400+', icon: Briefcase },
  { label: 'Companies', value: '340+', icon: Building2 },
  { label: 'Job Seekers', value: '18,000+', icon: Users },
  { label: 'Successful Hires', value: '4,200+', icon: Star },
];

const features = [
  {
    icon: Zap,
    title: 'AI Resume Parsing',
    description: 'Upload your resume and our AI extracts skills, experience, and education automatically.',
    color: 'from-yellow-400 to-orange-500',
  },
  {
    icon: Target,
    title: 'Smart Job Matching',
    description: 'Get a match score for every job. See exactly how well you fit before you apply.',
    color: 'from-brand-500 to-purple-600',
  },
  {
    icon: TrendingUp,
    title: 'Skill Gap Analysis',
    description: 'Discover missing skills and get personalized course recommendations to close the gap.',
    color: 'from-emerald-400 to-teal-600',
  },
];

const cities = ['Addis Ababa', 'Dire Dawa', 'Mekelle', 'Hawassa', 'Bahir Dar', 'Gondar'];

export default function LandingPage() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-hero-pattern">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-background to-purple-50 dark:from-brand-950/20 dark:via-background dark:to-purple-950/20 -z-10" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-brand-500/5 blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-sm font-medium mb-8 border border-brand-200 dark:border-brand-700"
            >
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              AI-Powered Recruitment for Ethiopia &amp; Africa
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground leading-tight mb-6"
            >
              Find Your Dream Job with{' '}
              <span className="gradient-text">AI Precision</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Upload your resume, get an AI match score, and discover jobs tailored to your skills.
              Built for Ethiopia's growing tech ecosystem.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/register" className="btn-primary text-base px-8 py-3 flex items-center gap-2 group">
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/jobs" className="btn-secondary text-base px-8 py-3">
                Browse Jobs
              </Link>
            </motion.div>

            {/* City pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-2 mt-8"
            >
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Jobs in:
              </span>
              {cities.map((city) => (
                <Link
                  key={city}
                  to={`/jobs?city=${city}`}
                  className="text-xs px-3 py-1 rounded-full bg-muted hover:bg-accent border border-border text-muted-foreground hover:text-foreground transition-colors"
                >
                  {city}
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-black text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
              How AI Makes Your Job Search Smarter
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform uses cutting-edge AI to match you with the right opportunities and help you grow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="card p-8 group hover:-translate-y-1 transition-transform duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-r from-brand-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-brand-100 mb-8 text-lg">
            Join 18,000+ professionals already using AI Job Platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="px-8 py-3 rounded-xl bg-white text-brand-700 font-bold text-base hover:bg-brand-50 transition-colors">
              Create Free Account
            </Link>
            <Link to="/register?role=employer" className="px-8 py-3 rounded-xl border-2 border-white/40 text-white font-bold text-base hover:bg-white/10 transition-colors">
              Hire Talent
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
