import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPassword(email);
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-background to-purple-50 dark:from-brand-950/20 dark:via-background dark:to-purple-950/20 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-base">AI</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Forgot your password?</h1>
          <p className="text-muted-foreground mt-2 text-sm">Enter your email and we'll send a reset link.</p>
        </div>

        <div className="card p-8 shadow-xl">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Check your inbox</h3>
              <p className="text-sm text-muted-foreground">If an account exists for {email}, you'll receive a reset link shortly.</p>
              <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-primary text-sm hover:underline">
                <ArrowLeft className="w-4 h-4" /> Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full py-3">Send Reset Link</button>
              <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" /> Back to login
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
