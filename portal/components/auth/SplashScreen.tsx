'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/lib/hooks';

interface SplashScreenProps {
  disableRedirects?: boolean;
}

export default function SplashScreen({ disableRedirects = false }: SplashScreenProps) {
  const { isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('🎯 SplashScreen redirect logic:', {
      isLoading,
      isAuthenticated,
      pathname,
      error,
      disableRedirects
    });

    // Skip redirects if disabled (e.g., when used as loading screen by AuthGuard)
    if (disableRedirects) {
      console.log('🚫 Redirects disabled, not performing any redirects');
      return;
    }

    // Only redirect if we're not already on the correct page AND not loading
    if (!isLoading) {
      if (isAuthenticated) {
        // If authenticated, redirect to root (dashboard) only if not already there
        if (pathname !== '/') {
          console.log('🔄 Redirecting authenticated user to root (dashboard)');
          router.push('/');
        } else {
          console.log('✅ User is authenticated and on correct page');
        }
      } else {
        // If not authenticated, redirect to login only if not already there
        if (pathname !== '/login') {
          console.log('🔄 Redirecting unauthenticated user to login');
          router.push('/login');
        } else {
          console.log('✅ User is not authenticated and on correct page');
        }
      }
    } else {
      console.log('⏳ Still loading, not redirecting yet');
    }
  }, [isAuthenticated, isLoading, router, pathname, error, disableRedirects]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden bg-white/10 dark:bg-white/5 backdrop-blur-sm">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={64}
              height={64}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">ProjectEast</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Mobile tracking dashboard</p>

        {/* Loading Spinner */}
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>

        {/* Loading Text */}
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {isLoading ? 'Checking authentication...' : 'Redirecting...'}
        </p>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg max-w-sm mx-auto">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
