// src/components/dashboard/nursePoli/LabHistoryView.tsx
import React, { useState, useEffect } from 'react';
import { History, FlaskConical, User, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Patient {
  id: string;
  mrNumber: string;
  name: string;
  birthDate: Date;
  gender: 'MALE' | 'FEMALE';
  insuranceType: string;
  createdAt: Date;
}

interface LabResult {
  id: string;
  patientId: string;
  testType: string;
  value: string;
  normalRange: string;
  testDate: Date;
  status: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL';
  notes?: string;
}

interface LabHistoryViewProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onPatientSelect: (patient: Patient | null) => void;
}

const LabHistoryView: React.FC<LabHistoryViewProps> = ({
  patients,
  selectedPatient,
  onPatientSelect
}) => {
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTestType, setSelectedTestType] = useState<string>('');

  useEffect(() => {
    if (selectedPatient) {
      fetchLabHistory(selectedPatient.id);
    }
  }, [selectedPatient]);

  const fetchLabHistory = async (patientId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/lab-results?patientId=${patientId}`);
      if (response.ok) {
        const data = await response.json();
        setLabResults(data);
      }
    } catch (error) {
      console.error('Error fetching lab history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL': return 'text-red-700 bg-red-50 border-red-200';
      case 'HIGH': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'LOW': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'NORMAL': return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (currentIndex: number, results: LabResult[]) => {
    if (currentIndex === results.length - 1) return <Minus className="h-4 w-4 text-gray-400" />;
    
    const current = parseFloat(results[currentIndex].value);
    const previous = parseFloat(results[currentIndex + 1].value);
    
    if (isNaN(current) || isNaN(previous)) return <Minus className="h-4 w-4 text-gray-400" />;
    
    if (current > previous) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const uniqueTestTypes = Array.from(new Set(labResults.map(result => result.testType)));
  
  const filteredResults = selectedTestType 
    ? labResults.filter(result => result.testType === selectedTestType)
    : labResults;

  const sortedResults = filteredResults.sort((a, b) => 
    new Date(b.testDate).getTime() - new Date(a.testDate).getTime()
  );

  if (!selectedPatient) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center space-x-3">
          <History className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Riwayat Laboratorium</h3>
        </div>
        
        <div className="p-6">
          <div className="text-center py-8">
            <FlaskConical className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Pilih Pasien</h4>
            <p className="text-gray-600 mb-6">Pilih pasien dari daftar untuk melihat riwayat laboratorium</p>
            
            <div className="max-w-md mx-auto">
              <div className="grid gap-3">
                {patients.slice(0, 5).map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => onPatientSelect(patient)}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{patient.name}</p>
                        <p className="text-sm text-gray-600">RM: {patient.mrNumber}</p>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {patient.insuranceType}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              
              {patients.length > 5 && (
                <p className="text-sm text-gray-500 mt-4">
                  Dan {patients.length - 5} pasien lainnya...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Patient Info Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{selectedPatient.name}</h2>
              <p className="text-gray-600">RM: {selectedPatient.mrNumber} | {selectedPatient.insuranceType}</p>
            </div>
          </div>
          <button
            onClick={() => onPatientSelect(null)}
            className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Ganti Pasien
          </button>
        </div>

        {/* Test Type Filter */}
        {uniqueTestTypes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTestType('')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedTestType === '' 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Semua Test
            </button>
            {uniqueTestTypes.map((testType) => (
              <button
                key={testType}
                onClick={() => setSelectedTestType(testType)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTestType === testType 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {testType}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lab Results */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <History className="h-5 w-5 text-blue-600" />
            <span>Riwayat Hasil Laboratorium</span>
          </h3>
          <span className="text-sm text-gray-500">
            {filteredResults.length} hasil ditemukan
          </span>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : sortedResults.length > 0 ? (
            <div className="space-y-4">
              {sortedResults.map((result, index) => (
                <div key={result.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{result.testType}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(result.status)}`}>
                          {result.status}
                        </span>
                        {getTrendIcon(index, sortedResults.filter(r => r.testType === result.testType))}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Hasil: </span>
                          <span className="font-medium text-gray-900">{result.value}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Normal: </span>
                          <span className="text-gray-700">{result.normalRange}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{formatDate(result.testDate)}</span>
                        </div>
                      </div>
                      {result.notes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                          <strong>Catatan:</strong> {result.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FlaskConical className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Belum ada hasil laboratorium</p>
              <p>
                {selectedTestType 
                  ? `Tidak ada hasil untuk test ${selectedTestType}` 
                  : 'Pasien ini belum memiliki riwayat laboratorium'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabHistoryView;