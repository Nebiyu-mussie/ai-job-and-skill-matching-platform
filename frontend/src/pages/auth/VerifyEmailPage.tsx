import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) return setStatus('error');
    api.get(`/auth/verify-email/${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-foreground font-medium">Verifying your email...</p>
          </div>
        )}
        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle className="w-16 h-16 text-emerald-500" />
            <h1 className="text-2xl font-bold text-foreground">Email Verified!</h1>
            <p className="text-muted-foreground">Your email has been verified successfully.</p>
            <Link to="/login" className="btn-primary px-8 py-3">Sign In Now</Link>
          </div>
        )}
        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <XCircle className="w-16 h-16 text-destructive" />
            <h1 className="text-2xl font-bold text-foreground">Verification Failed</h1>
            <p className="text-muted-foreground">The link is invalid or has expired.</p>
            <Link to="/login" className="btn-secondary px-8 py-3">Back to Login</Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
