import React from 'react';

interface ExportDataProps {
  evaluationId: number;
}

export const ExportData: React.FC<ExportDataProps> = ({ evaluationId }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleExportCSV = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/evaluations/${evaluationId}/export/csv`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Nepodařilo se exportovat data');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evaluace-${evaluationId}-export.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nastala neočekávaná chyba');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/evaluations/${evaluationId}/export/pdf`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Nepodařilo se exportovat data');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evaluace-${evaluationId}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nastala neočekávaná chyba');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Export dat</h2>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="space-y-4">
        <button
          onClick={handleExportCSV}
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            'Exportovat do CSV'
          )}
        </button>
        
        <button
          onClick={handleExportPDF}
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            'Exportovat do PDF'
          )}
        </button>
      </div>
    </div>
  );
}; 