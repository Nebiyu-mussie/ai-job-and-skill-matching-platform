import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const schema = z.object({
  password: z.string().min(8, 'Min 8 characters'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });
type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const { resetPassword } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    if (token) resetPassword({ token, password: data.password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-background to-purple-50 dark:from-brand-950/20 dark:via-background dark:to-purple-950/20 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="card p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-foreground mb-2">Set new password</h1>
          <p className="text-muted-foreground text-sm mb-6">Choose a strong password for your account.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input {...register('password')} type="password" placeholder="New password" className="input-field pl-10" />
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input {...register('confirm')} type="password" placeholder="Confirm password" className="input-field pl-10" />
              </div>
              {errors.confirm && <p className="text-xs text-destructive mt-1">{errors.confirm.message}</p>}
            </div>
            <button type="submit" className="btn-primary w-full py-3">Reset Password</button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
