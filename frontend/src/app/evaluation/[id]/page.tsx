'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TeacherSubjectSelector from '@/components/evaluation/TeacherSubjectSelector';

interface EvaluationAccess {
  evaluationId: string;
  className: string;
  code: string;
}

interface Subject {
  id: number;
  name: string;
  classSubjectId: number;
  isCompleted: boolean;
}

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  subjects: Subject[];
}

interface Evaluation {
  id: number;
  title: string;
  schoolName: string;
  className: string;
  startDate: string;
  endDate: string;
  teachers: Teacher[];
}

export default function EvaluationPage() {
  const router = useRouter();
  const { id } = useParams();
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [access, setAccess] = useState<EvaluationAccess | null>(null);

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
    fetchEvaluation(accessData.code);
  }, [id]);

  const fetchEvaluation = async (code: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/evaluations/${id}`, {
        headers: {
          'Authorization': `Bearer ${code}`,
        },
      });

      if (!response.ok) {
        throw new Error('Nepodařilo se načíst evaluaci');
      }

      const data = await response.json();
      setEvaluation(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSubjectSelect = (classSubjectId: number) => {
    // Přesměrování na formulář hodnocení s parametry
    router.push(`/evaluation/${id}/form?subject=${classSubjectId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Načítám evaluaci...</p>
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
                onClick={() => router.push('/')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Zpět na hlavní stránku
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                {evaluation.title}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {evaluation.schoolName}
              </p>
            </div>
            
            <div className="mb-8">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">
                  Třída: <span className="font-medium text-gray-900">{evaluation.className}</span>
                </p>
              </div>
            </div>

            <TeacherSubjectSelector
              teachers={evaluation.teachers}
              onSelect={handleTeacherSubjectSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 