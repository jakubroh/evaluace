import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ClassFormProps {
  classId?: number;
  onSubmit: (data: ClassFormData) => void;
  onCancel: () => void;
}

interface ClassFormData {
  name: string;
  schoolName: string;
  directorEmail: string;
}

export default function ClassForm({ classId, onSubmit, onCancel }: ClassFormProps) {
  const [formData, setFormData] = useState<ClassFormData>({
    name: '',
    schoolName: '',
    directorEmail: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (classId) {
      fetchClassData();
    }
  }, [classId]);

  const fetchClassData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/classes/${classId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Nepodařilo se načíst data třídy');
      }

      const data = await response.json();
      setFormData(data);
    } catch (error) {
      console.error('Chyba při načítání dat třídy:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Název třídy
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700">
          Název školy
        </label>
        <input
          type="text"
          name="schoolName"
          id="schoolName"
          value={formData.schoolName}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="directorEmail" className="block text-sm font-medium text-gray-700">
          Email ředitele
        </label>
        <input
          type="email"
          name="directorEmail"
          id="directorEmail"
          value={formData.directorEmail}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Zrušit
        </button>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {classId ? 'Uložit změny' : 'Vytvořit třídu'}
        </button>
      </div>
    </form>
  );
} 