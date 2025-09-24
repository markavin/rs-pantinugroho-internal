import React, { useState, useEffect } from 'react';
import { Search, Plus, Bell, User, Calendar, Activity, TrendingUp, AlertCircle, FileText, Pill, Users, HeartPulse, Stethoscope, ClipboardList, Edit, Eye, Trash, Trash2, Menu, X, UserCheck } from 'lucide-react';
import HandledPatientForm from './HandledPatientForm'; // Import the separate form component

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
  status: 'ACTIVE' | 'INACTIVE' | 'RUJUK_BALIK' | 'SELESAI' | 'FOLLOW_UP';
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

interface HandledPatient {
  id: string;
  patientId: string;
  handledBy: string;
  handledDate: string;
  diagnosis?: string;
  treatmentPlan?: string;
  notes?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'TRANSFERRED' | 'DISCONTINUED' | 'ON_HOLD';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  nextVisitDate?: string;
  estimatedDuration?: string;
  specialInstructions?: string;
  patient: Patient;
  handler: {
    name: string;
    role: string;
    employeeId?: string;
  };
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

const DoctorDashboard = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [handledPatients, setHandledPatients] = useState<HandledPatient[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [handledSearchTerm, setHandledSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'handled-patients' | 'nutrition' | 'pharmacy' | 'nursing'>('dashboard');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedHandledPatient, setSelectedHandledPatient] = useState<HandledPatient | null>(null);
  const [showPatientDetail, setShowPatientDetail] = useState(false);
  const [showHandledPatientForm, setShowHandledPatientForm] = useState(false);
  const [handledPatientFormMode, setHandledPatientFormMode] = useState<'add' | 'edit' | 'view'>('add');

  // Mock alerts data
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
    }
  ];

  // Fetch patients from database
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

  // Fetch handled patients from database
  const fetchHandledPatients = async () => {
    try {
      const response = await fetch('/api/handled-patients');
      if (response.ok) {
        const data = await response.json();
        setHandledPatients(data);
      } else {
        console.error('Failed to fetch handled patients');
      }
    } catch (error) {
      console.error('Error fetching handled patients:', error);
    }
  };

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPatients(), fetchHandledPatients()]);
      setAlerts(mockAlerts);
      setLoading(false);
    };
    loadData();
  }, []);

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

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-orange-100 text-orange-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'TRANSFERRED': return 'bg-purple-100 text-purple-800';
      case 'DISCONTINUED': return 'bg-red-100 text-red-800';
      case 'ON_HOLD': return 'bg-yellow-100 text-yellow-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'RUJUK_BALIK': return 'bg-blue-100 text-blue-800';
      case 'SELESAI': return 'bg-green-100 text-green-800';
      case 'FOLLOW_UP': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'NORMAL': return 'bg-green-100 text-green-800';
      case 'LOW': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase().trim();
    return patient.name.toLowerCase().includes(searchLower) ||
           patient.mrNumber.toLowerCase().includes(searchLower);
  });

  const filteredHandledPatients = handledPatients.filter(handledPatient => {
    const searchLower = handledSearchTerm.toLowerCase().trim();
    const matchesSearch = handledPatient.patient.name.toLowerCase().includes(searchLower) ||
                         handledPatient.patient.mrNumber.toLowerCase().includes(searchLower) ||
                         handledPatient.diagnosis?.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === 'ALL' || handledPatient.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || handledPatient.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const refreshData = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchPatients(), fetchHandledPatients()]);
    setIsRefreshing(false);
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientDetail(true);
  };

  const handleAddHandledPatient = () => {
    setSelectedHandledPatient(null);
    setHandledPatientFormMode('add');
    setShowHandledPatientForm(true);
  };

  const handleEditHandledPatient = (handledPatient: HandledPatient) => {
    setSelectedHandledPatient(handledPatient);
    setHandledPatientFormMode('edit');
    setShowHandledPatientForm(true);
  };

  const handleViewHandledPatient = (handledPatient: HandledPatient) => {
    setSelectedHandledPatient(handledPatient);
    setHandledPatientFormMode('view');
    setShowHandledPatientForm(true);
  };

  const handleHandledPatientFormSubmit = async (formData) => {
    try {
      if (handledPatientFormMode === 'add') {
        const response = await fetch('/api/handled-patients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            nextVisitDate: formData.nextVisitDate || undefined
          }),
        });

        if (response.ok) {
          await fetchHandledPatients();
          alert('Pasien berhasil ditambahkan ke daftar yang ditangani!');
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to add handled patient');
        }
      } else if (handledPatientFormMode === 'edit') {
        const response = await fetch(`/api/handled-patients/${selectedHandledPatient.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            nextVisitDate: formData.nextVisitDate || undefined
          }),
        });

        if (response.ok) {
          await fetchHandledPatients();
          alert('Data pasien berhasil diperbarui!');
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to update handled patient');
        }
      }
      setShowHandledPatientForm(false);
    } catch (error) {
      console.error('Error submitting handled patient form:', error);
      alert('Error submitting form');
    }
  };

  const handleDeleteHandledPatient = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pasien dari daftar yang ditangani?')) return;

    try {
      const response = await fetch(`/api/handled-patients/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchHandledPatients();
        alert('Pasien berhasil dihapus dari daftar yang ditangani!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete handled patient');
      }
    } catch (error) {
      console.error('Error deleting handled patient:', error);
      alert('Error deleting handled patient');
    }
  };

  const navigationItems = [
    { key: 'dashboard', label: 'Dashboard', icon: Activity },
    { key: 'patients', label: 'Data Pasien', icon: Users },
    { key: 'handled-patients', label: 'Pasien Ditangani', icon: UserCheck },
    { key: 'nutrition', label: 'Gizi', icon: TrendingUp },
    { key: 'pharmacy', label: 'Farmasi', icon: Pill },
    { key: 'nursing', label: 'Keperawatan', icon: HeartPulse }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu Dokter</h2>
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
                onClick={() => {
                  setActiveTab(item.key as any);
                  setIsMobileSidebarOpen(false);
                }}
                className={`flex items-center space-x-3 w-full p-3 rounded-lg font-medium text-sm transition-colors ${activeTab === item.key
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
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm border border-gray-200"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm border border-green-500 text-sm text-gray-600 hover:bg-green-50 transition-colors disabled:opacity-50"
          >
            {isRefreshing ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full mr-2"></div>
                <span>Refreshing...</span>
              </>
            ) : (
              <>
                <Activity className="h-4 w-4 mr-2 text-green-600" />
                <span>Refresh</span>
              </>
            )}
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-end mb-6">
          <button
            onClick={refreshData}
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

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 hidden lg:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-25 px-6 justify-center">
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

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-white to-green-50 p-6 rounded-xl shadow-sm border border-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Total Pasien</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{handledPatients.length}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <UserCheck className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-orange-50 p-6 rounded-xl shadow-sm border border-orange-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Prioritas Tinggi</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {handledPatients.filter(hp => hp.priority === 'HIGH' || hp.priority === 'URGENT').length}
                    </p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <AlertCircle className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-purple-50 p-6 rounded-xl shadow-sm border border-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Total Alerts</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{alerts.length}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Bell className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts Section */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Peringatan & Notifikasi</h3>
              </div>
              <div className="p-6">
                {alerts.length > 0 ? (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                        alert.type === 'CRITICAL' ? 'bg-red-50 border-red-400' :
                        alert.type === 'WARNING' ? 'bg-yellow-50 border-yellow-400' :
                        'bg-green-50 border-green-400'
                      }`}>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                          <span className="text-xs text-gray-500">{alert.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Tidak ada peringatan saat ini</p>
                )}
              </div>
            </div>

            {/* Recent Handled Patients */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Pasien Ditangani Terbaru</h3>
              </div>
              <div className="p-6">
                {handledPatients.length > 0 ? (
                  <div className="space-y-4">
                    {handledPatients.slice(0, 5).map((handledPatient) => (
                      <div key={handledPatient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{handledPatient.patient.name}</p>
                            <p className="text-sm text-gray-500">{handledPatient.patient.mrNumber} | {handledPatient.diagnosis}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(handledPatient.priority)}`}>
                            {handledPatient.priority}
                          </span>
                          <p className="text-xs text-gray-400 mt-1">{new Date(handledPatient.handledDate).toLocaleDateString('id-ID')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <UserCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Belum ada pasien yang ditangani</p>
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
                <h3 className="text-lg font-semibold text-gray-900">Data Pasien</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari pasien..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full md:w-64"
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pasien
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
                      Risiko
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                            <p className="text-xs text-gray-500">{patient.mrNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {calculateAge(patient.birthDate)} / {patient.gender === 'MALE' ? 'L' : 'P'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.insuranceType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                          {patient.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(patient.riskLevel)}`}>
                          {patient.riskLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewPatient(patient)}
                          className="text-green-600 hover:text-green-900 font-medium inline-flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Detail</span>
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
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                        <p className="text-sm text-gray-600">{patient.mrNumber}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                        {patient.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(patient.riskLevel)}`}>
                        {patient.riskLevel}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4 space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Umur:</span> {calculateAge(patient.birthDate)} tahun
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Gender:</span> {patient.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Penjamin:</span> {patient.insuranceType}
                    </p>
                  </div>

                  <button
                    onClick={() => handleViewPatient(patient)}
                    className="w-full bg-green-100 text-green-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-green-200 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Lihat Detail</span>
                  </button>
                </div>
              ))}

              {filteredPatients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Tidak ada pasien yang ditemukan</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'handled-patients' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-lg font-semibold text-gray-900">Pasien Ditangani</h3>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Cari pasien ditangani..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full md:w-64"
                      value={handledSearchTerm}
                      onChange={(e) => setHandledSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  <button
                    onClick={handleAddHandledPatient}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Pasien
                  </button>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 px-6">
              <div className="flex space-x-8 py-3">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    statusFilter === 'ALL'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Semua ({handledPatients.length})
                </button>
                <button
                  onClick={() => setStatusFilter('ACTIVE')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    statusFilter === 'ACTIVE'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Aktif ({handledPatients.filter(hp => hp.status === 'ACTIVE').length})
                </button>
                <button
                  onClick={() => setStatusFilter('COMPLETED')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    statusFilter === 'COMPLETED'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Selesai ({handledPatients.filter(hp => hp.status === 'COMPLETED').length})
                </button>
                <select
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="ALL">Semua Prioritas</option>
                  <option value="URGENT">Urgent</option>
                  <option value="HIGH">Tinggi</option>
                  <option value="NORMAL">Normal</option>
                  <option value="LOW">Rendah</option>
                </select>
              </div>
            </div>

            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pasien
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diagnosis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prioritas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kunjungan Berikutnya
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredHandledPatients.map((handledPatient) => (
                    <tr key={handledPatient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{handledPatient.patient.name}</p>
                            <p className="text-xs text-gray-500">{handledPatient.patient.mrNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {handledPatient.diagnosis || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(handledPatient.status)}`}>
                          {handledPatient.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(handledPatient.priority)}`}>
                          {handledPatient.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {handledPatient.nextVisitDate 
                          ? new Date(handledPatient.nextVisitDate).toLocaleDateString('id-ID')
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => handleViewHandledPatient(handledPatient)}
                          className="text-gray-600 hover:text-gray-900 font-medium inline-flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Detail</span>
                        </button>
                        <button
                          onClick={() => handleEditHandledPatient(handledPatient)}
                          className="text-green-600 hover:text-green-900 font-medium inline-flex items-center space-x-1"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteHandledPatient(handledPatient.id)}
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
              {filteredHandledPatients.map((handledPatient) => (
                <div key={handledPatient.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{handledPatient.patient.name}</h4>
                        <p className="text-sm text-gray-600">{handledPatient.patient.mrNumber}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(handledPatient.status)}`}>
                        {handledPatient.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(handledPatient.priority)}`}>
                        {handledPatient.priority}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4 space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Diagnosis:</span> {handledPatient.diagnosis || 'Belum ditetapkan'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Kunjungan Berikutnya:</span> {
                        handledPatient.nextVisitDate 
                          ? new Date(handledPatient.nextVisitDate).toLocaleDateString('id-ID')
                          : 'Belum dijadwalkan'
                      }
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleViewHandledPatient(handledPatient)}
                      className="bg-gray-100 text-gray-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Detail</span>
                    </button>
                    <button
                      onClick={() => handleEditHandledPatient(handledPatient)}
                      className="bg-green-100 text-green-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-green-200 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteHandledPatient(handledPatient.id)}
                      className="bg-red-100 text-red-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-red-200 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ))}

              {filteredHandledPatients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <UserCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Tidak ada pasien ditangani yang ditemukan</p>
                </div>
              )}
            </div>
          </div>
        )}

        {(activeTab === 'nutrition' || activeTab === 'pharmacy' || activeTab === 'nursing') && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {activeTab === 'nutrition' && 'Manajemen Gizi'}
              {activeTab === 'pharmacy' && 'Manajemen Farmasi'}
              {activeTab === 'nursing' && 'Manajemen Keperawatan'}
            </h2>
            <p className="text-gray-600">Fitur ini sedang dalam pengembangan.</p>
          </div>
        )}
      </div>

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
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Informasi Dasar</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Nama:</span> {selectedPatient.name}</p>
                    <p><span className="font-medium">No. RM:</span> {selectedPatient.mrNumber}</p>
                    <p><span className="font-medium">Umur:</span> {calculateAge(selectedPatient.birthDate)} tahun</p>
                    <p><span className="font-medium">Jenis Kelamin:</span> {selectedPatient.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}</p>
                    <p><span className="font-medium">Telepon:</span> {selectedPatient.phone || '-'}</p>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Informasi Medis</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Penjamin:</span> {selectedPatient.insuranceType}</p>
                    <p><span className="font-medium">Tipe Diabetes:</span> {selectedPatient.diabetesType || '-'}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPatient.status)}`}>
                        {selectedPatient.status}
                      </span>
                    </p>
                    <p><span className="font-medium">Risiko:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(selectedPatient.riskLevel)}`}>
                        {selectedPatient.riskLevel}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {selectedPatient.address && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Alamat</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">{selectedPatient.address}</p>
                  </div>
                </div>
              )}

              {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                    Alergi
                  </h4>
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
                  <h4 className="font-semibold text-gray-900 mb-2">Riwayat Penyakit</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">{selectedPatient.medicalHistory}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Handled Patient Form Modal */}
      <HandledPatientForm
        isOpen={showHandledPatientForm}
        onClose={() => setShowHandledPatientForm(false)}
        onSubmit={handleHandledPatientFormSubmit}
        mode={handledPatientFormMode}
        selectedHandledPatient={selectedHandledPatient}
        availablePatients={patients}
        loading={false}
      />
    </div>
  );
};

export default DoctorDashboard;