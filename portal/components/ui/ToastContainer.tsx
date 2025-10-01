'use client';

import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { removeToast } from '@/store/slices/appSlice';
import ErrorToast, { ToastMessage } from './ErrorToast';

interface ToastContainerProps {
  className?: string;
}

export default function ToastContainer({ className = '' }: ToastContainerProps) {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((state) => state.app.toasts);

  const handleRemoveToast = useCallback((id: string) => {
    dispatch(removeToast(id));
  }, [dispatch]);

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      {toasts.map((toast: ToastMessage) => (
        <ErrorToast
          key={toast.id}
          toast={toast}
          onRemove={handleRemoveToast}
        />
      ))}
    </div>
  );
}
