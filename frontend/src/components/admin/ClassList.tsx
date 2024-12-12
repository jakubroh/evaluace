import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface Class {
  id: number;
  name: string;
  schoolName: string;
  directorEmail: string;
}

interface ClassListProps {
  onEdit: (classId: number) => void;
  onDelete: (classId: number) => void;
  onAssign: (classId: number) => void;
}

export default function ClassList({ onEdit, onDelete, onAssign }: ClassListProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { token, user } = useAuth();

  useEffect(() => {
    fetchClasses();
  }, [token]);

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/classes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Nepodařilo se načíst seznam tříd');
      }

      const data = await response.json();
      setClasses(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 my-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {classes.map((cls) => (
          <li key={cls.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-indigo-600 truncate">
                    {cls.name}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Škola: {cls.schoolName}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Ředitel: {cls.directorEmail}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onAssign(cls.id)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Přiřadit učitele
                  </button>
                  <button
                    onClick={() => onEdit(cls.id)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Upravit
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => onDelete(cls.id)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Smazat
                    </button>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 