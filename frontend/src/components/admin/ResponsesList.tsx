import React from 'react';

interface ResponsesListProps {
  evaluationId: number;
}

interface EvaluationResponse {
  id: number;
  teacherId: number;
  teacherName: string;
  subjectId: number;
  subjectName: string;
  classId: number;
  className: string;
  createdAt: string;
  scores: {
    preparation: number;
    explanation: number;
    engagement: number;
    atmosphere: number;
    individual: number;
  };
  comment?: string;
}

export const ResponsesList: React.FC<ResponsesListProps> = ({ evaluationId }) => {
  const [responses, setResponses] = React.useState<EvaluationResponse[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchResponses = async () => {
      try {
        const response = await fetch(`/api/evaluations/${evaluationId}/responses`);
        if (!response.ok) {
          throw new Error('Nepodařilo se načíst odpovědi');
        }
        const data = await response.json();
        setResponses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Nastala neočekávaná chyba');
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [evaluationId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Odpovědi ({responses.length})</h2>
      
      <div className="space-y-6">
        {responses.map((response) => (
          <div key={response.id} className="border rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-500">Učitel</span>
                <p className="font-medium">{response.teacherName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Předmět</span>
                <p className="font-medium">{response.subjectName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Třída</span>
                <p className="font-medium">{response.className}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              {Object.entries(response.scores).map(([criterion, score]) => (
                <div key={criterion}>
                  <span className="text-sm text-gray-500">{criterion}</span>
                  <p className="font-medium">{score}</p>
                </div>
              ))}
            </div>
            
            {response.comment && (
              <div className="mt-4">
                <span className="text-sm text-gray-500">Komentář</span>
                <p className="mt-1">{response.comment}</p>
              </div>
            )}
            
            <div className="mt-4 text-sm text-gray-500">
              Vytvořeno: {new Date(response.createdAt).toLocaleString('cs-CZ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 