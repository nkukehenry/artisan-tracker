'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { addToast } from '@/store/slices/appSlice';
import { initializeAuth } from '@/store/slices/authSlice';
import LoaderOverlay from '@/components/ui/LoaderOverlay';
import ToastContainer from '@/components/ui/ToastContainer';

interface AppProviderProps {
  children: React.ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  const dispatch = useAppDispatch();
  const { isLoading, loadingMessage } = useAppSelector((state) => state.app);
  const { isLoading: authLoading, error: authError, isAuthenticated } = useAppSelector((state) => state.auth);

  // Initialize authentication on app start (only if not already initialized)
  useEffect(() => {
    // Only initialize if we haven't already tried to authenticate
    if (!authLoading && !isAuthenticated && !authError) {
      dispatch(initializeAuth());
    }
  }, [dispatch, authLoading, isAuthenticated, authError]);

  // Don't show global loading for authentication - let AuthWrapper handle it

  // Handle auth errors with toasts
  useEffect(() => {
    if (authError) {
      dispatch(addToast({
        type: 'error',
        title: 'Authentication Error',
        message: authError,
      }));
    }
  }, [authError, dispatch]);

  return (
    <>
      {children}
      <LoaderOverlay isLoading={isLoading} message={loadingMessage} />
      <ToastContainer />
    </>
  );
}
