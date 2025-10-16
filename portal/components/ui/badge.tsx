'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
}

const badgeVariants = {
    default: 'bg-blue-100 text-blue-800 border-blue-200',
    secondary: 'bg-gray-100 text-gray-800 border-gray-200',
    destructive: 'bg-red-100 text-red-800 border-red-200',
    outline: 'bg-transparent text-gray-800 border-gray-300',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border',
                badgeVariants[variant],
                className
            )}
        >
            {children}
        </span>
    );
}
