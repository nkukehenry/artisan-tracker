'use client';

import { useState, useCallback } from 'react';
import ErrorToast, { ToastMessage } from './ErrorToast';

interface ToastContainerProps {
  className?: string;
}

export default function ToastContainer({ className = '' }: ToastContainerProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = {
      ...toast,
      id,
    };
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Expose addToast globally
  if (typeof window !== 'undefined') {
    (window as any).addToast = addToast;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      {toasts.map(toast => (
        <ErrorToast
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </div>
  );
}
