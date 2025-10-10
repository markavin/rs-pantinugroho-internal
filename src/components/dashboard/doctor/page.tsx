import React, { useState, useEffect } from 'react';
import { Search, Plus, Bell, User, Calendar, Activity, TrendingUp, AlertCircle, FileText, Pill, Users, HeartPulse, Stethoscope, ClipboardList, Edit, Eye, Trash, Trash2, Menu, X, UserCheck, Clock } from 'lucide-react';
import HandledPatientForm from './HandledPatientForm';
import SplashScreen from '@/components/SplashScreen';

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
  status: 'AKTIF' | 'RAWAT_JALAN' | 'RAWAT_INAP' | 'RUJUK_KELUAR' | 'PULANG' | 'PULANG_PAKSA' | 'MENINGGAL';
  dietCompliance?: number;
  calorieNeeds?: number;
  calorieRequirement?: number;
  dietPlan?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
  };
}

interface HandledPatient {
  id: string;
  patientId: string;
  handledBy: string;
  handledDate: string;
  diagnosis?: string;
  treatmentPlan?: string;
  notes?: string;
  status: 'ANTRIAN' | 'SEDANG_DITANGANI' | 'KONSULTASI' | 'OBSERVASI' | 'EMERGENCY' | 'STABIL' | 'RUJUK_KELUAR' | 'SELESAI' | 'MENINGGAL';
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

interface Alert {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  patientId?: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isRead: boolean;
  createdAt: string; 
  patient?: {
    name: string;
    mrNumber: string;
  };
}


const DoctorDashboard = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [handledPatients, setHandledPatients] = useState<HandledPatient[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [handledSearchTerm, setHandledSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'handled-patients' | 'nutrition' | 'pharmacy' | 'nursing'>('dashboard');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [patientStatusFilter, setPatientStatusFilter] = useState<
    'ALL' | 'AKTIF' | 'RAWAT_JALAN' | 'RAWAT_INAP' | 'RUJUK_KELUAR' | 'PULANG' | 'PULANG_PAKSA' | 'MENINGGAL'
  >('ALL');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRefreshSplash, setShowRefreshSplash] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedHandledPatient, setSelectedHandledPatient] = useState<HandledPatient | null>(null);
  const [showPatientDetail, setShowPatientDetail] = useState(false);
  const [showHandledPatientForm, setShowHandledPatientForm] = useState(false);
  const [handledPatientFormMode, setHandledPatientFormMode] = useState<'add' | 'edit' | 'view'>('add');


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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPatients(),
        fetchHandledPatients(),
        fetchAlerts()
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts?role=DOKTER_SPESIALIS&unreadOnly=false');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
        setUnreadAlertsCount(data.filter((a: Alert) => !a.isRead).length);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };
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

  const getPatientStatusColor = (status: string) => {
    switch (status) {
      case 'AKTIF': return 'bg-green-100 text-green-800';
      case 'RAWAT_JALAN': return 'bg-blue-100 text-blue-800';
      case 'RAWAT_INAP': return 'bg-yellow-100 text-yellow-800';
      case 'RUJUK_KELUAR': return 'bg-purple-100 text-purple-800';
      case 'PULANG': return 'bg-gray-100 text-gray-800';
      case 'PULANG_PAKSA': return 'bg-red-100 text-red-800';
      case 'MENINGGAL': return 'bg-black text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHandledStatusColor = (status: string) => {
    switch (status) {
      case 'ANTRIAN': return 'bg-yellow-100 text-yellow-800';
      case 'SEDANG_DITANGANI': return 'bg-blue-100 text-blue-800';
      case 'KONSULTASI': return 'bg-indigo-100 text-indigo-800';
      case 'OBSERVASI': return 'bg-orange-100 text-orange-800';
      case 'EMERGENCY': return 'bg-red-100 text-red-800';
      case 'STABIL': return 'bg-green-100 text-green-800';
      case 'RUJUK_KELUAR': return 'bg-purple-100 text-purple-800';
      case 'SELESAI': return 'bg-gray-100 text-gray-800';
      case 'MENINGGAL': return 'bg-black text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPatientStatusLabel = (status: string) => {
    switch (status) {
      case 'AKTIF': return 'Aktif';
      case 'RAWAT_JALAN': return 'Rawat Jalan';
      case 'RAWAT_INAP': return 'Rawat Inap';
      case 'RUJUK_KELUAR': return 'Rujuk Keluar';
      case 'PULANG': return 'Pulang';
      case 'PULANG_PAKSA': return 'Pulang Paksa';
      case 'MENINGGAL': return 'Meninggal';
      default: return status || 'Aktif';
    }
  };

  const getHandledStatusLabel = (status: string) => {
    switch (status) {
      case 'ANTRIAN': return 'Antrian';
      case 'SEDANG_DITANGANI': return 'Sedang Ditangani';
      case 'KONSULTASI': return 'Konsultasi';
      case 'OBSERVASI': return 'Observasi';
      case 'EMERGENCY': return 'Emergency';
      case 'STABIL': return 'Stabil';
      case 'RUJUK_KELUAR': return 'Rujuk Keluar';
      case 'SELESAI': return 'Selesai';
      case 'MENINGGAL': return 'Meninggal';
      default: return status || 'Sedang Ditangani';
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

  const getFilteredPatients = () => {
    let statusFiltered = patients;

    if (patientStatusFilter !== 'ALL') {
      statusFiltered = patients.filter(patient => {
        return patient.status === patientStatusFilter;
      });
    }

    return statusFiltered.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.mrNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.insuranceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.diabetesType && patient.diabetesType.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const filteredPatients = getFilteredPatients();

  const filteredHandledPatients = handledPatients.filter(handledPatient => {
    const searchLower = handledSearchTerm.toLowerCase().trim();
    const matchesSearch = !searchLower || (
      handledPatient.patient.name.toLowerCase().includes(searchLower) ||
      handledPatient.patient.mrNumber.toLowerCase().includes(searchLower) ||
      (handledPatient.diagnosis && handledPatient.diagnosis.toLowerCase().includes(searchLower))
    );

    let matchesStatus = true;
    if (statusFilter === 'SEDANG_DITANGANI') {
      matchesStatus = ['SEDANG_DITANGANI', 'KONSULTASI', 'OBSERVASI', 'EMERGENCY', 'STABIL'].includes(handledPatient.status);
    } else if (statusFilter === 'SELESAI') {
      matchesStatus = ['SELESAI', 'RUJUK_KELUAR', 'MENINGGAL'].includes(handledPatient.status);
    }

    const matchesPriority = priorityFilter === 'ALL' || handledPatient.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const refreshData = async () => {
    setShowRefreshSplash(true);
    await Promise.all([fetchPatients(), fetchHandledPatients()]);
  };

  const handleRefreshSplashFinish = () => {
    setShowRefreshSplash(false);
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
          headers: { 'Content-Type': 'application/json' },
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            nextVisitDate: formData.nextVisitDate || undefined
          }),
        });

        if (response.ok) {
          await Promise.all([fetchHandledPatients(), fetchPatients()]);
          if (handledPatientFormMode === 'edit' &&
            formData.status === 'SELESAI' &&
            formData.treatmentPlan) {
            await fetch('/api/alerts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'INFO',
                message: `Resep baru untuk pasien ${selectedHandledPatient.patient.name}, segera diproses`,
                patientId: selectedHandledPatient.patientId,
                category: 'MEDICATION',
                priority: 'NORMAL',
                targetRole: 'FARMASI'
              }),
            });
          }
          const relatedAlert = alerts.find(
            a => a.patientId === selectedHandledPatient.patientId && !a.isRead
          );
          if (relatedAlert) {
            await fetch(`/api/alerts/${relatedAlert.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isRead: true }),
            });
          }

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

  const getPatientStatusCounts = () => {
    const activeCount = patients.filter(p => p.status === 'AKTIF').length;
    const rujukBalikCount = patients.filter(p => p.status === 'RUJUK_KELUAR').length;
    const selesaiCount = patients.filter(
      p => p.status === 'PULANG' || p.status === 'PULANG_PAKSA'
    ).length;

    return { activeCount, rujukBalikCount, selesaiCount };
  };

  const { activeCount, rujukBalikCount, selesaiCount } = getPatientStatusCounts();

  const navigationItems = [
    { key: 'dashboard', label: 'Dashboard', icon: Activity },
    { key: 'patients', label: 'Data Pasien', icon: Users },
    { key: 'handled-patients', label: 'Pasien Ditangani', icon: UserCheck },
    { key: 'nutrition', label: 'Gizi', icon: TrendingUp },
    { key: 'pharmacy', label: 'Farmasi', icon: Pill },
    { key: 'nursing', label: 'Keperawatan', icon: HeartPulse }
  ];

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
  //         <p className="text-gray-600">Memuat data...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

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

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-white to-green-50 p-6 rounded-xl shadow-sm border border-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Total Pasien Ditangani</p>
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

              <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-sm border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Pasien Aktif</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{activeCount}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="h-8 w-8 text-blue-600" />
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

            <div className="bg-gradient-to-br from-white to-yellow-50 p-6 rounded-xl shadow-sm border border-yellow-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Antrian Pasien</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {patients.filter(p =>
                      p.status === 'AKTIF' &&
                      !handledPatients.some(hp =>
                        hp.patientId === p.id &&
                        ['SEDANG_DITANGANI', 'KONSULTASI', 'OBSERVASI', 'EMERGENCY'].includes(hp.status)
                      )
                    ).length}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </div>

            // CARI bagian "Peringatan & Notifikasi" dan GANTI dengan:
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Peringatan & Notifikasi</h3>
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                  {unreadAlertsCount} Belum Dibaca
                </span>
              </div>
              <div className="p-6">
                {alerts.length > 0 ? (
                  <div className="space-y-3">
                    {alerts.slice(0, 5).map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3 rounded-lg border-l-4 ${alert.type === 'CRITICAL' ? 'bg-red-50 border-red-400' :
                          alert.type === 'WARNING' ? 'bg-yellow-50 border-yellow-400' :
                            'bg-green-50 border-green-400'
                          } ${!alert.isRead ? 'ring-2 ring-blue-200' : 'opacity-60'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                            {alert.patient && (
                              <p className="text-xs text-gray-600 mt-1">
                                {alert.patient.name} ({alert.patient.mrNumber})
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {!alert.isRead && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                Baru
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {new Date(alert.createdAt).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Tidak ada peringatan saat ini</p>
                )}
              </div>
            </div>

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
                      Tipe Diabetes
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.diabetesType || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPatientStatusColor(patient.status)}`}>
                          {getPatientStatusLabel(patient.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(patient.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewPatient(patient)}
                          className="text-gray-600 hover:text-gray-900 font-medium inline-flex items-center space-x-1"
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
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-lg">{patient.name}</h4>
                      <p className="text-sm text-gray-600">RM: {patient.mrNumber}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPatientStatusColor(patient.status)}`}>
                      {getPatientStatusLabel(patient.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-600 font-medium">Umur/Gender:</span>
                      <br />
                      <span className="text-gray-900">
                        {calculateAge(patient.birthDate)} tahun / {patient.gender === 'MALE' ? 'L' : 'P'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Penjamin:</span>
                      <br />
                      <span className="text-gray-900">{patient.insuranceType}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Diabetes:</span>
                      <br />
                      <span className="text-gray-900">{patient.diabetesType || 'Tidak ada'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Tgl Daftar:</span>
                      <br />
                      <span className="text-gray-900">{new Date(patient.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
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

        {showPatientDetail && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-green-50">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Stethoscope className="h-6 w-6 mr-2 text-green-600" />
                  Detail Pasien
                </h3>
                <button
                  onClick={() => setShowPatientDetail(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {selectedPatient.name}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Kelamin
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {selectedPatient.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Lahir
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {new Date(selectedPatient.birthDate).toLocaleDateString('id-ID')} ({calculateAge(selectedPatient.birthDate)} tahun)
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Penjamin
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {selectedPatient.insuranceType}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status Pasien
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPatientStatusColor(selectedPatient.status)}`}>
                        {getPatientStatusLabel(selectedPatient.status)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Telepon
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {selectedPatient.phone || '-'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tinggi Badan
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {selectedPatient.height ? `${selectedPatient.height} cm` : '-'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Berat Badan
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {selectedPatient.weight ? `${selectedPatient.weight} kg` : '-'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipe Diabetes
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {selectedPatient.diabetesType || '-'}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat Lengkap
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {selectedPatient.address || '-'}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Riwayat Penyakit
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {selectedPatient.medicalHistory || '-'}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alergi
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedPatient.allergies.map((allergy, index) => (
                            <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                              {allergy}
                            </span>
                          ))}
                        </div>
                      ) : (
                        'Tidak ada alergi yang tercatat'
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      No. Medical Record
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {selectedPatient.mrNumber}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Registrasi
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {new Date(selectedPatient.createdAt).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowPatientDetail(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Tutup
                </button>
              </div>
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
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${statusFilter === 'ALL'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Semua ({handledPatients.length})
                </button>
                <button
                  onClick={() => setStatusFilter('SEDANG_DITANGANI')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${statusFilter === 'SEDANG_DITANGANI'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Sedang Ditangani ({handledPatients.filter(hp => ['SEDANG_DITANGANI', 'KONSULTASI', 'OBSERVASI', 'EMERGENCY', 'STABIL'].includes(hp.status)).length})
                </button>
                <button
                  onClick={() => setStatusFilter('SELESAI')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${statusFilter === 'SELESAI'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Riwayat ({handledPatients.filter(hp => ['SELESAI', 'RUJUK_KELUAR', 'MENINGGAL'].includes(hp.status)).length})
                </button>
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
                      Ditangani Sejak
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHandledStatusColor(handledPatient.status)}`}>
                          {getHandledStatusLabel(handledPatient.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(handledPatient.priority)}`}>
                          {handledPatient.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(handledPatient.handledDate).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => handleViewHandledPatient(handledPatient)}
                          className=" text-gray-600 hover:text-gray-900 font-medium inline-flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Detail</span>
                        </button>
                        <button
                          onClick={() => handleEditHandledPatient(handledPatient)}
                          className="text-blue-600 hover:text-blue-900 font-medium inline-flex items-center space-x-1"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteHandledPatient(handledPatient.id)}
                          className=" text-red-600 hover:text-red-900 font-medium inline-flex items-center space-x-1"
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
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHandledStatusColor(handledPatient.status)}`}>
                        {getHandledStatusLabel(handledPatient.status)}
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
                      <span className="font-medium">Ditangani sejak:</span> {new Date(handledPatient.handledDate).toLocaleDateString('id-ID')}
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

      <HandledPatientForm
        isOpen={showHandledPatientForm}
        onClose={() => setShowHandledPatientForm(false)}
        onSubmit={handleHandledPatientFormSubmit}
        mode={handledPatientFormMode}
        selectedHandledPatient={selectedHandledPatient}
        availablePatients={patients}
        handledPatients={handledPatients}
        loading={false}
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

export default DoctorDashboard;