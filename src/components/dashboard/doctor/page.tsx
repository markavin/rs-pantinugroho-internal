
'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Bell, User, Calendar, Activity, TrendingUp, AlertCircle, FileText, Pill, Users, HeartPulse, Stethoscope, ClipboardList, Edit, Eye, Trash, Trash2, Menu, X } from 'lucide-react';
import {
  mockPatients, mockAlerts,
  dashboardStats,
  getPatientsByComplianceLevel,
  getPatientsByBMICategory,
  getAverageCompliance,
  getPatientsWithNutritionPlan,
  Patient,
  Alert
} from '@/data/mockData';

interface VitalInput {
  bloodSugar: string;
  systolic: string;
  diastolic: string;
  heartRate: string;
  weight: string;
}

const DoctorDashboard = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'nutrition' | 'pharmacy' | 'nursing'>('dashboard');
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showVitalInput, setShowVitalInput] = useState<string | null>(null);
  const [vitalInputs, setVitalInputs] = useState<{ [key: string]: VitalInput }>({});
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: '',
    insuranceType: '',
    bloodSugar: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patients from API
        const patientsResponse = await fetch('/api/dashboard?type=patients');
        if (patientsResponse.ok) {
          const patientsData = await patientsResponse.json();
          setPatients(patientsData);
        }

        // Fetch alerts from API
        const alertsResponse = await fetch('/api/dashboard?type=alerts');
        if (alertsResponse.ok) {
          const alertsData = await alertsResponse.json();
          setAlerts(alertsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to mock data if API fails
        setPatients(mockPatients);
        setAlerts(mockAlerts);
      }
    };

    fetchData();
  }, []);

  // You might also want to add a refresh function
  const refreshData = async () => {
    const fetchData = async () => {
      try {
        const patientsResponse = await fetch('/api/dashboard?type=patients');
        if (patientsResponse.ok) {
          const patientsData = await patientsResponse.json();
          setPatients(patientsData);
        }

        const alertsResponse = await fetch('/api/dashboard?type=alerts');
        if (alertsResponse.ok) {
          const alertsData = await alertsResponse.json();
          setAlerts(alertsData);
        }
      } catch (error) {
        console.error('Error refreshing data:', error);
      }
    };

    await fetchData();
  };
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'text-red-700 bg-red-50 border-red-200';
      case 'MEDIUM': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'LOW': return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aktif': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Rujuk Balik': return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    const nextMRNumber = `RM${(1013 + patients.length).toString().padStart(4, '0')}`;

    const patient: Patient = {
      id: (patients.length + 1).toString(),
      mrNumber: nextMRNumber,
      name: newPatient.name,
      age: parseInt(newPatient.age),
      gender: newPatient.gender as 'L' | 'P',
      diabetesType: 'Tipe 2',
      lastVisit: new Date().toISOString().split('T')[0],
      bloodSugar: {
        value: parseInt(newPatient.bloodSugar),
        date: new Date().toLocaleDateString('id-ID'),
        trend: 'stable'
      },
      riskLevel: parseInt(newPatient.bloodSugar) > 200 ? 'HIGH' : parseInt(newPatient.bloodSugar) > 140 ? 'MEDIUM' : 'LOW',
      medications: [],
      dietCompliance: 0,
      vitalSigns: { bloodPressure: '120/80', heartRate: 70, temperature: 36.5, weight: 65 },
      insuranceType: newPatient.insuranceType,
      status: 'Aktif'
    };

    setPatients([...patients, patient]);
    setNewPatient({ name: '', age: '', gender: '', insuranceType: '', bloodSugar: '' });
    setShowAddPatient(false);
  };

  const handleVitalInput = (patientId: string, field: keyof VitalInput, value: string) => {
    setVitalInputs(prev => ({
      ...prev,
      [patientId]: {
        ...prev[patientId],
        [field]: value
      }
    }));
  };

  const saveVitals = (patientId: string) => {
    const vitals = vitalInputs[patientId];
    if (vitals) {
      setPatients(prev => prev.map(patient => {
        if (patient.id === patientId) {
          return {
            ...patient,
            bloodSugar: {
              ...patient.bloodSugar,
              value: parseInt(vitals.bloodSugar) || patient.bloodSugar.value
            },
            vitalSigns: {
              ...patient.vitalSigns,
              bloodPressure: vitals.systolic && vitals.diastolic ? `${vitals.systolic}/${vitals.diastolic}` : patient.vitalSigns.bloodPressure,
              heartRate: parseInt(vitals.heartRate) || patient.vitalSigns.heartRate,
              weight: parseFloat(vitals.weight) || patient.vitalSigns.weight
            }
          };
        }
        return patient;
      }));
    }
    setShowVitalInput(null);
    setVitalInputs({});
  };

  const handleTabChange = (tab: 'dashboard' | 'patients' | 'nutrition' | 'pharmacy' | 'nursing') => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false); // Close sidebar when tab is selected
  };

  // Get analytics data using utility functions
  const nutritionAnalytics = {
    averageCompliance: getAverageCompliance(),
    patientsWithPlan: getPatientsWithNutritionPlan().length,
    lowCompliance: getPatientsByComplianceLevel(0, 60).length,
    bmiCategories: getPatientsByBMICategory()
  };

  // Navigation items
  const navigationItems = [
    { key: 'dashboard', label: 'Dashboard', icon: Activity },
    { key: 'patients', label: 'Pasien', icon: Users },
    { key: 'nutrition', label: 'Gizi', icon: TrendingUp },
    { key: 'pharmacy', label: 'Farmasi', icon: Pill },
    { key: 'nursing', label: 'Keperawatan', icon: HeartPulse }
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
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
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

        {/* Desktop Header */}
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

        {/* Navigation Tabs - Desktop Only */}
        <div className="bg-white rounded-lg shadow-sm mb-6 hidden lg:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 md:space-x-12 px-2 sm:px-4 justify-center overflow-x-auto scrollbar-hide">
              {navigationItems.map(tab => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center flex-shrink-0 space-x-1 sm:space-x-2 py-2 sm:py-3 px-2 sm:px-4 
          border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap
          ${activeTab === tab.key
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6">
              <div className="bg-gradient-to-br from-white to-green-50 p-3 sm:p-6 rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-2 sm:mb-0">
                    <p className="text-xs sm:text-sm font-medium text-green-600">Pasien Aktif</p>
                    <div className="text-center sm:text-left">
                      <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 text-center">{dashboardStats.activePatients}</p>
                    </div>
                  </div>
                  <div className="bg-green-100 p-2 sm:p-3 rounded-full w-fit">
                    <Users className="h-5 w-5 sm:h-8 sm:w-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-blue-50 p-3 sm:p-6 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-2 sm:mb-0">
                    <p className="text-xs sm:text-sm font-medium text-blue-600">Kunjungan Hari Ini</p>
                    <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 text-center">{dashboardStats.todayVisits}</p>
                  </div>
                  <div className="bg-blue-100 p-2 sm:p-3 rounded-full w-fit">
                    <Calendar className="h-5 w-5 sm:h-8 sm:w-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-red-50 p-3 sm:p-6 rounded-xl shadow-sm border border-red-100 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-2 sm:mb-0">
                    <p className="text-xs sm:text-sm font-medium text-red-600">Total Alergi</p>
                    <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 text-center">{dashboardStats.totalAllergies}</p>
                  </div>
                  <div className="bg-red-100 p-2 sm:p-3 rounded-full w-fit">
                    <AlertCircle className="h-5 w-5 sm:h-8 sm:w-8 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Patients */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Pasien Terbaru</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {patients.slice(0, 6).map((patient) => (
                    <div key={patient.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{patient.name}</p>
                          <p className="text-sm text-gray-600">{patient.mrNumber} • {patient.insuranceType}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">GDS: {patient.bloodSugar.value}</p>
                          <p className="text-xs text-gray-500">{patient.bloodSugar.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alerts & Notifications */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Peringatan & Notifikasi</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {alerts.map((alert) => (
                    <div key={alert.id} className={`px-6 py-4 ${alert.type === 'CRITICAL' ? 'bg-red-50' :
                      alert.type === 'WARNING' ? 'bg-yellow-50' : 'bg-blue-50'
                      }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${alert.type === 'CRITICAL' ? 'text-red-800' :
                            alert.type === 'WARNING' ? 'text-yellow-800' : 'text-blue-800'
                            }`}>
                            {alert.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{alert.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="space-y-6">
            {showAddPatient && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Tambah Pasien Baru</h3>

                <form onSubmit={handleAddPatient}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Masukkan nama lengkap"
                        value={newPatient.name}
                        onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nomor RM
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                        placeholder="Auto generate"
                        value={`RM${(1013 + patients.length).toString().padStart(4, '0')}`}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Umur
                      </label>
                      <input
                        type="number"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Umur"
                        value={newPatient.age}
                        onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jenis Kelamin
                      </label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        value={newPatient.gender}
                        onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                      >
                        <option value="">Pilih jenis kelamin</option>
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jenis Penjamin
                      </label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        value={newPatient.insuranceType}
                        onChange={(e) => setNewPatient({ ...newPatient, insuranceType: e.target.value })}
                      >
                        <option value="">Pilih penjamin</option>
                        <option value="BPJS">BPJS</option>
                        <option value="Pribadi">Pribadi</option>
                        <option value="Asuransi Swasta">Asuransi Swasta</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GDS Awal
                      </label>
                      <input
                        type="number"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="mg/dL"
                        value={newPatient.bloodSugar}
                        onChange={(e) => setNewPatient({ ...newPatient, bloodSugar: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mt-6 space-x-4">
                    <button
                      type="submit"
                      className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Simpan Pasien
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddPatient(false)}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >Batal
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">Daftar Pasien</h3>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Cari pasien..."
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-full md:w-64 text-gray-700"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                      <button
                        onClick={() => setShowAddPatient(true)}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap"
                      >
                        <Plus className="w-4 h-4" />
                        Pasien Baru
                      </button>
                    </div>
                  </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          No.RM
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Nama
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Umur/Gender
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Penjamin
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          GDS Terakhir
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPatients.map((patient) => (
                        <tr key={patient.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {patient.insuranceType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`text-sm font-medium ${patient.bloodSugar.value > 140 ? "text-red-600" : "text-green-600"
                                }`}
                            >
                              {patient.bloodSugar.value} mg/dL
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                patient.status
                              )}`}
                            >
                              {patient.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            <button className="text-gray-600 hover:text-gray-900 font-medium inline-flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>Detail</span>
                            </button>
                            <button className="text-blue-600 hover:text-blue-900 font-medium inline-flex items-center space-x-1">
                              <Edit className="h-4 w-4" />
                              <span>Edit</span>
                            </button>
                            <button className="text-red-600 hover:text-red-900 font-medium inline-flex items-center space-x-1">
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card Layout */}
                <div className="lg:hidden space-y-4 p-4">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-lg">
                            {patient.name}
                          </h4>
                          <p className="text-sm text-gray-600">No.RM: {patient.mrNumber}</p>
                          <p className="text-sm text-gray-600">
                            {patient.age} / {patient.gender}
                          </p>
                        </div>
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            patient.status
                          )}`}
                        >
                          {patient.status}
                        </span>
                      </div>

                      {/* Info tambahan */}
                      <div className="mb-4 space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Penjamin: </span>
                          {patient.insuranceType}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">GDS Terakhir: </span>
                          <span
                            className={`font-medium ${patient.bloodSugar.value > 140
                              ? "text-red-600"
                              : "text-green-600"
                              }`}
                          >
                            {patient.bloodSugar.value} mg/dL
                          </span>
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>Detail</span>
                        </button>
                        <button className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors flex items-center justify-center space-x-1">
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                        <button className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-red-200 transition-colors flex items-center justify-center space-x-1">
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {filteredPatients.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>{searchTerm ? "Tidak ada pasien yang ditemukan" : "Belum ada data pasien"}</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

        )}

        {/* Nutrition Tab */}
        {activeTab === 'nutrition' && (
          <div className="space-y-6">
            {/* Nutrition Overview Cards - menggunakan data dari utility functions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Rata-rata Kepatuhan</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {nutritionAnalytics.averageCompliance}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pasien dengan Rencana</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {nutritionAnalytics.patientsWithPlan}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Kepatuhan Rendah</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {nutritionAnalytics.lowCompliance}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Activity className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">BMI {">"} 25</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {nutritionAnalytics.bmiCategories.overweight.length + nutritionAnalytics.bmiCategories.obese.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pharmacy Tab */}
        {activeTab === 'pharmacy' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Modul Farmasi</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {patients.slice(0, 2).map((patient) => (
                  <div key={patient.id} className="px-6 py-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                        <p className="text-sm text-gray-600">{patient.mrNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">GDS: {patient.bloodSugar.value}</p>
                      </div>
                    </div>

                    {patient.allergies && (
                      <div className="mb-4 p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center text-red-700">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">Alergi</span>
                        </div>
                        <p className="text-sm text-red-600 mt-1">
                          {patient.allergies.join(' - ')}
                        </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-900">Obat Aktif</h5>
                      {patient.medications.map((medication) => (
                        <div key={medication.id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{medication.name}</p>
                              <p className="text-sm text-gray-600">{medication.frequency}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Mulai: {medication.startDate}</p>
                            </div>
                          </div>

                          {medication.interactions && medication.interactions.length > 0 && (
                            <div className="mt-2 p-2 bg-orange-50 rounded border border-orange-200">
                              <p className="text-xs text-orange-800">
                                Potensi interaksi: {medication.interactions.join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Nursing Tab */}
        {activeTab === 'nursing' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Modul Keperawatan</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {patients.slice(0, 4).map((patient) => (
                  <div key={patient.id} className="px-6 py-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                        <p className="text-sm text-gray-600">{patient.mrNumber}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">GDS: {patient.bloodSugar.value}</span>
                        <button
                          onClick={() => setShowVitalInput(patient.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Input Vital
                        </button>
                      </div>
                    </div>

                    {showVitalInput === patient.id && (
                      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-3">Input Vital Signs</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">GDS</label>
                            <input
                              type="number"
                              placeholder="mg/dL"
                              className="w-full px-2 py-1 border rounded text-sm"
                              value={vitalInputs[patient.id]?.bloodSugar || ''}
                              onChange={(e) => handleVitalInput(patient.id, 'bloodSugar', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">TD Sistolik</label>
                            <input
                              type="number"
                              placeholder="mmHg"
                              className="w-full px-2 py-1 border rounded text-sm"
                              value={vitalInputs[patient.id]?.systolic || ''}
                              onChange={(e) => handleVitalInput(patient.id, 'systolic', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">TD Diastolik</label>
                            <input
                              type="number"
                              placeholder="mmHg"
                              className="w-full px-2 py-1 border rounded text-sm"
                              value={vitalInputs[patient.id]?.diastolic || ''}
                              onChange={(e) => handleVitalInput(patient.id, 'diastolic', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Nadi</label>
                            <input
                              type="number"
                              placeholder="bpm"
                              className="w-full px-2 py-1 border rounded text-sm"
                              value={vitalInputs[patient.id]?.heartRate || ''}
                              onChange={(e) => handleVitalInput(patient.id, 'heartRate', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="mt-3 space-x-2">
                          <button
                            onClick={() => saveVitals(patient.id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => setShowVitalInput(null)}
                            className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-2xl font-bold text-blue-700">{patient.bloodSugar.value} mg/dL</p>
                        <p className="text-xs text-blue-600">GDS</p>
                      </div>

                      <div className="bg-red-50 p-3 rounded-lg">
                        <p className="text-2xl font-bold text-red-700">{patient.vitalSigns.bloodPressure}</p>
                        <p className="text-xs text-red-600">TD</p>
                      </div>

                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-2xl font-bold text-green-700">{patient.vitalSigns.heartRate} bpm</p>
                        <p className="text-xs text-green-600">Nadi</p>
                      </div>

                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-2xl font-bold text-purple-700">{patient.bmi}</p>
                        <p className="text-xs text-purple-600">IMT</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div >
  );
};

export default DoctorDashboard;