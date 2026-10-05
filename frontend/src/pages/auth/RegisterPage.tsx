import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Lock, Building2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const schema = z.object({
  firstName: z.string().min(2, 'Min 2 characters'),
  lastName: z.string().min(2, 'Min 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Min 8 characters'),
  role: z.enum(['jobseeker', 'employer']),
  companyName: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const defaultRole = (searchParams.get('role') || 'jobseeker') as 'jobseeker' | 'employer';
  const { register: registerUser, isRegistering } = useAuth();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: defaultRole },
  });

  const role = watch('role');
  const onSubmit = (data: FormData) => registerUser(data);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-background to-purple-50 dark:from-brand-950/20 dark:via-background dark:to-purple-950/20 px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-base">AI</span>
            </div>
            <span className="font-bold text-xl text-foreground">Job Platform</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-6">Create your account</h1>
          <p className="text-muted-foreground mt-1 text-sm">Start your journey today — free forever</p>
        </div>

        <div className="card p-8 shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg mb-2">
              {(['jobseeker', 'employer'] as const).map((r) => (
                <label key={r} className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium cursor-pointer transition-all ${role === r ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  <input type="radio" {...register('role')} value={r} className="hidden" />
                  {r === 'jobseeker' ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                  {r === 'jobseeker' ? 'Job Seeker' : 'Employer'}
                </label>
              ))}
            </div>

            {/* Names */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input {...register('firstName')} placeholder="First name" className="input-field" />
                {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <input {...register('lastName')} placeholder="Last name" className="input-field" />
                {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            {/* Company name (employer only) */}
            {role === 'employer' && (
              <div>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input {...register('companyName')} placeholder="Company name" className="input-field pl-10" />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input {...register('email')} type="email" placeholder="Email address" className="input-field pl-10" />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Password (min 8 chars)" className="input-field pl-10 pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isRegistering} className="btn-primary w-full py-3 text-base">
              {isRegistering ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="text-xs text-muted-foreground text-center">
              By signing up you agree to our{' '}
              <Link to="/terms" className="text-primary hover:underline">Terms</Link> and{' '}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
