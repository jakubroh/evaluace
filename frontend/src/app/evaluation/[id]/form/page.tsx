'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import EvaluationForm from '@/components/evaluation/EvaluationForm';

interface EvaluationAccess {
  evaluationId: string;
  className: string;
  code: string;
}

interface TeacherSubject {
  teacherName: string;
  subjectName: string;
}

export default function EvaluationFormPage() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const classSubjectId = searchParams.get('subject');

  const [access, setAccess] = useState<EvaluationAccess | null>(null);
  const [teacherSubject, setTeacherSubject] = useState<TeacherSubject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Kontrola přístupu z session storage
    const storedAccess = sessionStorage.getItem('evaluationAccess');
    if (!storedAccess) {
      router.push('/');
      return;
    }

    const accessData = JSON.parse(storedAccess) as EvaluationAccess;
    if (accessData.evaluationId !== id) {
      router.push('/');
      return;
    }

    setAccess(accessData);
    fetchTeacherSubject(accessData.code);
  }, [id, classSubjectId]);

  const fetchTeacherSubject = async (code: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/evaluations/${id}/subjects/${classSubjectId}`,
        {
          headers: {
            'Authorization': `Bearer ${code}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Nepodařilo se načíst informace o učiteli a předmětu');
      }

      const data = await response.json();
      setTeacherSubject(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: {
    teachingQuality: number;
    comprehensibility: number;
    gradingFairness: number;
    organization: number;
    engagement: number;
    comment: string;
  }) => {
    if (!access) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/evaluations/${id}/responses`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access.code}`,
          },
          body: JSON.stringify({
            classSubjectId,
            ...values,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Nepodařilo se odeslat hodnocení');
      }

      // Přesměrování zpět na výběr učitelů
      router.push(`/evaluation/${id}`);
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Načítám formulář...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => router.push(`/evaluation/${id}`)}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Zpět na výběr učitelů
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!teacherSubject) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <EvaluationForm
          teacherName={teacherSubject.teacherName}
          subjectName={teacherSubject.subjectName}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
} 