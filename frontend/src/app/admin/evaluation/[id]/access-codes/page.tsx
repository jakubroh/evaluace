'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AccessCodeGenerator from '@/components/admin/AccessCodeGenerator';
import AccessCodeList from '@/components/admin/AccessCodeList';
import { useAuth } from '@/hooks/useAuth';

export default function AccessCodesPage() {
  const { id: evaluationId } = useParams();
  const { user, token } = useAuth();
  const [codes, setCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCodes();
  }, [evaluationId, token]);

  const fetchCodes = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/access-codes/evaluation/${evaluationId}/codes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Nepodařilo se načíst přístupové kódy');
      }

      const data = await response.json();
      setCodes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodesGenerated = (newCodes: any[]) => {
    setCodes((prevCodes) => [...newCodes, ...prevCodes]);
  };

  const handleCodeDeleted = (codeId: number) => {
    setCodes((prevCodes) => prevCodes.filter((code: any) => code.id !== codeId));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Načítám přístupové kódy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="border-b border-gray-200 pb-5 mb-5">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Přístupové kódy pro evaluaci
          </h2>
          <p className="mt-2 max-w-4xl text-sm text-gray-500">
            Zde můžete generovat a spravovat přístupové kódy pro jednotlivé třídy
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <AccessCodeGenerator
            evaluationId={evaluationId as string}
            onCodesGenerated={handleCodesGenerated}
          />

          <AccessCodeList
            codes={codes}
            onCodeDeleted={handleCodeDeleted}
          />
        </div>
      </div>
    </div>
  );
} 