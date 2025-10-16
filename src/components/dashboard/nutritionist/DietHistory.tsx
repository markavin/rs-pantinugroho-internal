import React from 'react';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface DietHistoryProps {
  patientId: string;
  visitationHistory: any[];
}

const PatientDietHistory: React.FC<DietHistoryProps> = ({ patientId, visitationHistory }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Riwayat Kepatuhan Diet</h3>
      
      <div className="space-y-3">
        {visitationHistory.map((visit, index) => (
          <div key={visit.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {new Date(visit.visitDate).toLocaleDateString('id-ID')}
                </span>
                <span className="text-xs text-gray-500">{visit.shift}</span>
              </div>
              
              {visit.dietCompliance && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  visit.dietCompliance >= 80 ? 'bg-green-100 text-green-700' :
                  visit.dietCompliance >= 60 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {visit.dietCompliance}% Kepatuhan
                </span>
              )}
            </div>
            
            {visit.dietIssues && (
              <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800">
                <strong>Catatan:</strong> {visit.dietIssues}
              </div>
            )}
            
            <div className="mt-2 text-sm text-gray-600">
              <p>Perawat: {visit.nurse?.name}</p>
            </div>
          </div>
        ))}
        
        {visitationHistory.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <p>Belum ada riwayat visitasi</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDietHistory;