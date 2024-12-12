'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { EvaluationStats } from '@/components/admin/EvaluationStats';
import { ExportData } from '@/components/admin/ExportData';
import { ResponsesList } from '@/components/admin/ResponsesList';
import { useAuth } from '@/hooks/useAuth';

export default function EvaluationDetailPage() {
  const params = useParams();
  const evaluationId = Number(params.id);
  const { user, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading && (!user || !['admin', 'director'].includes(user.role))) {
      window.location.href = '/';
    }
  }, [user, isLoading]);

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <EvaluationStats evaluationId={evaluationId} />
        <ExportData evaluationId={evaluationId} />
      </div>
      
      <div className="mt-8">
        <ResponsesList evaluationId={evaluationId} />
      </div>
    </div>
  );
} 