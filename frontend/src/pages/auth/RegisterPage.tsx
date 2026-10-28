import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Lock, Building2, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import api, { getErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  firstName: z
    .string()
    .min(2, 'Min 2 characters')
    .max(50, 'Max 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name must contain only letters, spaces, hyphens, or apostrophes'),
  lastName: z
    .string()
    .min(2, 'Min 2 characters')
    .max(50, 'Max 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name must contain only letters, spaces, hyphens, or apostrophes'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Min 8 characters'),
  role: z.enum(['jobseeker', 'employer']),
  companyName: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

type Step = 'form' | 'otp';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [searchParams] = useSearchParams();
  const defaultRole = (searchParams.get('role') || 'jobseeker') as 'jobseeker' | 'employer';
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: defaultRole },
  });

  const role = watch('role');
  
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/register', data);
      const responseData = res.data.data;
      
      // Registration successful, move to OTP step
      setRegisteredEmail(responseData.email || data.email);
      setStep('otp');
      toast.success('OTP sent to your email');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) value = value.charAt(value.length - 1);
    if (!/^\d*$/.test(value)) return; // Only numbers
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) {
      toast.error('Please paste a valid 6-digit code');
      return;
    }
    const digits = pastedData.split('');
    setOtp(digits);
    // Focus last input
    const lastInput = document.getElementById('otp-5');
    lastInput?.focus();
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await api.post('/auth/verify-otp', {
        email: registeredEmail,
        otp: otpCode,
      });
      const data = res.data.data;
      
      // Save auth state
      setAuth(data.user, data.accessToken);
      toast.success('Email verified successfully!');
      
      // Redirect based on role
      const userRole = data.user.role;
      if (userRole === 'employer') navigate('/employer/dashboard');
      else navigate('/dashboard');
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast.error(getErrorMessage(error));
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-foreground mt-6">
            {step === 'form' ? 'Create your account' : 'Verify your email'}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {step === 'form' 
              ? 'Start your journey today — free forever' 
              : `Enter the 6-digit code sent to ${registeredEmail}`
            }
          </p>
        </div>

        <div className="card p-8 shadow-xl">
          {step === 'form' ? (
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
                  <input 
                    {...register('firstName')} 
                    placeholder="First name" 
                    className="input-field"
                    pattern="[a-zA-Z\s'\-]+"
                    title="First name must contain only letters, spaces, hyphens, or apostrophes"
                  />
                  {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <input 
                    {...register('lastName')} 
                    placeholder="Last name" 
                    className="input-field"
                    pattern="[a-zA-Z\s'\-]+"
                    title="Last name must contain only letters, spaces, hyphens, or apostrophes"
                  />
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

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-base">
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>

              <p className="text-xs text-muted-foreground text-center">
                By signing up you agree to our{' '}
                <Link to="/terms" className="text-primary hover:underline">Terms</Link> and{' '}
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </form>
          ) : (
            <div className="space-y-6">
              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3 text-center">
                  Verification Code
                </label>
                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Code expires in 10 minutes
                </p>
              </div>

              <button 
                onClick={handleVerifyOtp} 
                disabled={isVerifying || otp.join('').length !== 6}
                className="btn-primary w-full py-3 text-base"
              >
                {isVerifying ? 'Verifying...' : 'Verify Email'}
              </button>

              <button
                onClick={() => setStep('form')}
                className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to registration
              </button>
            </div>
          )}

          {step === 'form' && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
