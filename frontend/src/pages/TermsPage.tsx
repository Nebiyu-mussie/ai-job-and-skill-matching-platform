import { motion } from 'framer-motion';
import { FileText, UserCheck, AlertTriangle, Bot, Shield, Ban } from 'lucide-react';

export default function TermsPage() {
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-cyan-600 mx-auto rounded-full mb-4"></div>
            <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>

          {/* Introduction */}
          <div className="bg-card border border-border rounded-xl p-8 mb-8 shadow-sm">
            <p className="text-muted-foreground leading-relaxed">
              Welcome to AI Job & Skill Matching Platform. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully before using our services.
            </p>
          </div>

          {/* Acceptance of Terms */}
          <div className="bg-card border border-border rounded-xl p-8 mb-8 shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                <UserCheck className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  By accessing or using the AI Job & Skill Matching Platform (the "Platform"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  If you do not agree to these terms, you must immediately cease using our Platform. We reserve the right to modify these terms at any time, and continued use constitutes acceptance of any changes.
                </p>
              </div>
            </div>
          </div>

          {/* User Responsibilities & Content */}
          <div className="bg-card border border-border rounded-xl p-8 mb-8 shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-4">2. User Responsibilities & Content</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Accurate Information</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      You must provide accurate, current, and complete information when creating your account and uploading your professional profile, resume, or job postings. Misrepresentation of credentials, skills, or job requirements is strictly prohibited.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Content Ownership & License</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      You retain full ownership of all content you upload to the Platform, including resumes, cover letters, and profile information. However, by uploading content, you grant us a non-exclusive, worldwide, royalty-free license to:
                    </p>
                    <ul className="mt-2 space-y-2">
                      {[
                        'Parse and analyze your content using AI algorithms',
                        'Display your information to potential employers when you apply for jobs',
                        'Generate embeddings and match scores for job recommendations',
                        'Store and process your data in accordance with our Privacy Policy',
                      ].map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                          <p className="text-muted-foreground leading-relaxed">{item}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Prohibited Conduct</h3>
                    <p className="text-muted-foreground leading-relaxed">You agree not to:</p>
                    <ul className="mt-2 space-y-2">
                      {[
                        'Submit false, misleading, or fraudulent information',
                        'Impersonate another person or entity',
                        'Scrape, harvest, or collect user data without authorization',
                        'Use the Platform for spam, phishing, or malicious activities',
                        'Circumvent or manipulate our AI matching algorithms',
                        'Violate any applicable laws or regulations',
                      ].map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0"></div>
                          <p className="text-muted-foreground leading-relaxed">{item}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Matching Disclaimer */}
          <div className="bg-gradient-to-br from-purple-500/5 to-pink-600/5 border border-purple-200 dark:border-purple-800 rounded-xl p-8 mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                <Bot className="w-6 h-6 text-purple-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-4">3. AI Matching Disclaimer</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Our Platform uses artificial intelligence and machine learning algorithms to match job seekers with employment opportunities. You acknowledge and agree that:
                </p>
                <ul className="space-y-3">
                  {[
                    'AI-generated matches and scores are probabilistic and based on data patterns, not guarantees',
                    'Match percentages represent semantic similarity and do not guarantee job offer success',
                    'AI interpretations of resumes may not perfectly capture nuanced experience or context',
                    'You should review AI-parsed information for accuracy before submitting applications',
                    'We do not guarantee employment, interviews, or any specific hiring outcomes',
                    'Employers make final hiring decisions independent of AI match scores',
                    'Algorithm biases are actively monitored, but no AI system is perfectly neutral',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0"></div>
                      <p className="text-muted-foreground leading-relaxed">{item}</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Important:</span> Always review AI-generated content before submission. While our AI is highly accurate, you are responsible for ensuring your profile and applications represent you correctly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div className="bg-card border border-border rounded-xl p-8 mb-8 shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-4">4. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The Platform is provided on an "as-is" and "as-available" basis. To the fullest extent permitted by law:
                </p>
                <ul className="space-y-3">
                  {[
                    "We make no warranties, express or implied, regarding the Platform's accuracy, reliability, or availability",
                    'We are not liable for missed job opportunities, failed applications, or hiring decisions',
                    'We are not responsible for data loss, service interruptions, or technical failures',
                    'We are not liable for employer conduct, job posting accuracy, or workplace conditions',
                    'Our total liability shall not exceed the amount you paid for services in the past 12 months',
                    'We are not responsible for third-party content, links, or external integrations',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0"></div>
                      <p className="text-muted-foreground leading-relaxed">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Account Termination */}
          <div className="bg-card border border-border rounded-xl p-8 mb-8 shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                <Ban className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-4">5. Account Termination</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  We reserve the right to suspend, restrict, or permanently terminate your account at our sole discretion if we believe you have violated these Terms of Service or engaged in conduct harmful to the Platform or other users.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Grounds for termination include, but are not limited to:
                </p>
                <ul className="space-y-2">
                  {[
                    'Fraudulent activity or identity misrepresentation',
                    'Repeated violations of our policies',
                    'Abuse of AI systems or API misuse',
                    'Harassment of other users',
                    'Violation of intellectual property rights',
                    'Illegal activity or solicitation',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0"></div>
                      <p className="text-muted-foreground leading-relaxed">{item}</p>
                    </li>
                  ))}
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  You may also terminate your account at any time through your account settings. Upon termination, your data will be handled according to our Privacy Policy.
                </p>
              </div>
            </div>
          </div>

          {/* Governing Law */}
          <div className="bg-card border border-border rounded-xl p-8 mb-8 shadow-sm">
            <h2 className="text-2xl font-bold text-foreground mb-4">6. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of Ethiopia. Any disputes arising from these Terms or your use of the Platform shall be subject to the exclusive jurisdiction of the courts of Ethiopia.
            </p>
          </div>

          {/* Changes to Terms */}
          <div className="bg-card border border-border rounded-xl p-8 mb-8 shadow-sm">
            <h2 className="text-2xl font-bold text-foreground mb-4">7. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms of Service from time to time. We will notify you of significant changes via email or through a notice on the Platform. Your continued use of the Platform after such changes constitutes acceptance of the updated terms.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-gradient-to-br from-brand-500/5 to-purple-600/5 border border-brand-200 dark:border-brand-800 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-foreground mb-3">Questions About Our Terms?</h3>
            <p className="text-muted-foreground mb-6">
              If you have any questions regarding these Terms of Service, please contact our legal team.
            </p>
            <a
              href="mailto:legal@aijobplatform.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium"
            >
              Contact Legal Team
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
