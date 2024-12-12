import React from 'react';

interface EvaluationStatsProps {
  evaluationId: number;
}

interface StatisticsData {
  totalResponses: number;
  averageScores: {
    [criterion: string]: number;
  };
  completionRate: number;
}

interface CriterionScore {
  criterion: string;
  score: number;
}

export const EvaluationStats: React.FC<EvaluationStatsProps> = ({ evaluationId }) => {
  const [stats, setStats] = React.useState<StatisticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/evaluations/${evaluationId}/stats`);
        if (!response.ok) {
          throw new Error('Nepodařilo se načíst statistiky');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Nastala neočekávaná chyba');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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

  if (!stats) {
    return null;
  }

  const criteriaScores: CriterionScore[] = Object.entries(stats.averageScores).map(([criterion, score]) => ({
    criterion,
    score
  }));

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Statistiky evaluace</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">Celkem odpovědí</h3>
          <p className="text-2xl font-bold text-blue-900">{stats.totalResponses}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Míra dokončení</h3>
          <p className="text-2xl font-bold text-green-900">{(stats.completionRate * 100).toFixed(1)}%</p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Průměrné hodnocení kritérií</h3>
        <div className="space-y-4">
          {criteriaScores.map(({ criterion, score }) => (
            <div key={criterion} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{criterion}</span>
                <span className="text-lg font-semibold">{score.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${(score / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 