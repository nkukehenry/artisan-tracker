'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { setLoading } from '@/store/slices/appSlice';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Mark as initialized after first render
    setHasInitialized(true);
  }, []);

  // Handle routing logic
  useEffect(() => {
    if (!hasInitialized || isLoading) return;

    if (isAuthenticated) {
      // If authenticated and on login/register, redirect to dashboard
      if (pathname === '/login' || pathname === '/register') {
        router.replace('/');
      }
    } else {
      // If not authenticated and not on login/register, redirect to login
      if (pathname !== '/login' && pathname !== '/register') {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, pathname, hasInitialized, router]);

  // Show global loading overlay during authentication or initialization
  useEffect(() => {
    if (!hasInitialized || isLoading) {
      dispatch(setLoading({ isLoading: true, message: 'Loading...' }));
    } else {
      dispatch(setLoading({ isLoading: false }));
    }
  }, [hasInitialized, isLoading, dispatch]);

  // Render children if we're in the correct state
  return <>{children}</>;
}
