'use client';

import React from 'react';
import { EvaluationList } from '@/components/admin/EvaluationList';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function EvaluationsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && (!user || !['admin', 'director'].includes(user.role))) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !['admin', 'director'].includes(user.role)) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <EvaluationList />
    </div>
  );
} 