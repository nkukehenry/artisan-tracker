'use client';

import { Loader2 } from 'lucide-react';

interface LoaderOverlayProps {
  isLoading: boolean;
  message?: string;
  className?: string;
}

export default function LoaderOverlay({
  isLoading,
  message = 'Loading...',
  className = ''
}: LoaderOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-blue-900/20 dark:bg-black/50 backdrop-blur-md ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col items-center space-y-4 min-w-[200px] border border-gray-200 dark:border-gray-700">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="text-gray-700 dark:text-gray-300 font-medium">{message}</p>
      </div>
    </div>
  );
}
