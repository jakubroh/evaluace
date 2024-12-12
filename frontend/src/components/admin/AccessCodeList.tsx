'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AccessCode {
  id: number;
  code: string;
  class_name: string;
  is_used: boolean;
  created_at: string;
}

interface Props {
  codes: AccessCode[];
  onCodeDeleted: (id: number) => void;
}

export default function AccessCodeList({ codes, onCodeDeleted }: Props) {
  const { token } = useAuth();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleDelete = async (id: number) => {
    setError('');
    setDeletingId(id);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/access-codes/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Nepodařilo se smazat kód');
      }

      onCodeDeleted(id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (codes.length === 0) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6">
        <div className="text-center text-gray-500">
          Zatím nebyly vygenerovány žádné přístupové kódy
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Seznam přístupových kódů
        </h3>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Třída
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kód
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stav
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vytvořeno
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Akce</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {codes.map((code) => (
                      <tr key={code.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {code.class_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                          {code.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            code.is_used
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {code.is_used ? 'Použitý' : 'Aktivní'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(code.created_at).toLocaleString('cs')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDelete(code.id)}
                            disabled={deletingId === code.id}
                            className="text-red-600 hover:text-red-900 disabled:text-red-400 disabled:cursor-not-allowed"
                          >
                            {deletingId === code.id ? 'Mažu...' : 'Smazat'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 