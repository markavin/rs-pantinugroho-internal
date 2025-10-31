// src/app/dashboard/nurse-poli/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Search, User, Activity, History, Eye, Menu, X, FlaskConical, ClipboardCheck, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import PatientExaminationForm from '@/components/dashboard/nursePoli/PatientExaminationForm';
import LabHistoryView from '@/components/dashboard/nursePoli/LabHistoryView';
import SplashScreen from '@/components/SplashScreen';
import { useSession } from 'next-auth/react';
import SystemHistoryView from '../SystemHistoryView';

interface Patient {
  id: string;
  mrNumber: string;
  name: string;
  birthDate: Date;
  gender: 'MALE' | 'FEMALE';
  phone?: string;
  height?: number;
  weight?: number;
  bmi?: number;
  diabetesType?: string;
  insuranceType: string;
  lastVisit?: Date;
  status?: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  allergies?: string[];
  smokingStatus?: 'TIDAK_MEROKOK' | 'PEROKOK' | 'MANTAN_PEROKOK';
  createdAt: Date;
}

interface DashboardStats {
  totalPatientsToday: number;
  examinationsToday: number;
  waitingForDoctor: number;
  abnormalResults: number;
}

interface PatientRecord {
  id: string;
  patientId: string;
  patient?: Patient;
  recordType: string;
  title: string;
  content: string;
  metadata?: any;
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  createdAt: Date;
}

