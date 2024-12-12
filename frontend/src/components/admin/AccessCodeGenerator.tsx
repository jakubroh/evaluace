'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  evaluationId: string;
  onCodesGenerated: (codes: any[]) => void;
}

export default function AccessCodeGenerator({ evaluationId, onCodesGenerated }: Props) {
  const { token } = useAuth();
  const [classes, setClasses] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const addClass = () => {
    setClasses([...classes, '']);
  };

  const removeClass = (index: number) => {
    setClasses(classes.filter((_, i) => i !== index));
  };

  const updateClass = (index: number, value: string) => {
    const newClasses = [...classes];
    newClasses[index] = value;
    setClasses(newClasses);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const filteredClasses = classes.filter(c => c.trim() !== '');
      
      if (filteredClasses.length === 0) {
        throw new Error('Zadejte alespoň jednu třídu');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/access-codes/evaluation/${evaluationId}/codes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ classes: filteredClasses }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Nepodařilo se vygenerovat kódy');
      }

      const newCodes = await response.json();
      onCodesGenerated(newCodes);
      setClasses(['']);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Generování nových kódů
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Zadejte názvy tříd, pro které chcete vygenerovat přístupové kódy
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {classes.map((className, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={className}
                onChange={(e) => updateClass(index, e.target.value)}
                placeholder="Např. 4.A"
                className="flex-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
              {classes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeClass(index)}
                  className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Odebrat
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={addClass}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Přidat další třídu
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generuji...' : 'Vygenerovat kódy'}
          </button>
        </div>
      </div>
    </form>
  );
} 