'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Bell, User, Calendar, Activity, TrendingUp, AlertCircle, FileText, Pill, Users, HeartPulse, Stethoscope, ClipboardList, Edit, Eye, Trash, Trash2, Menu, X } from 'lucide-react';

interface Patient {
  id: string;
  mrNumber: string;
  name: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE';
  phone?: string;
  address?: string;
  height?: number;
  weight?: number;
  bmi?: number;
  bloodType?: string;
  allergies: string[];
  medicalHistory?: string;
  diabetesType?: string;
  diagnosisDate?: string;
  comorbidities: string[];
  insuranceType: string;
  insuranceNumber?: string;
  lastVisit?: string;
  nextAppointment?: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'ACTIVE' | 'RUJUK_BALIK';
  dietCompliance?: number;
  calorieNeeds?: number;
  calorieRequirement?: number;
  dietPlan?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
  };
  complaints?: PatientComplaint[];
  medications?: Medication[];
  vitalSigns?: VitalSign[];
}

interface PatientComplaint {
  id: string;
  complaint: string;
  severity: 'RINGAN' | 'SEDANG' | 'BERAT';
  status: 'BARU' | 'SELESAI';
  date: string;
}

interface Medication {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: string;
  endDate?: string;
  interactions?: string[];
}

interface VitalSign {
  id: string;
  recordDate: string;
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  temperature?: number;
  bloodGlucose?: number;
  notes?: string;
}

