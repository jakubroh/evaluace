'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AccessCodeForm() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/access-codes/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Něco se pokazilo');
      }

      const data = await response.json();
      
      // Uložíme data do session storage pro použití v evaluaci
      sessionStorage.setItem('evaluationAccess', JSON.stringify({
        evaluationId: data.evaluationId,
        className: data.className,
        code
      }));

      // Přesměrujeme na stránku s evaluací
      router.push(`/evaluation/${data.evaluationId}`);
    } catch (err: any) {
      setError(err.message || 'Nepodařilo se ověřit kód');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700">
          Přístupový kód
        </label>
        <div className="mt-1">
          <input
            id="code"
            name="code"
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Zadejte 6místný kód"
            maxLength={6}
            pattern="[A-Z0-9]{6}"
            disabled={isLoading}
          />
        </div>
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

      <div>
        <button
          type="submit"
          disabled={isLoading || code.length !== 6}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Ověřuji...' : 'Pokračovat'}
        </button>
      </div>
    </form>
  );
} 