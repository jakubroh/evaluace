import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Modal } from '../common/Modal';
import { EvaluationForm } from './EvaluationForm';

interface Evaluation {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export const EvaluationList: React.FC = () => {
  const { token } = useAuth();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvaluations = async () => {
    try {
      const response = await fetch('/api/evaluations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Nepodařilo se načíst evaluace');
      }

      const data = await response.json();
      setEvaluations(data);
    } catch (error) {
      setError('Chyba při načítání evaluací');
      console.error('Chyba:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, [token]);

  const handleCreateClick = () => {
    setSelectedEvaluation(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (!confirm('Opravdu chcete smazat tuto evaluaci?')) {
      return;
    }

    try {
      const response = await fetch(`/api/evaluations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Nepodařilo se smazat evaluaci');
      }

      setEvaluations(evaluations.filter(e => e.id !== id));
    } catch (error) {
      setError('Chyba při mazání evaluace');
      console.error('Chyba:', error);
    }
  };

  const handleSubmit = async (data: Omit<Evaluation, 'id'>) => {
    try {
      const url = selectedEvaluation
        ? `/api/evaluations/${selectedEvaluation.id}`
        : '/api/evaluations';
      
      const method = selectedEvaluation ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Nepodařilo se uložit evaluaci');
      }

      const savedEvaluation = await response.json();

      if (selectedEvaluation) {
        setEvaluations(evaluations.map(e => 
          e.id === selectedEvaluation.id ? savedEvaluation : e
        ));
      } else {
        setEvaluations([...evaluations, savedEvaluation]);
      }

      setIsModalOpen(false);
    } catch (error) {
      setError('Chyba při ukládání evaluace');
      console.error('Chyba:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Evaluace</h2>
        <button
          onClick={handleCreateClick}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Vytvořit evaluaci
        </button>
      </div>

      <div className="grid gap-4">
        {evaluations.map(evaluation => (
          <div
            key={evaluation.id}
            className="bg-white p-4 rounded shadow-sm border flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold">{evaluation.name}</h3>
              <p className="text-sm text-gray-600">
                {new Date(evaluation.startDate).toLocaleDateString()} - {new Date(evaluation.endDate).toLocaleDateString()}
              </p>
              <span className={`text-sm ${evaluation.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {evaluation.isActive ? 'Aktivní' : 'Neaktivní'}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEditClick(evaluation)}
                className="text-blue-600 hover:text-blue-800"
              >
                Upravit
              </button>
              <button
                onClick={() => handleDeleteClick(evaluation.id)}
                className="text-red-600 hover:text-red-800"
              >
                Smazat
              </button>
            </div>
          </div>
        ))}

        {evaluations.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            Zatím nebyly vytvořeny žádné evaluace
          </p>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedEvaluation ? 'Upravit evaluaci' : 'Vytvořit evaluaci'}
      >
        <EvaluationForm
          evaluation={selectedEvaluation}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}; 