'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  // Redirect to root page since dashboard is now the default
  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null;
}
