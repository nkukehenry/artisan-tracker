'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

interface ErrorToastProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-400',
    titleColor: 'text-green-800',
    messageColor: 'text-green-700',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-400',
    titleColor: 'text-red-800',
    messageColor: 'text-red-700',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-400',
    titleColor: 'text-yellow-800',
    messageColor: 'text-yellow-700',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-400',
    titleColor: 'text-blue-800',
    messageColor: 'text-blue-700',
  },
};

export default function ErrorToast({ toast, onRemove }: ErrorToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto remove after duration
    const duration = toast.duration || 5000;
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, toast.duration, onRemove]);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg p-4 mb-3
        max-w-sm w-full
      `}
    >
      <div className="flex items-start">
        <Icon className={`h-5 w-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
        <div className="ml-3 flex-1">
          <h4 className={`text-sm font-medium ${config.titleColor}`}>
            {toast.title}
          </h4>
          <p className={`text-sm ${config.messageColor} mt-1`}>
            {toast.message}
          </p>
        </div>
        <button
          onClick={handleRemove}
          className={`ml-4 ${config.iconColor} hover:opacity-70 transition-opacity`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
