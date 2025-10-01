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
  online: { bg: 'bg-green-100', text: 'text-green-800' },
  'in transit': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  offline: { bg: 'bg-red-100', text: 'text-red-800' },
  active: { bg: 'bg-green-100', text: 'text-green-800' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-800' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  error: { bg: 'bg-red-100', text: 'text-red-800' },
  warning: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
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
