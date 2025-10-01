'use client';

export interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  color?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const colorStyles = {
  default: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
};

export default function ProgressBar({
  value,
  max = 100,
  size = 'md',
  showLabel = true,
  label,
  color = 'default',
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  // Auto-determine color based on value if using default
  const actualColor = color === 'default' 
    ? (value > 50 ? 'success' : value > 20 ? 'warning' : 'danger')
    : color;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
          {label || `${value}%`}
        </span>
      )}
      <div className={`flex-1 bg-gray-200 rounded-full ${sizeStyles[size]}`}>
        <div
          className={`${sizeStyles[size]} rounded-full transition-all duration-300 ${colorStyles[actualColor]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
