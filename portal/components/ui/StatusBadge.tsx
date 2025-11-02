'use client';

export interface StatusBadgeProps {
  status?: string;
  variant?: 'default' | 'custom';
  customColors?: {
    bg: string;
    text: string;
  };
  className?: string;
}

const defaultStatusColors: Record<string, { bg: string; text: string }> = {
  online: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' },
  'in transit': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300' },
  offline: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300' },
  active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' },
  inactive: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-300' },
  pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300' },
  error: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300' },
  warning: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300' },
};

export default function StatusBadge({
  status,
  variant = 'default',
  customColors,
  className = '',
}: StatusBadgeProps) {
  const safeStatus = status || 'unknown';
  const colors = variant === 'custom' && customColors
    ? customColors
    : defaultStatusColors[safeStatus.toLowerCase()] || defaultStatusColors.inactive;

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors.bg} ${colors.text} ${className}`}>
      {safeStatus}
    </span>
  );
}
