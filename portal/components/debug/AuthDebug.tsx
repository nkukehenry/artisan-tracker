'use client';

import { useAppSelector } from '@/lib/hooks';

export default function AuthDebug() {
  const authState = useAppSelector((state) => state.auth);
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono max-w-sm">
      <div className="font-bold mb-2">Auth Debug</div>
      <div>isAuthenticated: {authState.isAuthenticated ? 'true' : 'false'}</div>
      <div>isLoading: {authState.isLoading ? 'true' : 'false'}</div>
      <div>user: {authState.user ? `${authState.user.firstName} ${authState.user.lastName}` : 'null'}</div>
      <div>accessToken: {authState.accessToken ? 'exists' : 'null'}</div>
      <div>refreshToken: {authState.refreshToken ? 'exists' : 'null'}</div>
      <div>error: {authState.error || 'none'}</div>
      <div className="mt-2">
        localStorage tokens: {typeof window !== 'undefined' ? 
          (localStorage.getItem('accessToken') ? 'exists' : 'null') : 'SSR'
        }
      </div>
      <div>
        Token timestamp: {typeof window !== 'undefined' ? 
          (localStorage.getItem('tokenTimestamp') || 'none') : 'SSR'
        }
      </div>
      <div>
        Token age: {typeof window !== 'undefined' && localStorage.getItem('tokenTimestamp') ? 
          `${Math.round((Date.now() - parseInt(localStorage.getItem('tokenTimestamp')!)) / 1000 / 60)} min` : 'N/A'
        }
      </div>
    </div>
  );
}
