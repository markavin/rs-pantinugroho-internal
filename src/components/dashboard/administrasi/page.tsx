// src/components/dashboard/admin/page.tsx
import React, { useState, useEffect } from 'react';
import { Search, User, Calendar, Activity, FileText, Users, Menu, X, Plus, Edit, Trash2, Eye, AlertCircle, Filter } from 'lucide-react';
import PatientRegistrationForm from './PatientRegistrationForm';
import PatientComplaintForm from './PatientComplaintForm';

interface Patient {
  id: string;
  mrNumber: string;
  name: string;
  birthDate: Date;
  gender: 'MALE' | 'FEMALE';
  phone?: string;
  address?: string;
  height?: number;
  weight?: number;
  diabetesType?: string;
  insuranceType: string;
  lastVisit?: Date;
  status?: string;
  createdAt: Date;
  allergies?: string[];
  medicalHistory?: string;
}

interface PatientComplaint {
  id: string;
  patientId: string;
  complaint: string;
  severity: 'RINGAN' | 'SEDANG' | 'BERAT';
  status: 'BARU' | 'DALAM_PROSES' | 'SELESAI';
  date: Date;
  patient?: {
    name: string;
    mrNumber: string;
  };
}

interface DashboardStats {
  totalPatients: number;
  todayRegistrations: number;
  activeComplaints: number;
  pendingRegistrations: number;
  activePatients: number;
  rujukBalikPatients: number;
}

