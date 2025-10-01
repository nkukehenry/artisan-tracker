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
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-blue-900/20 backdrop-blur-md ${className}`}>
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl p-6 flex flex-col items-center space-y-4 min-w-[200px] border border-white/20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
}
