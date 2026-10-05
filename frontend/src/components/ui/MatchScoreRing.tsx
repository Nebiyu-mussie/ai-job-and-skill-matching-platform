import { motion } from 'framer-motion';
import { cn, getMatchScoreColor } from '@/lib/utils';

interface MatchScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  animated?: boolean;
}

export default function MatchScoreRing({
  score,
  size = 'md',
  showLabel = true,
  className,
  animated = true,
}: MatchScoreRingProps) {
  const sizes = {
    sm: { container: 48, strokeWidth: 3, fontSize: 'text-xs' },
    md: { container: 64, strokeWidth: 4, fontSize: 'text-sm' },
    lg: { container: 96, strokeWidth: 5, fontSize: 'text-base' },
  };

  const { container, strokeWidth, fontSize } = sizes[size];
  const radius = (container - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - score) / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={container}
        height={container}
        className="-rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={container / 2}
          cy={container / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        {/* Progress circle */}
        <motion.circle
          cx={container / 2}
          cy={container / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={animated ? { strokeDashoffset: circumference } : { strokeDashoffset: progress }}
          animate={{ strokeDashoffset: progress }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>

      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={cn('font-bold', fontSize, getMatchScoreColor(score))}
            initial={animated ? { opacity: 0 } : { opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}%
          </motion.span>
        </div>
      )}
    </div>
  );
}
