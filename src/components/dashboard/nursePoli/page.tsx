// src/components/dashboard/nursePoli/page.tsx
import React, { useState, useEffect } from 'react';
import { Search, User, Calendar, Activity, FileText, Users, Menu, X, FlaskConical, History, Eye } from 'lucide-react';
import LabResultForm from './LabResultForm';
import LabHistoryView from './LabHistoryView';

interface Patient {
  id: string;
  mrNumber: string;
  name: string;
  birthDate: Date;
  gender: 'MALE' | 'FEMALE';
  phone?: string;
  height?: number;
  weight?: number;
  diabetesType?: string;
  insuranceType: string;
  lastVisit?: Date;
  status?: string;
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
  patient: {
    name: string;
    mrNumber: string;
  };
}

interface DashboardStats {
  totalPatients: number;
  todayLabResults: number;
  pendingResults: number;
}

const NursePoliDashboard = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'lab-input' | 'lab-history'>('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayLabResults: 0,
    pendingResults: 0
  });
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch patients - Perawat Poli can view patients for lab purposes
      const patientsResponse = await fetch('/api/patients');
      if (patientsResponse.ok) {
        const patientsData = await patientsResponse.json();
        setPatients(patientsData);
      } else {
        console.error('Failed to fetch patients:', await patientsResponse.text());
      }

      // Fetch lab results
      const labResponse = await fetch('/api/lab-results');
      if (labResponse.ok) {
        const labData = await labResponse.json();
        setLabResults(labData);
      } else {
        console.error('Failed to fetch lab results:', await labResponse.text());
      }

      // Fetch stats
      const statsResponse = await fetch('/api/dashboard/nurse-poli-stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      } else {
        console.error('Failed to fetch stats:', await statsResponse.text());
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date | string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID');
  };

  const handleTabChange = (tab: 'dashboard' | 'patients' | 'lab-input' | 'lab-history') => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
  };

  const handleViewPatientHistory = (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveTab('lab-history');
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

  // Navigation items - Perawat Poli focused on lab work
  const navigationItems = [
    { key: 'dashboard', label: 'Dashboard', icon: Activity },
    { key: 'patients', label: 'Data Pasien', icon: Users},
    { key: 'lab-input', label: 'Input Lab', icon: FlaskConical},
    { key: 'lab-history', label: 'Riwayat Lab', icon: History}
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-m font-semibold text-gray-900">Menu Perawat Poli</h2>
          </div>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navigationItems.map(item => {
            const IconComponent = item.icon;
            return (
              <div key={item.key}>
                <button
                  onClick={() => handleTabChange(item.key as any)}
                  className={`flex items-center space-x-3 w-full p-3 rounded-lg font-medium text-sm transition-colors ${activeTab === item.key
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
                
              </div>
            );
          })}
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm border border-gray-200"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Navigation Tabs - Desktop */}
          <div className="bg-white rounded-lg shadow-sm mb-6 hidden lg:block">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-50 px-6 justify-center">
                {navigationItems.map(tab => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.key
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-white to-green-50 p-6 rounded-xl shadow-sm border border-green-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">Total Pasien</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPatients}</p>
                        <p className="text-xs text-green-600 mt-1">Data untuk keperluan lab</p>
                      </div>
                      <div className="bg-green-100 p-3 rounded-full">
                        <Users className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-sm border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Lab Hari Ini</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.todayLabResults}</p>
                        <p className="text-xs text-blue-600 mt-1">Hasil yang diinput</p>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-full">
                        <FlaskConical className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-white to-orange-50 p-6 rounded-xl shadow-sm border border-orange-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-600">Hasil Pending</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingResults}</p>
                        <p className="text-xs text-orange-600 mt-1">Perlu ditindaklanjuti</p>
                      </div>
                      <div className="bg-orange-100 p-3 rounded-full">
                        <History className="h-8 w-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Lab Results */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Hasil Lab Terbaru</h3>
                </div>
                <div className="p-6">
                  {labResults.length > 0 ? (
                    <div className="space-y-4">
                      {labResults.slice(0, 5).map((result) => (
                        <div key={result.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <FlaskConical className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{result.patient.name}</p>
                              <p className="text-sm text-gray-500">{result.testType}: {result.value}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(result.status)}`}>
                              {result.status}
                            </span>
                            <p className="text-xs text-gray-400 mt-1">{formatDate(result.testDate)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <FlaskConical className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Belum ada hasil laboratorium</p>
                      <p>Mulai dengan menginput hasil lab dari tab "Input Lab"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Patients Tab - READ ONLY for Perawat Poli */}
          {activeTab === 'patients' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900">Daftar Pasien</h3>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Cari Pasien..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full md:w-64 text-gray-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No. RM
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jenis Kelamin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Penjamin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kunjungan Terakhir
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi Lab
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPatients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {patient.mrNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.insuranceType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(patient.lastVisit || patient.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleViewPatientHistory(patient)}
                            className="text-green-600 hover:text-green-900 font-medium inline-flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Lihat Riwayat Lab</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredPatients.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">
                      {searchTerm ? 'Tidak ada pasien yang ditemukan' : 'Belum ada data pasien'}
                    </p>
                    <p className="text-sm">
                      {searchTerm ? 'Coba gunakan kata kunci yang berbeda' : 'Data pasien akan muncul setelah registrasi oleh administrasi'}
                    </p>
                  </div>
                )}
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4 p-4">
                {filteredPatients.map((patient) => (
                  <div key={patient.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                        <p className="text-sm text-gray-600">RM: {patient.mrNumber}</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {patient.insuranceType}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      <p>{patient.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}</p>
                      <p>Terakhir: {formatDate(patient.lastVisit || patient.createdAt)}</p>
                    </div>
                    <button
                      onClick={() => handleViewPatientHistory(patient)}
                      className="w-full bg-green-100 text-green-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-green-200 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Lihat Riwayat Lab</span>
                    </button>
                  </div>
                ))}

                {filteredPatients.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>
                      {searchTerm ? 'Tidak ada pasien yang ditemukan' : 'Belum ada data pasien'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lab Input Tab */}
          {activeTab === 'lab-input' && (
            <LabResultForm
              patients={patients}
              onLabResultAdded={fetchDashboardData}
            />
          )}

          {/* Lab History Tab */}
          {activeTab === 'lab-history' && (
            <LabHistoryView
              patients={filteredPatients}
              selectedPatient={selectedPatient}
              onPatientSelect={setSelectedPatient}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NursePoliDashboard;