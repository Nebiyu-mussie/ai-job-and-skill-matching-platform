import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  text?: string;
  className?: string;
}

export default function LoadingSpinner({
  size = 'md',
  fullScreen = false,
  text,
  className,
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const spinner = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className="relative">
        <div
          className={cn(
            'rounded-full border-2 border-primary/20',
            sizes[size]
          )}
        />
        <div
          className={cn(
            'absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin',
            sizes[size]
          )}
        />
      </div>
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">AI</span>
            </div>
            {spinner}
          </div>
        </motion.div>
      </div>
    );
  }

  return spinner;
}