interface Alert {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  patientId?: string;
  timestamp: string;
  category: string;
}

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPatientDetail, setShowPatientDetail] = useState(false);
  const [showEditPatient, setShowEditPatient] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [newPatient, setNewPatient] = useState({
    name: '',
    birthDate: '',
    gender: '',
    phone: '',
    address: '',
    height: '',
    weight: '',
    diabetesType: '',
    insuranceType: '',
    allergies: '',
    medicalHistory: '',
    complaint: '',
    complaintSeverity: 'RINGAN'
  });

  // Calculate age from birth date
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Fetch patients from API
  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients');
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      } else {
        console.error('Failed to fetch patients');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  // Fetch alerts (you'll need to create this API endpoint)
  const fetchAlerts = async () => {
    try {
      // For now, we'll create mock alerts based on patients data
      // You can implement a real alerts API endpoint later
      const mockAlerts: Alert[] = [
        {
          id: '1',
          type: 'CRITICAL',
          message: 'Pasien dengan HbA1c > 9% memerlukan perhatian segera',
          timestamp: '08:30',
          category: 'blood_sugar'
        },
        {
          id: '2', 
          type: 'WARNING',
          message: 'Ada pasien dengan tekanan darah tinggi',
          timestamp: '07:45',
          category: 'vital_signs'
        },
        {
          id: '3',
          type: 'INFO',
          message: '5 pasien memiliki janji kontrol hari ini',
          timestamp: '06:30',
          category: 'appointments'
        }
      ];
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchAlerts();
  }, []);

  const refreshData = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchPatients(), fetchAlerts()]);
    setIsRefreshing(false);
  };

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
      case 'ACTIVE': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'RUJUK_BALIK': return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase().trim();
    const age = calculateAge(patient.birthDate).toString();

    return patient.name.toLowerCase().includes(searchLower) ||
           patient.mrNumber.toLowerCase().includes(searchLower) ||
           age.includes(searchTerm.trim()) ||
           patient.gender.toLowerCase().includes(searchLower) ||
           patient.insuranceType.toLowerCase().includes(searchLower) ||
           patient.status.toLowerCase().includes(searchLower);
  });

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const patientData = {
      name: newPatient.name,
      birthDate: newPatient.birthDate,
      gender: newPatient.gender,
      phone: newPatient.phone || undefined,
      address: newPatient.address || undefined,
      height: newPatient.height ? parseFloat(newPatient.height) : undefined,
      weight: newPatient.weight ? parseFloat(newPatient.weight) : undefined,
      diabetesType: newPatient.diabetesType || undefined,
      insuranceType: newPatient.insuranceType,
      allergies: newPatient.allergies ? newPatient.allergies.split(',').map(a => a.trim()) : [],
      medicalHistory: newPatient.medicalHistory || undefined,
      status: 'ACTIVE',
      complaint: newPatient.complaint || undefined,
      complaintSeverity: newPatient.complaintSeverity
    };

    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (response.ok) {
        await fetchPatients(); // Refresh the patient list
        setNewPatient({
          name: '',
          birthDate: '',
          gender: '',
          phone: '',
          address: '',
          height: '',
          weight: '',
          diabetesType: '',
          insuranceType: '',
          allergies: '',
          medicalHistory: '',
          complaint: '',
          complaintSeverity: 'RINGAN'
        });
        setShowAddPatient(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add patient');
      }
    } catch (error) {
      console.error('Error adding patient:', error);
      alert('Error adding patient');
    }
  };

  const handleEditPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;

    const patientData = {
      name: editingPatient.name,
      birthDate: editingPatient.birthDate,
      gender: editingPatient.gender,
      phone: editingPatient.phone || undefined,
      address: editingPatient.address || undefined,
      height: editingPatient.height || undefined,
      weight: editingPatient.weight || undefined,
      diabetesType: editingPatient.diabetesType || undefined,
      insuranceType: editingPatient.insuranceType,
      allergies: editingPatient.allergies || [],
      medicalHistory: editingPatient.medicalHistory || undefined,
      status: editingPatient.status
    };

    try {
      const response = await fetch(`/api/patients/${editingPatient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (response.ok) {
        await fetchPatients(); // Refresh the patient list
        setEditingPatient(null);
        setShowEditPatient(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update patient');
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('Error updating patient');
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    if (!confirm('Are you sure you want to delete this patient?')) return;

    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchPatients(); // Refresh the patient list
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete patient');
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Error deleting patient');
    }
  };

  const handleViewPatient = async (patientId: string) => {
    try {
      const response = await fetch(`/api/patients/${patientId}`);
      if (response.ok) {
        const patient = await response.json();
        setSelectedPatient(patient);
        setShowPatientDetail(true);
      } else {
        console.error('Failed to fetch patient details');
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
    }
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

  const saveVitals = async (patientId: string) => {
    const vitals = vitalInputs[patientId];
    if (vitals) {
      // Here you would typically save to a vital signs API endpoint
      // For now, we'll just update the local state
      console.log('Saving vitals for patient:', patientId, vitals);
      setShowVitalInput(null);
      setVitalInputs({});
      // You can implement the actual API call to save vital signs here
    }
  };

  const handleTabChange = (tab: 'dashboard' | 'patients' | 'nutrition' | 'pharmacy' | 'nursing') => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
  };

  // Dashboard stats calculated from real data
  const dashboardStats = {
    activePatients: patients.filter(p => p.status === 'ACTIVE').length,
    todayVisits: patients.filter(p => {
      const today = new Date().toISOString().split('T')[0];
      return p.lastVisit === today;
    }).length,
    totalAllergies: patients.reduce((acc, p) => acc + (p.allergies?.length || 0), 0)
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
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-m font-semibold text-gray-900">Menu Dokter</h2>
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
                className={`flex items-center space-x-3 w-full p-3 rounded-lg font-medium text-sm transition-colors ${activeTab === item.key
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
            onClick={refreshData}
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
              onClick={refreshData}
              disabled={isRefreshing}
              className="flex items-center bg-white px-3 md:px-4 py-2 rounded-lg shadow-sm border border-emerald-500 text-xs md:text-sm text-gray-600 hover:bg-emerald-300 transition-colors disabled:opacity-50"
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
                    className={`flex items-center flex-shrink-0 space-x-1 sm:space-x-2 py-2 sm:py-3 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${activeTab === tab.key
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
                          <p className="text-sm font-medium">BMI: {patient.bmi || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{patient.lastVisit}</p>
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

        {/* Patient Detail Modal */}
        {showPatientDetail && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Detail Pasien</h3>
                <button
                  onClick={() => setShowPatientDetail(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Informasi Dasar</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Nama:</span> {selectedPatient.name}</p>
                      <p><span className="font-medium">No. RM:</span> {selectedPatient.mrNumber}</p>
                      <p><span className="font-medium">Umur:</span> {calculateAge(selectedPatient.birthDate)} tahun</p>
                      <p><span className="font-medium">Jenis Kelamin:</span> {selectedPatient.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}</p>
                      <p><span className="font-medium">Telepon:</span> {selectedPatient.phone || '-'}</p>
                      <p><span className="font-medium">Alamat:</span> {selectedPatient.address || '-'}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Informasi Medis</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Tinggi:</span> {selectedPatient.height || '-'} cm</p>
                      <p><span className="font-medium">Berat:</span> {selectedPatient.weight || '-'} kg</p>
                      <p><span className="font-medium">BMI:</span> {selectedPatient.bmi || '-'}</p>
                      <p><span className="font-medium">Golongan Darah:</span> {selectedPatient.bloodType || '-'}</p>
                      <p><span className="font-medium">Tipe DM:</span> {selectedPatient.diabetesType || '-'}</p>
                      <p><span className="font-medium">Status:</span> {selectedPatient.status}</p>
                    </div>
                  </div>
                </div>
                
                {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Alergi</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPatient.allergies.map((allergy, index) => (
                        <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPatient.medicalHistory && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Riwayat Medis</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedPatient.medicalHistory}</p>
                  </div>
                )}

                {selectedPatient.complaints && selectedPatient.complaints.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Keluhan</h4>
                    <div className="space-y-2">
                      {selectedPatient.complaints.map((complaint) => (
                        <div key={complaint.id} className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">{complaint.complaint}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              complaint.severity === 'BERAT' ? 'bg-red-100 text-red-800' :
                              complaint.severity === 'SEDANG' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {complaint.severity}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{new Date(complaint.date).toLocaleDateString('id-ID')}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                        Nama Lengkap *
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
                        Tanggal Lahir *
                      </label>
                      <input
                        type="date"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        value={newPatient.birthDate}
                        onChange={(e) => setNewPatient({ ...newPatient, birthDate: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jenis Kelamin *
                      </label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        value={newPatient.gender}
                        onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                      >
                        <option value="">Pilih jenis kelamin</option>
                        <option value="MALE">Laki-laki</option>
                        <option value="FEMALE">Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jenis Penjamin *
                      </label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        value={newPatient.insuranceType}
                        onChange={(e) => setNewPatient({ ...newPatient, insuranceType: e.target.value })}
                      >
                        <option value="">Pilih penjamin</option>
                        <option value="BPJS">BPJS</option>
                        <option value="PRIVATE">Pribadi</option>
                        <option value="CORPORATE">Asuransi Swasta</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telepon
                      </label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="08xxxxxxxxx"
                        value={newPatient.phone}
                        onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tinggi Badan (cm)
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="170"
                        value={newPatient.height}
                        onChange={(e) => setNewPatient({ ...newPatient, height: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Berat Badan (kg)
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="70"
                        value={newPatient.weight}
                        onChange={(e) => setNewPatient({ ...newPatient, weight: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipe Diabetes
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        value={newPatient.diabetesType}
                        onChange={(e) => setNewPatient({ ...newPatient, diabetesType: e.target.value })}
                      >
                        <option value="">Pilih tipe diabetes</option>
                        <option value="Tipe 1">Tipe 1</option>
                        <option value="Tipe 2">Tipe 2</option>
                        <option value="Gestational">Gestational</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alamat
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        rows={3}
                        placeholder="Alamat lengkap"
                        value={newPatient.address}
                        onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alergi (pisahkan dengan koma)
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Contoh: Sulfa, Penisilin, Seafood"
                        value={newPatient.allergies}
                        onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Riwayat Medis
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        rows={3}
                        placeholder="Riwayat penyakit sebelumnya"
                        value={newPatient.medicalHistory}
                        onChange={(e) => setNewPatient({ ...newPatient, medicalHistory: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Keluhan Utama
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Keluhan pasien saat ini"
                        value={newPatient.complaint}
                        onChange={(e) => setNewPatient({ ...newPatient, complaint: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tingkat Keluhan
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        value={newPatient.complaintSeverity}
                        onChange={(e) => setNewPatient({ ...newPatient, complaintSeverity: e.target.value })}
                      >
                        <option value="RINGAN">Ringan</option>
                        <option value="SEDANG">Sedang</option>
                        <option value="BERAT">Berat</option>
                      </select>
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
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Edit Patient Modal */}
            {showEditPatient && editingPatient && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">Edit Pasien</h3>
                    <button
                      onClick={() => {
                        setShowEditPatient(false);
                        setEditingPatient(null);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <form onSubmit={handleEditPatient} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nama Lengkap *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          value={editingPatient.name}
                          onChange={(e) => setEditingPatient({ ...editingPatient, name: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Jenis Kelamin *
                        </label>
                        <select
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          value={editingPatient.gender}
                          onChange={(e) => setEditingPatient({ ...editingPatient, gender: e.target.value as 'MALE' | 'FEMALE' })}
                        >
                          <option value="MALE">Laki-laki</option>
                          <option value="FEMALE">Perempuan</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Telepon
                        </label>
                        <input
                          type="tel"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          value={editingPatient.phone || ''}
                          onChange={(e) => setEditingPatient({ ...editingPatient, phone: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Jenis Penjamin *
                        </label>
                        <select
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          value={editingPatient.insuranceType}
                          onChange={(e) => setEditingPatient({ ...editingPatient, insuranceType: e.target.value })}
                        >
                          <option value="BPJS">BPJS</option>
                          <option value="PRIVATE">Pribadi</option>
                          <option value="CORPORATE">Asuransi Swasta</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status *
                        </label>
                        <select
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          value={editingPatient.status}
                          onChange={(e) => setEditingPatient({ ...editingPatient, status: e.target.value as 'ACTIVE' | 'RUJUK_BALIK' })}
                        >
                          <option value="ACTIVE">Aktif</option>
                          <option value="RUJUK_BALIK">Rujuk Balik</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Alamat
                        </label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          rows={3}
                          value={editingPatient.address || ''}
                          onChange={(e) => setEditingPatient({ ...editingPatient, address: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditPatient(false);
                          setEditingPatient(null);
                        }}
                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        Simpan Perubahan
                      </button>
                    </div>
                  </form>
                </div>
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
                          BMI
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
                            {patient.mrNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {patient.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {calculateAge(patient.birthDate)}/{patient.gender === 'MALE' ? 'L' : 'P'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {patient.insuranceType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${
                              patient.bmi && patient.bmi > 25 ? "text-red-600" : 
                              patient.bmi && patient.bmi < 18.5 ? "text-yellow-600" : "text-green-600"
                            }`}>
                              {patient.bmi?.toFixed(1) || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(patient.status)}`}>
                              {patient.status === 'ACTIVE' ? 'Aktif' : 'Rujuk Balik'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            <button 
                              onClick={() => handleViewPatient(patient.id)}
                              className="text-gray-600 hover:text-gray-900 font-medium inline-flex items-center space-x-1"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Detail</span>
                            </button>
                            <button 
                              onClick={() => {
                                setEditingPatient(patient);
                                setShowEditPatient(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 font-medium inline-flex items-center space-x-1"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Edit</span>
                            </button>
                            <button 
                              onClick={() => handleDeletePatient(patient.id)}
                              className="text-red-600 hover:text-red-900 font-medium inline-flex items-center space-x-1"
                            >
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
                    <div key={patient.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-lg">{patient.name}</h4>
                          <p className="text-sm text-gray-600">No.RM: {patient.mrNumber}</p>
                          <p className="text-sm text-gray-600">
                            {calculateAge(patient.birthDate)} / {patient.gender === 'MALE' ? 'L' : 'P'}
                          </p>
                        </div>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(patient.status)}`}>
                          {patient.status === 'ACTIVE' ? 'Aktif' : 'Rujuk Balik'}
                        </span>
                      </div>

                      {/* Info tambahan */}
                      <div className="mb-4 space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Penjamin: </span>
                          {patient.insuranceType}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">BMI: </span>
                          <span className={`font-medium ${
                            patient.bmi && patient.bmi > 25 ? "text-red-600" : 
                            patient.bmi && patient.bmi < 18.5 ? "text-yellow-600" : "text-green-600"
                          }`}>
                            {patient.bmi?.toFixed(1) || 'N/A'}
                          </span>
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewPatient(patient.id)}
                          className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Detail</span>
                        </button>
                        <button 
                          onClick={() => {
                            setEditingPatient(patient);
                            setShowEditPatient(true);
                          }}
                          className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors flex items-center justify-center space-x-1"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDeletePatient(patient.id)}
                          className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-red-200 transition-colors flex items-center justify-center space-x-1"
                        >
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
            {/* Nutrition Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Rata-rata BMI</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {patients.length > 0 ? 
                        (patients.reduce((acc, p) => acc + (p.bmi || 0), 0) / patients.filter(p => p.bmi).length).toFixed(1) : 
                        'N/A'
                      }
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
                    <p className="text-sm font-medium text-gray-600">Pasien Obesitas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {patients.filter(p => p.bmi && p.bmi >= 30).length}
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
                    <p className="text-sm font-medium text-gray-600">Risiko Tinggi</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {patients.filter(p => p.riskLevel === 'HIGH').length}
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
                    <p className="text-sm font-medium text-gray-600">DM Tipe 2</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {patients.filter(p => p.diabetesType === 'Tipe 2').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Nutrition Analytics */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analisis Nutrisi Pasien</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Kategori BMI</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Underweight (&lt;18.5)</span>
                      <span className="text-sm font-medium">{patients.filter(p => p.bmi && p.bmi < 18.5).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Normal (18.5-24.9)</span>
                      <span className="text-sm font-medium">{patients.filter(p => p.bmi && p.bmi >= 18.5 && p.bmi < 25).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Overweight (25-29.9)</span>
                      <span className="text-sm font-medium">{patients.filter(p => p.bmi && p.bmi >= 25 && p.bmi < 30).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Obesitas (≥30)</span>
                      <span className="text-sm font-medium">{patients.filter(p => p.bmi && p.bmi >= 30).length}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Status Risiko</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-green-600">Risiko Rendah</span>
                      <span className="text-sm font-medium">{patients.filter(p => p.riskLevel === 'LOW').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-yellow-600">Risiko Sedang</span>
                      <span className="text-sm font-medium">{patients.filter(p => p.riskLevel === 'MEDIUM').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-red-600">Risiko Tinggi</span>
                      <span className="text-sm font-medium">{patients.filter(p => p.riskLevel === 'HIGH').length}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Tipe Diabetes</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tipe 1</span>
                      <span className="text-sm font-medium">{patients.filter(p => p.diabetesType === 'Tipe 1').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tipe 2</span>
                      <span className="text-sm font-medium">{patients.filter(p => p.diabetesType === 'Tipe 2').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Gestational</span>
                      <span className="text-sm font-medium">{patients.filter(p => p.diabetesType === 'Gestational').length}</span>
                    </div>
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
                {patients.slice(0, 4).map((patient) => (
                  <div key={patient.id} className="px-6 py-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                        <p className="text-sm text-gray-600">{patient.mrNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">BMI: {patient.bmi?.toFixed(1) || 'N/A'}</p>
                        <p className="text-sm">Tipe: {patient.diabetesType || 'N/A'}</p>
                      </div>
                    </div>

                    {patient.allergies && patient.allergies.length > 0 && (
                      <div className="mb-4 p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center text-red-700">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">Alergi</span>
                        </div>
                        <p className="text-sm text-red-600 mt-1">
                          {patient.allergies.join(', ')}
                        </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-900">Informasi Medis</h5>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-900">Status Pasien</p>
                            <p className="text-gray-600">{patient.status === 'ACTIVE' ? 'Aktif' : 'Rujuk Balik'}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Risiko Level</p>
                            <p className={`${
                              patient.riskLevel === 'HIGH' ? 'text-red-600' :
                              patient.riskLevel === 'MEDIUM' ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {patient.riskLevel === 'HIGH' ? 'Tinggi' :
                               patient.riskLevel === 'MEDIUM' ? 'Sedang' : 'Rendah'}
                            </p>
                          </div>
                        </div>
                        
                        {patient.medicalHistory && (
                          <div className="mt-3">
                            <p className="font-medium text-gray-900">Riwayat Medis</p>
                            <p className="text-gray-600 text-sm">{patient.medicalHistory}</p>
                          </div>
                        )}
                      </div>
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
                        <span className="text-sm">BMI: {patient.bmi?.toFixed(1) || 'N/A'}</span>
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
                            <label className="block text-xs text-gray-600 mb-1">Gula Darah</label>
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
                        <p className="text-2xl font-bold text-blue-700">{patient.bmi?.toFixed(1) || 'N/A'}</p>
                        <p className="text-xs text-blue-600">BMI</p>
                      </div>

                      <div className="bg-red-50 p-3 rounded-lg">
                        <p className="text-2xl font-bold text-red-700">
                          {patient.height && patient.weight ? 
                            `${patient.height}cm` : 'N/A'
                          }
                        </p>
                        <p className="text-xs text-red-600">Tinggi</p>
                      </div>

                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-2xl font-bold text-green-700">
                          {patient.weight ? `${patient.weight}kg` : 'N/A'}
                        </p>
                        <p className="text-xs text-green-600">Berat</p>
                      </div>

                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-2xl font-bold text-purple-700">
                          {patient.riskLevel === 'HIGH' ? 'Tinggi' :
                           patient.riskLevel === 'MEDIUM' ? 'Sedang' : 'Rendah'}
                        </p>
                        <p className="text-xs text-purple-600">Risiko</p>
                      </div>
                    </div>

                    {/* Patient complaints if any */}
                    {patient.complaints && patient.complaints.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium text-gray-900 mb-2">Keluhan Aktif</h5>
                        <div className="space-y-2">
                          {patient.complaints.slice(0, 2).map((complaint) => (
                            <div key={complaint.id} className="bg-yellow-50 border border-yellow-200 p-2 rounded text-sm">
                              <span className="font-medium">{complaint.complaint}</span>
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                complaint.severity === 'BERAT' ? 'bg-red-100 text-red-800' :
                                complaint.severity === 'SEDANG' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {complaint.severity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;