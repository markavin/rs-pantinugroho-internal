// src/app/nutritionist/components/PatientList.tsx
import React from 'react';
import { Users, Eye, Edit3, Activity, Scale, Target, Utensils, AlertTriangle } from 'lucide-react';

interface PatientListProps {
  patients: any[];
  loading: boolean;
  error: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onViewDetail: (patient: any) => void;
  onEditDiet: (patient: any) => void;
  onMonitor: (patient: any) => void;
  onViewDietIssue: (alert: any) => void;
  calculateAge: (birthDate: string) => number;
  getBMIColor: (bmi: number) => string;
  getBMICategory: (bmi: number) => string;
  getComplianceColor: (compliance: number) => string;
}

const PatientList: React.FC<PatientListProps> = ({
  patients,
  loading,
  error,
  searchTerm,
  onSearchChange,
  onViewDetail,
  onEditDiet,
  onMonitor,
  onViewDietIssue,
  calculateAge,
  getBMIColor,
  getBMICategory,
  getComplianceColor
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Memuat data pasien...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <span className="text-red-600">Error: {error}</span>
      </div>
    );
  }

  return (
    <>
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">MR Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">BMI</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Kepatuhan Diet</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Alert Diet</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {patients.map((patient) => {
              const age = calculateAge(patient.birthDate);
              return (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {patient.mrNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                    <div className="text-sm text-gray-500">{age} thn • {patient.gender}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getBMIColor(patient.bmi)}`}>
                      {patient.bmi ? `${patient.bmi.toFixed(1)} (${getBMICategory(patient.bmi)})` : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getComplianceColor(patient.dietCompliance)}`}>
                      {patient.dietCompliance ? `${patient.dietCompliance}%` : 'Belum diinput'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {patient.riskLevel && (
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        patient.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700' :
                        patient.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {patient.riskLevel}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {patient.hasDietIssue ? (
                      <button
                        onClick={() => onViewDietIssue(patient.dietAlert)}
                        className="flex items-center space-x-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium hover:bg-orange-200"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        <span>Lihat Masalah</span>
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">Tidak ada</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button onClick={() => onViewDetail(patient)} className="text-gray-600 hover:text-gray-900 font-medium inline-flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>Detail</span>
                    </button>
                    <button onClick={() => onEditDiet(patient)} className="text-blue-600 hover:text-blue-900 font-medium inline-flex items-center space-x-1">
                      <Edit3 className="h-4 w-4" />
                      <span>Diet</span>
                    </button>
                    <button onClick={() => onMonitor(patient)} className="text-green-600 hover:text-green-900 font-medium inline-flex items-center space-x-1">
                      <Activity className="h-4 w-4" />
                      <span>Monitor</span>
                    </button>
                  </td>
                </tr>
              );
            })}
            {patients.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  {searchTerm ? "Tidak ada pasien yang ditemukan" : "Belum ada data pasien"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden space-y-4 p-4">
        {patients.map((patient) => {
          const age = calculateAge(patient.birthDate);
          return (
            <div key={patient.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-lg">{patient.name}</h4>
                  <p className="text-sm text-gray-600">{patient.mrNumber} • {age} thn • {patient.gender}</p>
                </div>
                {patient.riskLevel && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    patient.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700' :
                    patient.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {patient.riskLevel}
                  </span>
                )}
              </div>
              
              {patient.hasDietIssue && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">Ada Masalah Diet</span>
                    </div>
                    <button
                      onClick={() => onViewDietIssue(patient.dietAlert)}
                      className="text-xs bg-orange-600 text-white px-3 py-1 rounded-md hover:bg-orange-700"
                    >
                      Lihat
                    </button>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <button onClick={() => onViewDetail(patient)} className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-200 flex items-center justify-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>Detail</span>
                </button>
                <button onClick={() => onEditDiet(patient)} className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-200 flex items-center justify-center space-x-1">
                  <Edit3 className="h-4 w-4" />
                  <span>Diet</span>
                </button>
                <button onClick={() => onMonitor(patient)} className="flex-1 bg-green-100 text-green-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-green-200 flex items-center justify-center space-x-1">
                  <Activity className="h-4 w-4" />
                  <span>Monitor</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default PatientList;