import { motion } from 'framer-motion';
import { Bell, Star, Briefcase, AlertCircle } from 'lucide-react';

export default function NotificationsPage() {
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
              <Bell className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Notifications</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stay updated on applications, matches, and important updates
            </p>
          </div>

          {/* Coming Soon */}
          <div className="bg-card border border-border rounded-xl p-12 shadow-sm max-w-2xl mx-auto">
            <div className="space-y-6">
              <div className="flex justify-center gap-8 mb-6">
                <div className="w-12 h-12 rounded-lg bg-brand-500/10 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-brand-500" />
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Star className="w-6 h-6 text-purple-500" />
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Coming Soon</h2>
              <p className="text-muted-foreground">
                We're developing a smart notification system to keep you informed about 
                job matches, application updates, and important activities. Stay tuned!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}