const NursePoliDashboard = () => {
  const { data: session } = useSession();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'history' | 'system-history'>('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    totalPatientsToday: 0,
    examinationsToday: 0,
    waitingForDoctor: 0,
    abnormalResults: 0
  });
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [showExaminationForm, setShowExaminationForm] = useState(false);
  const [selectedPatientForExam, setSelectedPatientForExam] = useState<Patient | null>(null);

  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState<Patient | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRefreshSplash, setShowRefreshSplash] = useState(false);
  const [recentExaminations, setRecentExaminations] = useState<PatientRecord[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      let activePatientsData: Patient[] = [];

      const patientsRes = await fetch('/api/patients?activeOnly=true');
      if (patientsRes.ok) {
        activePatientsData = await patientsRes.json();
        setPatients(activePatientsData);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [recordsRes, labsRes, alertsRes] = await Promise.all([
        fetch('/api/patient-records'),
        fetch('/api/lab-results'),
        fetch('/api/alerts?targetRole=PERAWAT_POLI')
      ]);

      let vitalSignsToday = 0;
      let recentExams: PatientRecord[] = [];

      if (recordsRes.ok) {
        const allRecords = await recordsRes.json();

        const vitalRecords = allRecords.filter((r: PatientRecord) =>
          r.recordType === 'VITAL_SIGNS' && new Date(r.createdAt) >= today
        );
        vitalSignsToday = vitalRecords.length;

        recentExams = allRecords
          .filter((r: PatientRecord) => r.recordType === 'VITAL_SIGNS')
          .sort((a: PatientRecord, b: PatientRecord) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 5);
      }

      let abnormalCount = 0;
      if (labsRes.ok) {
        const allLabs = await labsRes.json();
        const labsToday = allLabs.filter((lab: any) => new Date(lab.testDate) >= today);
        abnormalCount = labsToday.filter((lab: any) =>
          lab.status === 'HIGH' || lab.status === 'LOW' || lab.status === 'CRITICAL'
        ).length;
      }

      let waitingCount = 0;
      if (alertsRes.ok) {
        const alerts = await alertsRes.json();
        waitingCount = alerts.filter((alert: any) =>
          !alert.isRead && alert.category === 'SYSTEM'
        ).length;
      }

      setStats({
        totalPatientsToday: activePatientsData.length,
        examinationsToday: vitalSignsToday,
        waitingForDoctor: waitingCount,
        abnormalResults: abnormalCount
      });

      setRecentExaminations(recentExams);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setShowRefreshSplash(true);
    await fetchDashboardData();
  };

  const handleRefreshSplashFinish = () => {
    setShowRefreshSplash(false);
    setIsRefreshing(false);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

  const formatDate = (date: Date | string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date | string) => {
    if (!date) return '-';
    return new Date(date).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTabChange = (tab: 'dashboard' | 'patients' | 'history' | 'system-history') => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);

    if (tab !== 'history') setSelectedPatientForHistory(null);
  };

  const handleOpenExaminationForm = (patient: Patient) => {
    setSelectedPatientForExam(patient);
    setShowExaminationForm(true);
  };

  const handleCloseExaminationForm = () => {
    setShowExaminationForm(false);
    setSelectedPatientForExam(null);
  };

  const handleExaminationComplete = () => {
    fetchDashboardData();
  };

  const handleViewPatientHistory = (patient: Patient) => {
    setSelectedPatientForHistory(patient);
    setActiveTab('history');
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const navigationItems = [
    { key: 'dashboard', label: 'Dashboard', icon: Activity },
    { key: 'patients', label: 'Daftar Pasien', icon: User },
    { key: 'history', label: 'Riwayat Lab', icon: FlaskConical },
    { key: 'system-history', label: 'Riwayat Sistem', icon: History }
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Menu Perawat Poli</h2>
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
              <button
                key={item.key}
                onClick={() => handleTabChange(item.key as any)}
                className={`flex items-center space-x- w-full p-3 rounded-lg font-medium text-sm transition-colors ${activeTab === item.key
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm border border-gray-200"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={() => {
              setIsRefreshing(true);
              refreshData();
            }}
            disabled={isRefreshing}
            className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm border border-green-500 text-sm text-gray-600 hover:bg-green-50 transition-colors disabled:opacity-50"
          >
            {isRefreshing ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full mr-2"></div>
                <span>Refresh...</span>
              </>
            ) : (
              <>
                <Activity className="h-4 w-4 mr-2 text-green-600" />
                <span>Refresh</span>
              </>
            )}
          </button>
        </div>

        <div className="hidden lg:flex items-center justify-end mb-6">
          <button
            onClick={() => {
              setIsRefreshing(true);
              refreshData();
            }}
            disabled={isRefreshing}
            className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-green-500 text-sm text-gray-600 hover:bg-green-50 transition-colors disabled:opacity-50"
          >
            {isRefreshing ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full mr-2"></div>
                <span>Refreshing...</span>
              </>
            ) : (
              <>
                <Activity className="h-4 w-4 mr-2 text-green-600" />
                <span>Refresh Data</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm mb-6 hidden lg:block">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-55 px-6 justify-center">
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

          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-sm border border-blue-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Pasien Aktif</p>
                          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPatientsToday}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                          <User className="h-8 w-8 text-blue-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-white to-green-50 p-6 rounded-xl shadow-sm border border-green-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">Pemeriksaan Hari Ini</p>
                          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.examinationsToday}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                          <ClipboardCheck className="h-8 w-8 text-green-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-white to-orange-50 p-6 rounded-xl shadow-sm border border-orange-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-600">Menunggu Dokter</p>
                          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.waitingForDoctor}</p>
                        </div>
                        <div className="bg-orange-100 p-3 rounded-full">
                          <Activity className="h-8 w-8 text-orange-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-white to-red-50 p-6 rounded-xl shadow-sm border border-red-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-red-600">Hasil Abnormal</p>
                          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.abnormalResults}</p>
                        </div>
                        <div className="bg-red-100 p-3 rounded-full">
                          <FlaskConical className="h-8 w-8 text-red-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Pemeriksaan Terbaru</h3>
                    </div>
                    <div className="p-6">
                      {recentExaminations.length > 0 ? (
                        <div className="space-y-3">
                          {recentExaminations.map((record) => (
                            <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                  <ClipboardCheck className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{record.patient?.name || 'Pasien'}</p>
                                  <p className="text-sm text-gray-500">RM: {record.patient?.mrNumber || '-'}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-900">{formatDate(record.createdAt)}</p>
                                <p className="text-xs text-gray-500">{formatTime(record.createdAt)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          <ClipboardCheck className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium mb-2">Belum ada pemeriksaan hari ini</p>
                          <p>Mulai dengan memeriksa pasien dari menu Daftar Pasien</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'patients' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">Daftar Pasien Aktif</h3>
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Cari nama atau RM..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full text-gray-900"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RM</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">L/P</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Penjamin</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedPatients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.mrNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {patient.gender === 'MALE' ? 'L' : 'P'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{patient.insuranceType}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${patient.status === 'AKTIF' ? 'bg-green-100 text-green-800' :
                            patient.status === 'RAWAT_JALAN' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                            {patient.status || 'AKTIF'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button
                            onClick={() => handleOpenExaminationForm(patient)}
                            className="text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded font-medium inline-flex items-center space-x-1 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Pemeriksaan</span>
                          </button>
                          <button
                            onClick={() => handleViewPatientHistory(patient)}
                            className="text-blue-600 hover:text-blue-900 font-medium inline-flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Riwayat</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {paginatedPatients.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">
                      {searchTerm ? 'Tidak ada pasien ditemukan' : 'Belum ada pasien aktif'}
                    </p>
                  </div>
                )}
              </div>

              <div className="lg:hidden space-y-4 p-4">
                {paginatedPatients.map((patient) => (
                  <div key={patient.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                        <p className="text-sm text-gray-600">RM: {patient.mrNumber}</p>
                        <p className="text-sm text-gray-600">{patient.insuranceType}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${patient.status === 'AKTIF' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                        {patient.status || 'AKTIF'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleOpenExaminationForm(patient)}
                        className="bg-green-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Periksa</span>
                      </button>
                      <button
                        onClick={() => handleViewPatientHistory(patient)}
                        className="bg-blue-100 text-blue-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Riwayat</span>
                      </button>
                    </div>
                  </div>
                ))}

                {paginatedPatients.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{searchTerm ? 'Tidak ada pasien ditemukan' : 'Belum ada pasien aktif'}</p>
                  </div>
                )}
              </div>

              {filteredPatients.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Tampilkan</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="px-3 py-1 border border-gray-400 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={1000}>1000</option>
                    </select>
                    <span className="text-sm text-gray-700">
                      dari {filteredPatients.length} pasien
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>

                    <div className="flex gap-1">
                      {getPageNumbers().map((page, index) => (
                        <button
                          key={index}
                          onClick={() => typeof page === 'number' && handlePageChange(page)}
                          disabled={page === '...'}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            page === currentPage
                              ? 'bg-green-600 text-white'
                              : page === '...'
                              ? 'cursor-default text-gray-400'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}</button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <LabHistoryView
              patients={filteredPatients}
              selectedPatient={selectedPatientForHistory}
              onPatientSelect={setSelectedPatientForHistory}
            />
          )}

          {activeTab === 'system-history' && (
            <SystemHistoryView
              patients={filteredPatients}
              selectedPatient={selectedPatientForHistory}
              onPatientSelect={setSelectedPatientForHistory}
            />
          )}
        </div>
      </div>

      <PatientExaminationForm
        isOpen={showExaminationForm}
        onClose={handleCloseExaminationForm}
        patient={selectedPatientForExam}
        onComplete={handleExaminationComplete}
      />

      {showRefreshSplash && (
        <SplashScreen
          onFinish={handleRefreshSplashFinish}
          message="Memuat ulang data..."
          duration={1500}
        />
      )}
    </div>
  );
};

export default NursePoliDashboard;