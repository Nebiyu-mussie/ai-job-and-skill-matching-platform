import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format, isValid } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | undefined, formatStr = 'MMM d, yyyy'): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(d)) return 'Invalid date';
  return format(d, formatStr);
}

export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(d)) return '';
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatSalary(
  min?: number,
  max?: number,
  currency = 'ETB',
  period = 'monthly'
): string {
  if (!min && !max) return 'Negotiable';
  const fmt = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return n.toString();
  };
  const range =
    min && max
      ? `${currency} ${fmt(min)} - ${fmt(max)}`
      : min
      ? `From ${currency} ${fmt(min)}`
      : `Up to ${currency} ${fmt(max!)}`;
  return `${range}/${period === 'monthly' ? 'mo' : period === 'annual' ? 'yr' : 'hr'}`;
}

export function getMatchScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-amber-600 dark:text-amber-400';
  if (score >= 40) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

export function getMatchScoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-100 dark:bg-emerald-900/30';
  if (score >= 60) return 'bg-amber-100 dark:bg-amber-900/30';
  if (score >= 40) return 'bg-orange-100 dark:bg-orange-900/30';
  return 'bg-red-100 dark:bg-red-900/30';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    reviewing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    shortlisted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    interviewed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    offered: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    hired: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    withdrawn: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    closed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    paused: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export const JOB_TYPES = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'temporary', label: 'Temporary' },
];

export const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level (0-1 years)' },
  { value: 'junior', label: 'Junior (1-3 years)' },
  { value: 'mid', label: 'Mid Level (3-5 years)' },
  { value: 'senior', label: 'Senior (5-8 years)' },
  { value: 'lead', label: 'Lead/Principal (8+ years)' },
  { value: 'director', label: 'Director' },
  { value: 'executive', label: 'Executive/C-Suite' },
];

export const ETHIOPIAN_CITIES = [
  'Addis Ababa', 'Dire Dawa', 'Mekelle', 'Gondar', 'Hawassa',
  'Bahir Dar', 'Dessie', 'Jimma', 'Jijiga', 'Shashamane',
  'Bishoftu', 'Adama', 'Harar', 'Nekemte', 'Asella',
  'Debre Birhan', 'Debre Markos', 'Shire', 'Axum', 'Arba Minch',
];

export const JOB_CATEGORIES = [
  'Technology & IT', 'Finance & Accounting', 'Marketing & Sales',
  'Healthcare & Medical', 'Education & Training', 'Engineering',
  'Human Resources', 'Legal & Compliance', 'Operations & Logistics',
  'Customer Service', 'Agriculture', 'Manufacturing',
  'Construction & Real Estate', 'Media & Creative Arts',
  'Government & NGO', 'Hospitality & Tourism', 'Other',
];
