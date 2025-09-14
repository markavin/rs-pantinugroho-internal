// src/components/dashboard/nursePoli/page.tsx
import React, { useState, useEffect } from 'react';
import { Search, User, Calendar, Activity, AlertCircle, FileText, Users, HeartPulse, Menu, X } from 'lucide-react';
import PatientRegistration from './PatientRegistration';

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

interface DashboardStats {
  totalPatients: number;
  todayRegistrations: number;
  activeComplaints: number;
}

const NursePoliDashboard = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'reports'>('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayRegistrations: 0,
    activeComplaints: 0
  });
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch patients
      const patientsResponse = await fetch('/api/patients');
      if (patientsResponse.ok) {
        const patientsData = await patientsResponse.json();
        setPatients(patientsData);
      }

      // Fetch stats
      const statsResponse = await fetch('/api/dashboard/nurse-poli-stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
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

  const getGenderDisplay = (gender: string) => {
    return gender === 'MALE' ? 'L' : 'P';
  };

  const handleTabChange = (tab: 'dashboard' | 'patients' | 'reports') => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false); // Close sidebar when tab is selected
  };

  // Navigation items
  const navigationItems = [
    { key: 'dashboard', label: 'Dashboard', icon: Activity },
    { key: 'patients', label: 'Registrasi Pasien', icon: Users },
    { key: 'reports', label: 'Laporan', icon: FileText }
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
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map(item => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => handleTabChange(item.key as any)}
                className={`flex items-center space-x-3 w-full p-3 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === item.key
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <IconComponent className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Mobile Header with Menu Button */}
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>

          {/* Search Bar - Only show on patients tab for mobile */}
          {activeTab === 'patients' && (
            <div className="flex-1 ml-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Cari Pasien..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full text-gray-700 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-700" />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Search Bar - Only show on patients tab for desktop */}
          {activeTab === 'patients' && (
            <div className="hidden lg:block flex-1 mr-1">
              <div className="relative w-full max-w-xl sm:max-w-2xl md:max-w-7xl">
                <input
                  type="text"
                  placeholder="Cari Pasien..."
                  className="pl-10 md:pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full text-gray-700 text-sm md:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 md:h-5 md:w-5 text-gray-700" />
              </div>
            </div>
          )}

          {/* Navigation Tabs - Desktop Only */}
          <div className="bg-white rounded-lg shadow-sm mb-6 hidden lg:block">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-3 sm:px-6 justify-center overflow-x-auto">
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
                  <div className="bg-gradient-to-br from-white to-green-50 p-4 sm:p-6 rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">Total Pasien</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{stats.totalPatients}</p>
                      </div>
                      <div className="bg-green-100 p-3 rounded-full">
                        <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-white to-blue-50 p-4 sm:p-6 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Registrasi Hari Ini</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{stats.todayRegistrations}</p>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-full">
                        <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-white to-red-50 p-4 sm:p-6 rounded-xl shadow-sm border border-red-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-600">Keluhan Aktif</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{stats.activeComplaints}</p>
                      </div>
                      <div className="bg-red-100 p-3 rounded-full">
                        <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h3>
                </div>
                <div className="p-4 sm:p-6">
                  {loading ? (
                    <div className="text-center text-gray-500">Memuat data...</div>
                  ) : filteredPatients.length > 0 ? (
                    <div className="space-y-4">
                      {filteredPatients.slice(0, 5).map((patient) => (
                        <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{patient.name}</p>
                              <p className="text-sm text-gray-500">{patient.mrNumber}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Terakhir: {formatDate(patient.lastVisit || patient.createdAt)}</p>
                            <p className="text-xs text-gray-400">{patient.insuranceType}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      Belum ada data pasien
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Patients Tab */}
          {activeTab === 'patients' && (
            <PatientRegistration
              patients={patients}
              onPatientsUpdate={fetchDashboardData}
              searchTerm={searchTerm}
            />
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Laporan Pasien</h3>
                </div>

                <div className="p-4 sm:p-6">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Memuat laporan...</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Summary Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h4 className="font-semibold text-green-800 mb-2">Pasien Aktif</h4>
                          <p className="text-2xl font-bold text-green-900">
                            {patients.filter(p => p.status === 'ACTIVE' || !p.status).length}
                          </p>
                          <p className="text-sm text-green-600">Sedang dalam perawatan</p>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-blue-800 mb-2">Rujuk Balik</h4>
                          <p className="text-2xl font-bold text-blue-900">
                            {patients.filter(p => p.status === 'RUJUK_BALIK').length}
                          </p>
                          <p className="text-sm text-blue-600">Pasien rujuk balik</p>
                        </div>
                      </div>

                      {/* Patient List */}
                      <div className="overflow-hidden">
                        <h4 className="font-semibold text-gray-900 mb-4">Daftar Pasien Terbaru</h4>
                        <div className="space-y-3">
                          {filteredPatients.slice(0, 10).map((patient) => (
                            <div key={patient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                  <div className="mb-2 sm:mb-0">
                                    <p className="font-medium text-gray-900">{patient.name}</p>
                                    <p className="text-sm text-gray-600">{patient.mrNumber}</p>
                                  </div>
                                  <div className="flex flex-col sm:text-right">
                                    <p className="text-sm text-gray-900">
                                      {patient.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}
                                    </p>
                                    <p className="text-xs text-gray-500">{patient.insuranceType}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${patient.status === 'ACTIVE' || !patient.status
                                  ? 'bg-green-100 text-green-800'
                                  : patient.status === 'RUJUK_BALIK'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                  }`}>
                                  {patient.status === 'ACTIVE' || !patient.status
                                    ? 'Aktif'
                                    : patient.status === 'RUJUK_BALIK'
                                      ? 'Rujuk Balik'
                                      : patient.status
                                  }
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {filteredPatients.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            Tidak ada data pasien yang ditemukan
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NursePoliDashboard;