const AdministrasiDashboard = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [complaints, setComplaints] = useState<PatientComplaint[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'registration'>('dashboard');
  const [patientStatusFilter, setPatientStatusFilter] = useState<'ACTIVE' | 'RUJUK_BALIK' | 'SELESAI' | 'ALL'>('ACTIVE');
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayRegistrations: 0,
    activeComplaints: 0,
    pendingRegistrations: 0,
    activePatients: 0,
    rujukBalikPatients: 0
  });
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');
  const [showComplaintForm, setShowComplaintForm] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const patientsResponse = await fetch('/api/patients');
      if (patientsResponse.ok) {
        const patientsData = await patientsResponse.json();
        setPatients(patientsData);
      }

      const complaintsResponse = await fetch('/api/patient-complaints');
      if (complaintsResponse.ok) {
        const complaintsData = await complaintsResponse.json();
        setComplaints(complaintsData);
      }

      const statsResponse = await fetch('/api/dashboard/admin-stats');
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

  const getFilteredPatients = () => {
    let statusFiltered = patients;
    
    if (patientStatusFilter !== 'ALL') {
      statusFiltered = patients.filter(patient => {
        const status = patient.status || 'ACTIVE';
        return status === patientStatusFilter;
      });
    }

    return statusFiltered.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.gender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.insuranceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.status || 'ACTIVE').toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.mrNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredPatients = getFilteredPatients();

  const refreshData = async () => {
    const fetchData = async () => {
      try {
        const patientsResponse = await fetch('/api/patients');
        if (patientsResponse.ok) {
          const patientsData = await patientsResponse.json();
          setPatients(patientsData);
        }

        const complaintsResponse = await fetch('/api/patient-complaints');
        if (complaintsResponse.ok) {
          const complaintsData = await complaintsResponse.json();
          setComplaints(complaintsData);
        }

      } catch (error) {
        console.error('Error refreshing data:', error);
      }
    };

    await fetchData();
  };

  const [isRefreshing, setIsRefreshing] = useState(false);

  const formatDate = (date: Date | string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID');
  };

  const calculateAge = (birthDate: Date | string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleTabChange = (tab: 'dashboard' | 'patients' | 'registration') => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
  };

  const handleAddPatient = () => {
    setSelectedPatient(null);
    setFormMode('add');
    setShowPatientForm(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormMode('edit');
    setShowPatientForm(true);
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormMode('view');
    setShowPatientForm(true);
  };

  const handleDeletePatient = async (patientId: string, patientName: string) => {
    if (!confirm(`Yakin ingin menghapus data pasien ${patientName}? Data akan dihapus permanen dari database.`)) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchDashboardData();
        alert('Data pasien berhasil dihapus!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Gagal menghapus data pasien'}`);
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Terjadi kesalahan saat menghapus data pasien');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComplaint = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowComplaintForm(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'BERAT': return 'text-red-700 bg-red-50 border-red-200';
      case 'SEDANG': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'RINGAN': return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getComplaintStatusColor = (status: string) => {
    switch (status) {
      case 'BARU': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'DALAM_PROSES': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'SELESAI': return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getPatientStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'RUJUK_BALIK': return 'bg-blue-100 text-blue-800';
      case 'SELESAI': return 'bg-gray-100 text-gray-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getPatientStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Aktif';
      case 'RUJUK_BALIK': return 'Rujuk Balik';
      case 'SELESAI': return 'Selesai';
      default: return 'Aktif';
    }
  };

  const getStatusCounts = () => {
    const activeCount = patients.filter(p => !p.status || p.status === 'ACTIVE').length;
    const rujukBalikCount = patients.filter(p => p.status === 'RUJUK_BALIK').length;
    const selesaiCount = patients.filter(p => p.status === 'SELESAI').length;
    
    return { activeCount, rujukBalikCount, selesaiCount };
  };

  const { activeCount, rujukBalikCount, selesaiCount } = getStatusCounts();

  const navigationItems = [
    { key: 'dashboard', label: 'Dashboard', icon: Activity },
    { key: 'patients', label: 'Data Pasien', icon: Users },
  ];

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
          <h2 className="text-m font-semibold text-gray-900">Menu Administrasi</h2>
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
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm border border-gray-200"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={async () => {
              setIsRefreshing(true);
              await refreshData();
              setIsRefreshing(false);
            }}
            disabled={isRefreshing}
            className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm border border-emerald-500 text-sm text-gray-600 hover:bg-emerald-300 transition-colors disabled:opacity-50"
          >
            {isRefreshing ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full mr-2"></div>
                <span>Refreshing...</span>
              </>
            ) : (
              <>
                <Activity className="h-4 w-4 mr-2 text-emerald-600" />
                <span>Refresh</span>
              </>
            )}
          </button>
        </div>

        <div className="hidden lg:flex items-center justify-end mb-6">
          <div className="flex items-center justify-center md:justify-end space-x-2 md:space-x-3">
            <button
              onClick={async () => {
                setIsRefreshing(true);
                await refreshData();
                setIsRefreshing(false);
              }}
              disabled={isRefreshing}
              className="flex items-center bg-white px-3 md:px-4 py-2 rounded-lg shadow-sm border border-emerald-500 
               text-xs md:text-sm text-gray-600 hover:bg-emerald-300 transition-colors disabled:opacity-50"
            >
              {isRefreshing ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full mr-2"></div>
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4 mr-2 text-emerald-600" />
                  <span>Refresh Data</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm mb-6 hidden lg:block">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-85 px-6 justify-center">
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
            <div className="space-y-8">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-sm border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Total Pasien</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPatients}</p>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-full">
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-white to-green-50 p-6 rounded-xl shadow-sm border border-green-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">Pasien Aktif</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{activeCount}</p>
                      </div>
                      <div className="bg-green-100 p-3 rounded-full">
                        <Calendar className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-white to-orange-50 p-6 rounded-xl shadow-sm border border-orange-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-600">Keluhan Aktif</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{complaints.filter(c => c.status !== 'SELESAI').length}</p>
                      </div>
                      <div className="bg-orange-100 p-3 rounded-full">
                        <AlertCircle className="h-8 w-8 text-orange-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-white to-purple-50 p-6 rounded-xl shadow-sm border border-purple-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600">Rujuk Balik</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{rujukBalikCount}</p>
                      </div>
                      <div className="bg-purple-100 p-3 rounded-full">
                        <FileText className="h-8 w-8 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Registrasi Terbaru</h3>
                </div>
                <div className="p-6">
                  {patients.length > 0 ? (
                    <div className="space-y-4">
                      {patients.slice(0, 5).map((patient) => (
                        <div key={patient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{patient.name}</p>
                              <p className="text-sm text-gray-500">{patient.mrNumber} | {patient.insuranceType}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {calculateAge(patient.birthDate)} tahun | {patient.gender === 'MALE' ? 'L' : 'P'}
                            </p>
                            <p className="text-xs text-gray-400">{formatDate(patient.createdAt)}</p>
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

              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Keluhan Terbaru</h3>
                </div>
                <div className="p-6">
                  {complaints.length > 0 ? (
                    <div className="space-y-4">
                      {complaints.slice(0, 5).map((complaint) => (
                        <div key={complaint.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{complaint.complaint}</p>
                              <p className="text-sm text-gray-600">
                                Pasien: {complaint.patient?.name || 'Unknown'} ({complaint.patient?.mrNumber})
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(complaint.severity)}`}>
                                {complaint.severity}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium border ${getComplaintStatusColor(complaint.status)}`}>
                                {complaint.status.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">{formatDate(complaint.date)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Belum ada keluhan pasien</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'patients' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">Daftar Pasien</h3>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
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

                    <button
                      onClick={handleAddPatient}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      Pasien Baru
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 px-6">
                <div className="flex space-x-8 py-3">
                  <button
                    onClick={() => setPatientStatusFilter('ACTIVE')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      patientStatusFilter === 'ACTIVE'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Aktif ({activeCount})
                  </button>
                  <button
                    onClick={() => setPatientStatusFilter('RUJUK_BALIK')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      patientStatusFilter === 'RUJUK_BALIK'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Rujuk Balik ({rujukBalikCount})
                  </button>
                  <button
                    onClick={() => setPatientStatusFilter('SELESAI')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      patientStatusFilter === 'SELESAI'
                        ? 'border-gray-500 text-gray-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Selesai ({selesaiCount})
                  </button>
                  <button
                    onClick={() => setPatientStatusFilter('ALL')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      patientStatusFilter === 'ALL'
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Semua ({patients.length})
                  </button>
                </div>
              </div>

              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No. RM
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama Pasien
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Umur/Gender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Penjamin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tgl Daftar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
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
                          {calculateAge(patient.birthDate)} / {patient.gender === 'MALE' ? 'L' : 'P'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.insuranceType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPatientStatusColor(patient.status || 'ACTIVE')}`}>
                            {getPatientStatusLabel(patient.status || 'ACTIVE')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(patient.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button
                            onClick={() => handleViewPatient(patient)}
                            className="text-gray-600 hover:text-gray-900 font-medium inline-flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Detail</span>
                          </button>
                          <button
                            onClick={() => handleEditPatient(patient)}
                            className="text-blue-600 hover:text-blue-900 font-medium inline-flex items-center space-x-1"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleAddComplaint(patient)}
                            className="text-green-600 hover:text-green-900 font-medium inline-flex items-center space-x-1"
                          >
                            <AlertCircle className="h-4 w-4" />
                            <span>Keluhan</span>
                          </button>
                          <button
                            onClick={() => handleDeletePatient(patient.id, patient.name)}
                            className="text-red-600 hover:text-red-900 font-medium inline-flex items-center space-x-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Hapus</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="lg:hidden space-y-4 p-4">
                {filteredPatients.map((patient) => (
                  <div key={patient.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg">{patient.name}</h4>
                        <p className="text-sm text-gray-600">RM: {patient.mrNumber}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPatientStatusColor(patient.status || 'ACTIVE')}`}>
                        {getPatientStatusLabel(patient.status || 'ACTIVE')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-600">
                          {calculateAge(patient.birthDate)} tahun / {patient.gender === 'MALE' ? 'L' : 'P'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">{patient.insuranceType}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">
                          Daftar: {formatDate(patient.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleViewPatient(patient)}
                        className="bg-gray-100 text-gray-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Detail</span>
                      </button>
                      <button
                        onClick={() => handleEditPatient(patient)}
                        className="bg-blue-100 text-blue-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleAddComplaint(patient)}
                        className="bg-green-100 text-green-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-green-200 transition-colors flex items-center justify-center space-x-1"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <span>Keluhan</span>
                      </button>
                      <button
                        onClick={() => handleDeletePatient(patient.id, patient.name)}
                        className="bg-red-100 text-red-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-red-200 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                ))}

                {filteredPatients.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{searchTerm ? 'Tidak ada pasien yang ditemukan' : 'Belum ada data pasien'}</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {showPatientForm && (
        <PatientRegistrationForm
          selectedPatient={selectedPatient}
          formMode={formMode}
          onClose={() => {
            setShowPatientForm(false);
            setSelectedPatient(null);
          }}
          onPatientAdded={fetchDashboardData}
        />
      )}

      {showComplaintForm && selectedPatient && (
        <PatientComplaintForm
          patient={selectedPatient}
          onClose={() => {
            setShowComplaintForm(false);
            setSelectedPatient(null);
          }}
          onComplaintAdded={fetchDashboardData}
        />
      )}
    </div>
  );
};

export default AdministrasiDashboard;