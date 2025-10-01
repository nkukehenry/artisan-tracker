'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { setLoading, addToast } from '@/store/slices/appSlice';
import { initializeAuth, loginUser, registerUser, logoutUser } from '@/store/slices/authSlice';
import LoaderOverlay from '@/components/ui/LoaderOverlay';
import ToastContainer from '@/components/ui/ToastContainer';

interface AppProviderProps {
  children: React.ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  const dispatch = useAppDispatch();
  const { isLoading, loadingMessage } = useAppSelector((state) => state.app);
  const { isLoading: authLoading, user, error: authError } = useAppSelector((state) => state.auth);

  // Initialize authentication on app start
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Update global loading state based on auth loading
  useEffect(() => {
    if (authLoading) {
      dispatch(setLoading({ isLoading: true, message: 'Authenticating...' }));
    } else {
      dispatch(setLoading({ isLoading: false }));
    }
  }, [authLoading, dispatch]);

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
