import { motion } from 'framer-motion';
import { Shield, Database, Eye, Lock, UserCheck, Share2 } from 'lucide-react';

export default function PrivacyPage() {
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
            <div className="w-20 h-1 bg-gradient-to-r from-green-500 to-emerald-600 mx-auto rounded-full mb-4"></div>
            <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>

          {/* Introduction */}
          <div className="bg-card border border-border rounded-xl p-8 mb-8 shadow-sm">
            <p className="text-muted-foreground leading-relaxed">
              At AI Job & Skill Matching Platform, we take your privacy seriously. This Privacy Policy explains how we collect, use, protect, and share your personal information when you use our AI-powered recruitment platform.
            </p>
          </div>

          {/* Information We Collect */}
          <div className="bg-card border border-border rounded-xl p-8 mb-8 shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <Database className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-4">Information We Collect</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Personal Data</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      We collect basic information such as your name, email address, phone number, and profile photo to create and manage your account.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Professional Data</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      This includes resumes, CVs, work history, skills, education, certifications, and employment preferences that help us match you with relevant opportunities.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Usage Data</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      We track how you interact with our platform, including job views, application submissions, search queries, and match interactions to improve our services.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How We Use Your Data (AI Clause) */}
          <div className="bg-gradient-to-br from-purple-500/5 to-pink-600/5 border border-purple-200 dark:border-purple-800 rounded-xl p-8 mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                <Eye className="w-6 h-6 text-purple-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-4">How We Use Your Data (The AI Clause)</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Our platform leverages advanced artificial intelligence to provide you with the best job matching experience. Here's how we process your data with AI:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0"></div>
                    <p className="text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">Resume Parsing:</span> We use Large Language Models (LLMs) to automatically extract and structure information from your resume, including skills, experience, and qualifications.
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0"></div>
                    <p className="text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">Vector Embeddings:</span> We convert your professional profile into mathematical vector representations that enable semantic search and intelligent matching beyond simple keyword matching.
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0"></div>
                    <p className="text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">Skill Gap Analysis:</span> Our AI identifies gaps between your current skills and job requirements, providing personalized recommendations for courses and learning paths.
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0"></div>
                    <p className="text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">Match Scoring:</span> We calculate compatibility scores between job seekers and positions using machine learning algorithms that consider skills, experience, and cultural fit.
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Data Sharing */}
          <div className="bg-card border border-border rounded-xl p-8 mb-8 shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                <Share2 className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-4">Data Sharing</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0"></div>
                    <p className="text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">With Employers:</span> When you apply for a job, we share your profile, resume, and match score with the employer. You control what information is visible on your public profile.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0"></div>
                    <p className="text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">Cloud Infrastructure:</span> We use secure cloud and AI infrastructure providers to process and store data. All third-party providers are GDPR-compliant and maintain strict security standards.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0"></div>
                    <p className="text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">No Data Selling:</span> We do not sell your personal data to data brokers, advertisers, or any third parties for marketing purposes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Your Rights */}
          <div className="bg-card border border-border rounded-xl p-8 mb-8 shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                <UserCheck className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-4">Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You maintain full ownership and control of your data. You have the right to:
                </p>
                <ul className="space-y-2">
                  {[
                    'Access your personal data and download a copy',
                    'Correct inaccurate or incomplete information',
                    'Delete your account and all associated data',
                    'Opt-out of AI-powered matching (with limited functionality)',
                    'Restrict how your data is processed',
                    'Object to automated decision-making',
                    'Withdraw consent at any time',
                  ].map((right, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"></div>
                      <p className="text-muted-foreground leading-relaxed">{right}</p>
                    </li>
                  ))}
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  To exercise any of these rights, visit your account settings or contact us at{' '}
                  <a href="mailto:privacy@aijobplatform.com" className="text-brand-500 hover:underline">
                    privacy@aijobplatform.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Data Security */}
          <div className="bg-card border border-border rounded-xl p-8 mb-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-4">Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement industry-standard security measures including encryption at rest and in transit, secure authentication protocols, regular security audits, and access controls to protect your data from unauthorized access, alteration, or destruction.
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gradient-to-br from-brand-500/5 to-purple-600/5 border border-brand-200 dark:border-brand-800 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-foreground mb-3">Questions About Privacy?</h3>
            <p className="text-muted-foreground mb-6">
              If you have any questions or concerns about our privacy practices, please don't hesitate to reach out.
            </p>
            <a
              href="mailto:privacy@aijobplatform.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium"
            >
              Contact Privacy Team
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
