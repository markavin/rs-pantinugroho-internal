import React, { useState, useEffect } from 'react';
import { Search, Plus, Bell, User, Calendar, Activity, TrendingUp, AlertCircle, FileText, Pill, Users, HeartPulse, Stethoscope, ClipboardList, Edit, Eye, Trash, Trash2, Menu, X, UserCheck, Clock, ChevronRight, ChevronLeft, History as HistoryIcon } from 'lucide-react';
import HandledPatientForm from './HandledPatientForm';
import DetailHandledPatientModal from './DetailHandledPatientModal';
import SplashScreen from '@/components/SplashScreen';
import SystemHistoryView from '../SystemHistoryView';

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'handled-patients' | 'system-history'>('dashboard');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [patientStatusFilter, setPatientStatusFilter] = useState<'ALL' | 'AKTIF' | 'RAWAT_JALAN' | 'RAWAT_INAP' | 'RUJUK_KELUAR' | 'PULANG' | 'PULANG_PAKSA' | 'MENINGGAL'>('ALL');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRefreshSplash, setShowRefreshSplash] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedHandledPatient, setSelectedHandledPatient] = useState<HandledPatient | null>(null);
  const [showPatientDetail, setShowPatientDetail] = useState(false);
  const [showHandledPatientForm, setShowHandledPatientForm] = useState(false);
  const [handledPatientFormMode, setHandledPatientFormMode] = useState<'add' | 'edit'>('add');
  const [patientHandledHistory, setPatientHandledHistory] = useState<HandledPatient[]>([]);
  const [loadingPatientHistory, setLoadingPatientHistory] = useState(false);
  const [showDetailHandledModal, setShowDetailHandledModal] = useState(false);
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState<Patient | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [handledCurrentPage, setHandledCurrentPage] = useState(1);
  const [handledItemsPerPage, setHandledItemsPerPage] = useState(10);

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

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts?role=DOKTER_SPESIALIS&unreadOnly=false');
      if (response.ok) {
        const data = await response.json();
        console.log('Alerts fetched for DOKTER_SPESIALIS:', data.length, 'alerts');
        console.log('Alert details:', data);
        setAlerts(data);
        setUnreadAlertsCount(data.filter((a: Alert) => !a.isRead).length);
      } else {
        console.error('Failed to fetch alerts:', response.status);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
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

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

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
    } else if (statusFilter === 'RAWAT_JALAN') {
      matchesStatus = handledPatient.patient.status === 'RAWAT_JALAN';
    } else if (statusFilter === 'RAWAT_INAP') {
      matchesStatus = handledPatient.patient.status === 'RAWAT_INAP';
    }

    const matchesPriority = priorityFilter === 'ALL' || handledPatient.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handledTotalPages = Math.ceil(filteredHandledPatients.length / handledItemsPerPage);
  const handledStartIndex = (handledCurrentPage - 1) * handledItemsPerPage;
  const handledEndIndex = handledStartIndex + handledItemsPerPage;
  const paginatedHandledPatients = filteredHandledPatients.slice(handledStartIndex, handledEndIndex);

  const handleHandledPageChange = (page: number) => {
    setHandledCurrentPage(page);
  };

  const handleHandledItemsPerPageChange = (value: number) => {
    setHandledItemsPerPage(value);
    setHandledCurrentPage(1);
  };

  const getHandledPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (handledTotalPages <= maxVisible) {
      for (let i = 1; i <= handledTotalPages; i++) {
        pages.push(i);
      }
    } else {
      if (handledCurrentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(handledTotalPages);
      } else if (handledCurrentPage >= handledTotalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = handledTotalPages - 3; i <= handledTotalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(handledCurrentPage - 1);
        pages.push(handledCurrentPage);
        pages.push(handledCurrentPage + 1);
        pages.push('...');
        pages.push(handledTotalPages);
      }
    }

    return pages;
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  useEffect(() => {
    setHandledCurrentPage(1);
  }, [handledSearchTerm, handledItemsPerPage, statusFilter, priorityFilter]);

  const fetchPatientHandledHistory = async (patientId: string) => {
    setLoadingPatientHistory(true);
    try {
      const response = await fetch(`/api/handled-patients?patientId=${patientId}`);
      if (response.ok) {
        const data = await response.json();
        setPatientHandledHistory(data);
      }
    } catch (error) {
      console.error('Error fetching patient handled history:', error);
    } finally {
      setLoadingPatientHistory(false);
    }
  };

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
    fetchPatientHandledHistory(patient.id);
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

  const handleViewHandledPatientHistory = (handledPatient: HandledPatient) => {
    setSelectedPatientForDetail(handledPatient.patient);
    fetchPatientHandledHistory(handledPatient.patientId);
    setShowDetailHandledModal(true);
  };

  const markRelatedAlertsAsRead = async (patientId: string) => {
    try {
      const alertsResponse = await fetch(`/api/alerts?patientId=${patientId}&targetRole=DOKTER_SPESIALIS&unreadOnly=true`);
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();

        const relevantAlerts = alertsData.filter((alert: any) =>
          !alert.isRead &&
          (
            alert.category === 'SYSTEM' ||
            alert.category === 'LAB_RESULT' ||
            alert.category === 'VITAL_SIGNS' ||
            alert.category === 'NUTRITION'
          )
        );

        await Promise.all(
          relevantAlerts.map((alert: any) =>
            fetch(`/api/alerts/${alert.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isRead: true }),
            })
          )
        );

        console.log(`✅ Marked ${relevantAlerts.length} relevant alerts as read for patient ${patientId}`);
        return relevantAlerts.length;
      }
    } catch (err) {
      console.error('❌ Error marking alerts as read:', err);
      return 0;
    }
  };

  const handleHandledPatientFormSubmit = async (formData) => {
    try {
      const sessionResponse = await fetch('/api/auth/session');
      const sessionData = await sessionResponse.json();
      const doctorName = sessionData?.user?.name || 'Dokter';

      let savedPatientId = null;

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
          const result = await response.json();
          savedPatientId = formData.patientId;

          await fetchHandledPatients();

          const markedCount = await markRelatedAlertsAsRead(savedPatientId);
          await fetchAlerts();

          if (markedCount > 0) {
            console.log(`${markedCount} notifikasi ditandai sebagai terbaca`);
          }

          alert('Pasien berhasil ditambahkan ke daftar yang ditangani!');

          const isInpatient = ['OBSERVASI', 'EMERGENCY'].includes(formData.status);
          if (isInpatient) {
            try {
              let patientName = 'Pasien';
              let patientMRNumber = '';

              const localPatient = patients.find(p => p.id === savedPatientId);
              if (localPatient) {
                patientName = localPatient.name;
                patientMRNumber = localPatient.mrNumber;
                console.log('Patient data from local state:', { patientName, patientMRNumber });
              } else {
                const patientResponse = await fetch(`/api/patients/${savedPatientId}`);

                if (patientResponse.ok) {
                  const patientData = await patientResponse.json();
                  patientName = patientData.name || 'Pasien';
                  patientMRNumber = patientData.mrNumber || '';
                  console.log('Patient data fetched from API:', { patientName, patientMRNumber });
                } else {
                  console.error('Failed to fetch patient data:', patientResponse.status);
                }
              }

              const alertResponse = await fetch('/api/alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'INFO',
                  message: `Pasien rawat inap baru: ${patientName} (${patientMRNumber})\n\nStatus: ${getHandledStatusLabel(formData.status)}\nDiagnosis: ${formData.diagnosis || '-'}\n\n${formData.treatmentPlan ? `Rencana Pengobatan:\n${formData.treatmentPlan}\n\n` : ''}${formData.specialInstructions ? `Instruksi Khusus:\n${formData.specialInstructions}\n\n` : ''}Segera lakukan monitoring dan visitasi rutin.`,
                  patientId: savedPatientId,
                  category: 'SYSTEM',
                  priority: formData.status === 'EMERGENCY' ? 'URGENT' : 'HIGH',
                  targetRole: 'PERAWAT_RUANGAN'
                })
              });

              if (alertResponse.ok) {
                const alertResult = await alertResponse.json();
                console.log('Notification sent successfully:', alertResult);
              } else {
                const errorText = await alertResponse.text();
                console.error('Failed to send notification:', errorText);
              }

              const updateResponse = await fetch(`/api/patients/${savedPatientId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  status: 'RAWAT_INAP'
                })
              });

              if (updateResponse.ok) {
                console.log('Patient status updated to RAWAT_INAP');
                await fetchPatients();
              }
            } catch (alertError) {
              console.error('Error in inpatient notification flow:', alertError);
            }
          }
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
          savedPatientId = selectedHandledPatient.patientId;

          await Promise.all([fetchHandledPatients(), fetchPatients()]);

          const markedCount = await markRelatedAlertsAsRead(savedPatientId);
          await fetchAlerts();

          if (markedCount > 0) {
            console.log(`${markedCount} notifikasi ditandai sebagai terbaca`);
          }

          if (formData.diagnosis?.trim()) {
            try {
              await fetch('/api/medical-reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  patientId: savedPatientId,
                  reportType: formData.status === 'SELESAI' ? 'DISCHARGE_SUMMARY' : 'PROGRESS_NOTE',
                  diagnosis: formData.diagnosis,
                  treatmentPlan: formData.treatmentPlan || null,
                  chiefComplaint: formData.notes || null,
                  recommendations: formData.specialInstructions ? [formData.specialInstructions] : [],
                  prognosis: 'Baik dengan pengobatan teratur'
                }),
              });
            } catch (reportError) {
              console.error('Error creating medical report:', reportError);
            }
          }

          alert('Data pasien berhasil diperbarui!');
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to update handled patient');
        }
      }

      if (savedPatientId && formData.treatmentPlan?.trim()) {
        const treatmentPreview = formData.treatmentPlan.length > 100
          ? formData.treatmentPlan.substring(0, 100) + '...'
          : formData.treatmentPlan;

        let patientName = 'Pasien';
        let patientMRNumber = '';

        const localPatient = patients.find(p => p.id === savedPatientId);
        if (localPatient) {
          patientName = localPatient.name;
          patientMRNumber = localPatient.mrNumber;
        } else {
          try {
            const patientResponse = await fetch(`/api/patients/${savedPatientId}`);
            if (patientResponse.ok) {
              const patientData = await patientResponse.json();
              patientName = patientData.name;
              patientMRNumber = patientData.mrNumber;
            }
          } catch (err) {
            console.error('Error fetching patient for medication alert:', err);
          }
        }

        try {
          await fetch('/api/alerts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'INFO',
              message: `Resep baru dari Dr. ${doctorName} untuk pasien ${patientName} (${patientMRNumber}).\n\nResep:\n${treatmentPreview}\n\nSegera proses di Farmasi.`,
              patientId: savedPatientId,
              category: 'MEDICATION',
              priority: formData.priority === 'URGENT' || formData.priority === 'HIGH' ? 'HIGH' : 'MEDIUM',
              targetRole: 'FARMASI'
            }),
          });

          console.log('Notifikasi resep berhasil dikirim ke Farmasi');
        } catch (alertError) {
          console.error('Error sending alert to pharmacy:', alertError);
        }
      }

      if (savedPatientId && formData.requestLabTests && formData.labTestsRequested?.length > 0) {
        let patientName = 'Pasien';
        let patientMRNumber = '';

        const localPatient = patients.find(p => p.id === savedPatientId);
        if (localPatient) {
          patientName = localPatient.name;
          patientMRNumber = localPatient.mrNumber;
        } else {
          try {
            const patientResponse = await fetch(`/api/patients/${savedPatientId}`);
            if (patientResponse.ok) {
              const patientData = await patientResponse.json();
              patientName = patientData.name;
              patientMRNumber = patientData.mrNumber;
            }
          } catch (err) {
            console.error('Error fetching patient for lab alert:', err);
          }
        }

        const labTestsList = formData.labTestsRequested.map((test: string) => `- ${test}`).join('\n');

        try {
          const alertPayload = {
            type: 'INFO',
            message: `Permintaan pemeriksaan lab ulang dari Dr. ${doctorName} untuk pasien ${patientName} (${patientMRNumber}).\n\nPemeriksaan yang diminta:\n${labTestsList}\n\nSegera lakukan pemeriksaan dan input hasilnya.`,
            patientId: savedPatientId,
            category: 'LAB_RESULT',
            priority: 'HIGH',
            targetRole: 'PERAWAT_POLI'
          };

          const response = await fetch('/api/alerts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alertPayload),
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Lab request alert created successfully:', result);
          } else {
            const errorText = await response.text();
            console.error('Failed to send lab request alert:', errorText);
          }
        } catch (alertError) {
          console.error('Error sending lab request alert:', alertError);
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
    { key: 'system-history', label: 'Riwayat Sistem', icon: HistoryIcon }
  ];

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

              <div className="bg-gradient-to-br from-white to-yellow-50 p-6 rounded-xl shadow-sm border border-blue-100">
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
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full md:w-64 text-gray-900"
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
                  {paginatedPatients.map((patient) => (
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
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${page === currentPage
                            ? 'bg-green-600 text-white'
                            : page === '...'
                              ? 'cursor-default text-gray-400'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          {page}
                        </button>
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

            <div className="lg:hidden space-y-4 p-4">
              {paginatedPatients.map((patient) => (
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
                    className="w-full bg-gray-100 text-gray-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Lihat Detail</span>
                  </button>
                </div>
              ))}

              {paginatedPatients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Tidak ada pasien yang ditemukan</p>
                </div>
              )}
            </div>
            {/* Pagination untuk Mobile di tab Data Pasien */}
            {filteredPatients.length > 0 && (
              <div className="lg:hidden px-4 pb-4 border-t border-gray-200">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-700">Tampilkan</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="px-2 py-1 border border-gray-400 rounded-lg text-xs focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={1000}>1000</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4 text-gray-600" />
                    </button>

                    <span className="text-xs text-gray-700 px-2">
                      {currentPage}/{totalPages}
                    </span>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {showPatientDetail && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-green-50">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Stethoscope className="h-6 w-6 mr-2 text-green-600" />
                  Detail Pasien
                </h3>
                <button
                  onClick={() => {
                    setShowPatientDetail(false);
                    setPatientHandledHistory([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Info Pasien */}
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

                {/* Riwayat Penanganan Pasien - FORMAT TABEL */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="bg-white rounded-lg border border-green-400 overflow-hidden">
                    <div className="bg-green-50 px-4 py-3 border-b border-purple-200">
                      <h4 className="text-base font-semibold text-gray-900 flex items-center">
                        <ClipboardList className="h-5 w-5 mr-2 text-green-600" />
                        Riwayat Penanganan Pasien ({patientHandledHistory.length} kali ditangani)
                      </h4>
                    </div>

                    {loadingPatientHistory ? (
                      <div className="text-center py-8">
                        <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-gray-600">Memuat riwayat...</p>
                      </div>
                    ) : patientHandledHistory.length > 0 ? (
                      <div className="overflow-x-auto max-h-96 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Tanggal & Waktu</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Status</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Prioritas</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Ditangani Oleh</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Diagnosis</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Rencana Pengobatan</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Catatan</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Kunjungan Berikutnya</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {patientHandledHistory.map((handled, idx) => (
                              <tr key={idx} className="hover:bg-purple-50">
                                <td className="px-3 py-3 text-xs text-gray-900 font-medium whitespace-nowrap">
                                  {new Date(handled.handledDate).toLocaleDateString('id-ID', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })} • {new Date(handled.handledDate).toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </td>
                                <td className="px-3 py-3 text-center">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${getHandledStatusColor(handled.status)}`}>
                                    {getHandledStatusLabel(handled.status)}
                                  </span>
                                </td>
                                <td className="px-3 py-3 text-center">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(handled.priority)}`}>
                                    {handled.priority}
                                  </span>
                                </td>
                                <td className="px-3 py-3 text-xs text-gray-900">
                                  <div>
                                    <p className="font-semibold">{handled.handler?.name || 'Unknown'}</p>
                                    <p className="text-gray-600">{handled.handler?.role || 'Unknown'}</p>
                                  </div>
                                </td>
                                <td className="px-3 py-3 text-xs text-gray-900">
                                  {handled.diagnosis ? (
                                    <div className="max-w-xs">
                                      <p className="line-clamp-2">{handled.diagnosis}</p>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-3 py-3 text-xs text-gray-900">
                                  {handled.treatmentPlan ? (
                                    <div className="max-w-xs">
                                      <p className="line-clamp-3">{handled.treatmentPlan}</p>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-3 py-3 text-xs text-gray-900">
                                  {handled.notes ? (
                                    <div className="max-w-xs">
                                      <p className="line-clamp-2">{handled.notes}</p>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-3 py-3 text-xs text-gray-900 text-center whitespace-nowrap">
                                  {handled.nextVisitDate ? (
                                    <div className="flex flex-col items-center">
                                      <Calendar className="h-3 w-3 text-purple-600 mb-1" />
                                      <span>
                                        {new Date(handled.nextVisitDate).toLocaleDateString('id-ID', {
                                          day: '2-digit',
                                          month: 'short',
                                          year: 'numeric'
                                        })}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50">
                        <ClipboardList className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-600">Belum ada riwayat penanganan</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => {
                    setShowPatientDetail(false);
                    setPatientHandledHistory([]);
                  }}
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
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full md:w-64 text-gray-900"
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

            <div className="border-b border-gray-200 px-4 sm:px-6">
              <div className="flex space-x-4 py-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                  onClick={() => setStatusFilter('RAWAT_INAP')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${statusFilter === 'RAWAT_INAP'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Rawat Inap ({handledPatients.filter(hp => hp.patient.status === 'RAWAT_INAP').length})
                </button>
                <button
                  onClick={() => setStatusFilter('RAWAT_JALAN')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${statusFilter === 'RAWAT_JALAN'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Rawat Jalan ({handledPatients.filter(hp => hp.patient.status === 'RAWAT_JALAN').length})
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
                  {paginatedHandledPatients.map((handledPatient) => (
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
                          onClick={() => handleViewHandledPatientHistory(handledPatient)}
                          className="text-gray-600 hover:text-gray-900 font-medium inline-flex items-center space-x-1"
                        >
                          <ClipboardList className="h-4 w-4" />
                          <span>Riwayat</span>
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
              {filteredHandledPatients.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Tampilkan</span>
                    <select
                      value={handledItemsPerPage}
                      onChange={(e) => handleHandledItemsPerPageChange(Number(e.target.value))}
                      className="px-3 py-1 border border-gray-400 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={1000}>1000</option>
                    </select>
                    <span className="text-sm text-gray-700">
                      dari {filteredHandledPatients.length} pasien
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleHandledPageChange(handledCurrentPage - 1)}
                      disabled={handledCurrentPage === 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>

                    <div className="flex gap-1">
                      {getHandledPageNumbers().map((page, index) => (
                        <button
                          key={index}
                          onClick={() => typeof page === 'number' && handleHandledPageChange(page)}
                          disabled={page === '...'}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${page === handledCurrentPage
                            ? 'bg-green-600 text-white'
                            : page === '...'
                              ? 'cursor-default text-gray-400'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handleHandledPageChange(handledCurrentPage + 1)}
                      disabled={handledCurrentPage === handledTotalPages}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:hidden space-y-4 p-4">
              {paginatedHandledPatients.map((handledPatient) => (
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
                      onClick={() => handleViewHandledPatientHistory(handledPatient)}
                      className="bg-gray-100 text-gray-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                    >
                      <ClipboardList className="h-8 w-4" />
                      <span>Riwayat</span>
                    </button>
                    <button
                      onClick={() => handleEditHandledPatient(handledPatient)}
                      className="bg-blue-100 text-blue-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors flex items-center justify-center space-x-1"
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

              {paginatedHandledPatients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <UserCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Tidak ada pasien ditangani yang ditemukan</p>
                </div>
              )}
            </div>
            {filteredHandledPatients.length > 0 && (
              <div className="lg:hidden px-4 pb-4 border-t border-gray-200">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-700">Tampilkan</span>
                    <select
                      value={handledItemsPerPage}
                      onChange={(e) => handleHandledItemsPerPageChange(Number(e.target.value))}
                      className="px-2 py-1 border border-gray-400 rounded-lg text-xs focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={1000}>1000</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleHandledPageChange(handledCurrentPage - 1)}
                      disabled={handledCurrentPage === 1}
                      className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4 text-gray-600" />
                    </button>

                    <span className="text-xs text-gray-700 px-2">
                      {handledCurrentPage}/{handledTotalPages}
                    </span>

                    <button
                      onClick={() => handleHandledPageChange(handledCurrentPage + 1)}
                      disabled={handledCurrentPage === handledTotalPages}
                      className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        )}

        {activeTab === 'system-history' && (
          <SystemHistoryView
            patients={patients as any}
            selectedPatient={selectedPatient as any}
            onPatientSelect={(patient: any) => {
              if (patient) {
                const found = patients.find(p => p.id === patient.id);
                if (found) setSelectedPatient(found);
              } else {
                setSelectedPatient(null);
              }
            }}
          />
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

      <DetailHandledPatientModal
        isOpen={showDetailHandledModal}
        onClose={() => {
          setShowDetailHandledModal(false);
          setPatientHandledHistory([]);
        }}
        patientId={selectedPatientForDetail?.id || null}
        patientName={selectedPatientForDetail?.name}
        patientMRNumber={selectedPatientForDetail?.mrNumber}
        handledHistory={patientHandledHistory}
        loading={loadingPatientHistory}
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