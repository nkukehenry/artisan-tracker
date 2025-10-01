'use client';

import { LucideIcon } from 'lucide-react';

export interface ActionButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  title?: string;
  disabled?: boolean;
  className?: string;
}

const variantStyles = {
  primary: 'text-blue-600 hover:text-blue-900 hover:bg-blue-50',
  secondary: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
  danger: 'text-red-600 hover:text-red-900 hover:bg-red-50',
  warning: 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50',
  info: 'text-blue-600 hover:text-blue-900 hover:bg-blue-50',
};

const sizeStyles = {
  sm: 'h-3 w-3 p-1',
  md: 'h-4 w-4 p-1',
  lg: 'h-5 w-5 p-2',
};

export default function ActionButton({
  icon: Icon,
  onClick,
  variant = 'secondary',
  size = 'md',
  title,
  disabled = false,
  className = '',
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        rounded transition-colors
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <Icon className="h-full w-full" />
    </button>
  );
}
