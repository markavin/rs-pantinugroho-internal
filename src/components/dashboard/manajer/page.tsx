import React, { useState, useEffect } from 'react';
import {
  Users, Activity, History, ChevronDown, ChevronUp, Calendar,
  User, Search, Menu, X, Filter, FileDown, Pill, Utensils,
  FlaskConical, Stethoscope, ClipboardList, FileText, AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Patient {
  id: string;
  mrNumber: string;
  name: string;
  birthDate: string;
  gender: string;
  status: string;
  insuranceType: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  employeeId: string;
  email: string;
  username: string;
  updatedAt?: string;
}

interface DrugData {
  id: string;
  name: string;
  stock: number;
  createdAt?: string;
  category?: string;
  categoryKehamilan?: string;
  dosageForm?: string;
  strength?: string;
  manufacturer?: string;
  expiryDate?: string;
  interactions?: string[];
  contraindications?: string[];
  sideEffects?: string[];
  indications?: string[];
}

interface DrugTransactionItem {
  id: string;
  drugId: string;
  drugName: string;
  quantity: number;
  strength?: string;
  dosageForm?: string;
}

interface DrugTransaction {
  id: string;
  createdAt: string;
  status: string;
  patientId: string;
  patientName?: string;
  mrNumber?: string;
  items?: DrugTransactionItem[];
  completedAt?: string;
  notes?: string;
}

interface ActivityData {
  id: string;
  activityType: string;
  timestamp: Date;
  role: string;
  [key: string]: any;
}

const ManajerDashboard = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'staff-history'>('dashboard');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [drugs, setDrugs] = useState<DrugData[]>([]);
  const [transactions, setTransactions] = useState<DrugTransaction[]>([]);
  const [allActivities, setAllActivities] = useState<ActivityData[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [staff, setStaff] = useState<User[]>([]);
  const [staffActivities, setStaffActivities] = useState<ActivityData[]>([]);

  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '3m' | '6m' | 'all'>('all');
  const [expandedDates, setExpandedDates] = useState<{ [key: string]: boolean }>({});

  const [grafikTimeRange, setGrafikTimeRange] = useState<'7d' | '30d' | '3m' | '6m' | 'all'>('all');
  const [patientStatusFilter, setPatientStatusFilter] = useState<string>('all');
  const [grafikDateRange, setGrafikDateRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchAllSystemHistory();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'staff-history') {
      fetchStaffHistory();
    }
  }, [activeTab]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const patientsRes = await fetch('/api/patients');
      if (patientsRes.ok) {
        const patientsData = await patientsRes.json();
        setPatients(patientsData);
      }

      const usersRes = await fetch('/api/staff');
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      const drugsRes = await fetch('/api/drugs');
      if (drugsRes.ok) {
        const drugsData = await drugsRes.json();
        setDrugs(drugsData);
      }

      const transactionsRes = await fetch('/api/drug-transactions');
      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSystemHistory = async () => {
    setLoading(true);
    try {
      const allPatientActivities: ActivityData[] = [];

      for (const patient of patients) {
        const [
          complaintsRes, vitalsRes, labsRes, handledRes,
          visitationsRes, nutritionRes, pharmacyRes, medicalReportsRes
        ] = await Promise.all([
          fetch(`/api/patient-records?patientId=${patient.id}&type=COMPLAINTS`).catch(() => null),
          fetch(`/api/patient-records?patientId=${patient.id}&type=VITAL_SIGNS`).catch(() => null),
          fetch(`/api/lab-results?patientId=${patient.id}`).catch(() => null),
          fetch(`/api/handled-patients?patientId=${patient.id}`).catch(() => null),
          fetch(`/api/visitations?patientId=${patient.id}`).catch(() => null),
          fetch(`/api/nutrition-records?patientId=${patient.id}`).catch(() => null),
          fetch(`/api/drug-transactions?patientId=${patient.id}`).catch(() => null),
          fetch(`/api/medical-reports?patientId=${patient.id}`).catch(() => null)
        ]);

        const complaints = complaintsRes?.ok ? await complaintsRes.json() : [];
        const vitals = vitalsRes?.ok ? await vitalsRes.json() : [];
        const labs = labsRes?.ok ? await labsRes.json() : [];
        const handled = handledRes?.ok ? await handledRes.json() : [];
        const visitations = visitationsRes?.ok ? await visitationsRes.json() : [];
        const nutrition = nutritionRes?.ok ? await nutritionRes.json() : [];
        const pharmacy = pharmacyRes?.ok ? await pharmacyRes.json() : [];
        const medicalReports = medicalReportsRes?.ok ? await medicalReportsRes.json() : [];

        const patientActivities = [
          ...complaints.map((c: any) => ({ ...c, activityType: 'complaint', timestamp: new Date(c.createdAt), role: 'ADMINISTRASI', patientId: patient.id, patientName: patient.name, patientMrNumber: patient.mrNumber })),
          ...vitals.map((v: any) => ({ ...v, activityType: 'vital', timestamp: new Date(v.createdAt), role: 'PERAWAT_POLI', patientId: patient.id, patientName: patient.name, patientMrNumber: patient.mrNumber })),
          ...labs.map((l: any) => {
            console.log('Lab data:', l, 'Technician:', l.technician);
            return {
              ...l,
              activityType: 'lab',
              timestamp: new Date(l.testDate || l.createdAt),
              role: l.technician?.role || 'LABORATORIUM',
              patientId: patient.id,
              patientName: patient.name,
              patientMrNumber: patient.mrNumber
            };
          }),
          ...handled.map((h: any) => ({ ...h, activityType: 'handled', timestamp: new Date(h.handledDate), role: h.handler?.role || 'DOKTER_SPESIALIS', patientId: patient.id, patientName: patient.name, patientMrNumber: patient.mrNumber })),
          ...visitations.map((v: any) => ({ ...v, activityType: 'visitation', timestamp: new Date(v.createdAt), role: 'PERAWAT_RUANGAN', patientId: patient.id, patientName: patient.name, patientMrNumber: patient.mrNumber })),
          ...nutrition.map((n: any) => ({ ...n, activityType: 'nutrition', timestamp: new Date(n.createdAt), role: 'AHLI_GIZI', patientId: patient.id, patientName: patient.name, patientMrNumber: patient.mrNumber })),
          ...pharmacy.map((p: any) => ({ ...p, activityType: 'pharmacy', timestamp: new Date(p.createdAt), role: 'FARMASI', patientId: patient.id, patientName: patient.name, patientMrNumber: patient.mrNumber })),
          ...medicalReports.map((m: any) => ({ ...m, activityType: 'medical-report', timestamp: new Date(m.createdAt), role: 'DOKTER_SPESIALIS', patientId: patient.id, patientName: patient.name, patientMrNumber: patient.mrNumber }))
        ];

        allPatientActivities.push(...patientActivities);
      }

      allPatientActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setAllActivities(allPatientActivities);
    } catch (error) {
      console.error('Error fetching system history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffHistory = async () => {
    setLoading(true);
    try {
      const staffRes = await fetch('/api/staff');
      if (staffRes.ok) {
        const staffData = await staffRes.json();
        setStaff(staffData);

        const allStaffActivities: ActivityData[] = [];

        for (const staffMember of staffData) {
          const activities = [
            {
              id: staffMember.id,
              activityType: 'staff-created',
              timestamp: new Date(staffMember.createdAt),
              role: staffMember.role,
              staffId: staffMember.id,
              staffName: staffMember.name,
              staffEmployeeId: staffMember.employeeId,
              email: staffMember.email,
              username: staffMember.username
            }
          ];

          if (staffMember.updatedAt && staffMember.updatedAt !== staffMember.createdAt) {
            activities.push({
              id: `${staffMember.id}-updated`,
              activityType: 'staff-updated',
              timestamp: new Date(staffMember.updatedAt),
              role: staffMember.role,
              staffId: staffMember.id,
              staffName: staffMember.name,
              staffEmployeeId: staffMember.employeeId,
              email: staffMember.email,
              username: staffMember.username
            });
          }

          allStaffActivities.push(...activities);
        }

        allStaffActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setStaffActivities(allStaffActivities);
      }
    } catch (error) {
      console.error('Error fetching staff history:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateGrafikData = () => {
    let startDate: Date;
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    if (grafikDateRange.startDate && grafikDateRange.endDate) {
      startDate = new Date(grafikDateRange.startDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(grafikDateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
    } else if (grafikTimeRange === 'all') {
      const allDates = [
        ...patients.map(p => new Date(p.createdAt)),
        ...users.map(u => new Date(u.createdAt)),
        ...drugs.filter(d => d.createdAt).map(d => new Date(d.createdAt!)),
        ...transactions.map(t => new Date(t.createdAt))
      ];

      if (allDates.length > 0) {
        startDate = new Date(Math.min(...allDates.map(d => d.getTime())));
      } else {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
      }
      startDate.setHours(0, 0, 0, 0);
    } else {
      const days = grafikTimeRange === '7d' ? 7 : grafikTimeRange === '30d' ? 30 : grafikTimeRange === '3m' ? 90 : 180;
      startDate = new Date();
      startDate.setDate(startDate.getDate() - days + 1);
      startDate.setHours(0, 0, 0, 0);
    }

    const transactionsByDate: { [key: string]: number } = {};
    const stockChangesByDate: { [key: string]: number } = {};

    transactions.forEach(t => {
      const txDate = new Date(t.createdAt);
      const localDate = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());

      if (localDate >= new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()) &&
        localDate <= new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())) {
        const dateKey = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
        transactionsByDate[dateKey] = (transactionsByDate[dateKey] || 0) + 1;

        if (t.items && Array.isArray(t.items)) {
          const totalQuantity = t.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
          stockChangesByDate[dateKey] = (stockChangesByDate[dateKey] || 0) - totalQuantity;
        }
      }
    });

    const currentStock = drugs.reduce((sum, drug) => sum + drug.stock, 0);
    let totalChangesAfterStart = 0;
    Object.entries(stockChangesByDate).forEach(([dateKey, change]) => {
      totalChangesAfterStart += change;
    });

    let runningStock = currentStock - totalChangesAfterStart;

    const data = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      const checkDate = new Date(currentDate);
      checkDate.setHours(23, 59, 59, 999);

      const patientCountOnDate = patients.filter(p => {
        const createdDate = new Date(p.createdAt);
        const matchesStatus = patientStatusFilter === 'all' || p.status === patientStatusFilter;
        return createdDate <= checkDate && matchesStatus;
      }).length;

      const staffCountOnDate = users.filter(u => {
        const userCreatedDate = new Date(u.createdAt);
        return u.isActive && userCreatedDate <= checkDate;
      }).length;

      const transactionsOnDate = transactionsByDate[dateKey] || 0;

      if (stockChangesByDate[dateKey]) {
        runningStock += stockChangesByDate[dateKey];
      }

      data.push({
        date: currentDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        pasien: patientCountOnDate,
        transaksi: transactionsOnDate,
        staff: staffCountOnDate,
        obat: Math.max(0, Math.round(runningStock))
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
  };

  const getFilteredStaffActivities = () => {
    let filtered = staffActivities.filter(a => a.activityType === 'staff-created');

    if (roleFilter !== 'all') {
      filtered = filtered.filter(a => a.role === roleFilter);
    }

    const now = new Date();
    const ranges = { '7d': 7 * 24 * 60 * 60 * 1000, '30d': 30 * 24 * 60 * 60 * 1000, '3m': 90 * 24 * 60 * 60 * 1000, '6m': 180 * 24 * 60 * 60 * 1000, 'all': Infinity };
    const rangeMs = ranges[timeRange];
    filtered = filtered.filter(a => (now.getTime() - a.timestamp.getTime()) <= rangeMs);

    if (dateRange.startDate) {
      const startDate = new Date(dateRange.startDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(a => a.timestamp >= startDate);
    }

    if (dateRange.endDate) {
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(a => a.timestamp <= endDate);
    }

    return filtered;
  };

  const groupStaffActivitiesByStaff = () => {
    const filtered = getFilteredStaffActivities();
    const groups: { [key: string]: any[] } = {};

    filtered.forEach(activity => {
      const staffKey = activity.staffId;
      if (!groups[staffKey]) groups[staffKey] = [];
      groups[staffKey].push(activity);
    });

    return groups;
  };

  const staffActivitiesByStaff = groupStaffActivitiesByStaff();
  const getFilteredActivities = () => {
    let filtered = allActivities;

    if (selectedPatientId !== 'all') {
      filtered = filtered.filter(a => a.patientId === selectedPatientId);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(a => {
        if (roleFilter === 'DOKTER') return a.role === 'DOKTER_SPESIALIS' || a.role === 'DOKTER_POLI';
        if (roleFilter === 'PERAWAT_POLI') return a.role === 'PERAWAT_POLI';
        if (roleFilter === 'PERAWAT_RUANGAN') return a.role === 'PERAWAT_RUANGAN';
        if (roleFilter === 'LABORATORIUM') return a.role === 'LABORATORIUM';
        return a.role === roleFilter;
      });
    }

    const now = new Date();
    const ranges = { '7d': 7 * 24 * 60 * 60 * 1000, '30d': 30 * 24 * 60 * 60 * 1000, '3m': 90 * 24 * 60 * 60 * 1000, '6m': 180 * 24 * 60 * 60 * 1000, 'all': Infinity };
    const rangeMs = ranges[timeRange];
    filtered = filtered.filter(a => (now.getTime() - a.timestamp.getTime()) <= rangeMs);

    if (dateRange.startDate) {
      const startDate = new Date(dateRange.startDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(a => a.timestamp >= startDate);
    }

    if (dateRange.endDate) {
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(a => a.timestamp <= endDate);
    }

    return filtered;
  };

  const groupActivitiesByPatient = () => {
    const filtered = getFilteredActivities();
    const groups: { [key: string]: any[] } = {};

    filtered.forEach(activity => {
      const patientKey = activity.patientId;
      if (!groups[patientKey]) groups[patientKey] = [];
      groups[patientKey].push(activity);
    });

    return groups;
  };

  const activitiesByPatient = groupActivitiesByPatient();

  const toggleDateExpansion = (dateKey: string) => {
    setExpandedDates(prev => ({ ...prev, [dateKey]: !prev[dateKey] }));
  };

  const getRoleBadgeColor = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'DOKTER_SPESIALIS': 'text-blue-700 bg-blue-50 border-blue-200',
      'PERAWAT_RUANGAN': 'text-teal-700 bg-teal-50 border-teal-200',
      'PERAWAT_POLI': 'text-cyan-700 bg-cyan-50 border-cyan-200',
      'LABORATORIUM': 'text-purple-700 bg-purple-50 border-purple-200',
      'AHLI_GIZI': 'text-green-700 bg-green-50 border-green-200',
      'FARMASI': 'text-emerald-700 bg-emerald-50 border-emerald-200',
      'ADMINISTRASI': 'text-gray-700 bg-gray-50 border-gray-200'
    };
    return roleMap[role] || 'bg-gray-600 text-white';
  };

  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    const filteredActivities = getFilteredActivities();

    doc.setFontSize(16);
    doc.text('Riwayat Sistem', 14, 15);

    let selectedPatient: any = null;
    if (selectedPatientId !== 'all') {
      selectedPatient = patients.find(p => p.id === selectedPatientId);
      if (selectedPatient) {
        doc.setFontSize(10);
        doc.text(`Nama: ${selectedPatient.name}`, 14, 25);
        doc.text(`No. RM: ${selectedPatient.mrNumber}`, 100, 25);
        doc.text(`Asuransi: ${selectedPatient.insuranceType}`, 180, 25);
        doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);
        doc.text(`Total Aktivitas: ${filteredActivities.length}`, 100, 30);
      }
    } else {
      doc.setFontSize(10);
      doc.text('Semua Pasien', 14, 25);
      doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 100, 25);
      doc.text(`Total Aktivitas: ${filteredActivities.length}`, 180, 25);
    }

    const groupedByPatient: { [key: string]: any[] } = {};
    filteredActivities.forEach(activity => {
      const patientKey = activity.patientId;
      if (!groupedByPatient[patientKey]) groupedByPatient[patientKey] = [];
      groupedByPatient[patientKey].push(activity);
    });

    let startY = selectedPatientId !== 'all' ? 40 : 35;
    let isFirstPatient = true;

    const sortedPatients = Object.entries(groupedByPatient).sort(([, activitiesA], [, activitiesB]) => {
      const latestA = Math.max(...activitiesA.map((a: any) => a.timestamp.getTime()));
      const latestB = Math.max(...activitiesB.map((a: any) => a.timestamp.getTime()));
      return latestB - latestA;
    });

    sortedPatients.forEach(([patientId, patientActivities]) => {
      if (!isFirstPatient) {
        doc.addPage('landscape');
        startY = 20;
      }

      const patientInfo = patientActivities[0];

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`Pasien: ${patientInfo.patientName} (${patientInfo.patientMrNumber})`, 14, startY);
      doc.setFontSize(10);
      doc.text(`Total Aktivitas: ${patientActivities.length}`, 14, startY + 5);

      startY += 12;

      const groupedByType: { [key: string]: any[] } = {};
      patientActivities.forEach(activity => {
        if (!groupedByType[activity.activityType]) groupedByType[activity.activityType] = [];
        groupedByType[activity.activityType].push(activity);
      });

      Object.entries(groupedByType).forEach(([type, items]) => {
        const typeLabel = {
          'complaint': 'Keluhan',
          'vital': 'Vital Signs',
          'lab': 'Hasil Lab',
          'handled': 'Penanganan Dokter',
          'visitation': 'Kunjungan Ruangan',
          'nutrition': 'Nutrisi',
          'pharmacy': 'Farmasi',
          'medical-report': 'Laporan Medis'
        }[type] || type;

        if (startY > 180) {
          doc.addPage('landscape');
          startY = 20;
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text(`${patientInfo.patientName} (lanjutan)`, 14, startY);
          startY += 8;
        }

        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(`${typeLabel} (${items.length} data)`, 14, startY);

        let columns: any[] = [];
        let rows: any[] = [];

        if (type === 'complaint') {
          columns = ['Tanggal', 'Waktu', 'Petugas', 'Keluhan', 'Tingkat'];
          rows = items.map(item => [
            item.timestamp.toLocaleDateString('id-ID'),
            item.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            item.role.replace(/_/g, ' '),
            item.content,
            item.metadata?.severity || '-'
          ]);
        } else if (type === 'vital') {
          columns = ['Tanggal', 'Waktu', 'Petugas', 'TD', 'Nadi', 'Suhu', 'RR', 'SpO2'];
          rows = items.map(item => [
            item.timestamp.toLocaleDateString('id-ID'),
            item.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            item.role.replace(/_/g, ' '),
            item.bloodPressure || '-',
            item.heartRate || '-',
            item.temperature || '-',
            item.metadata?.respiratoryRate || '-',
            item.metadata?.oxygenSaturation || '-'
          ]);
        } else if (type === 'lab') {
          columns = ['Tanggal', 'Waktu', 'Petugas', 'Test', 'Hasil', 'Normal', 'Status', 'Catatan'];
          rows = items.map(item => [
            item.timestamp.toLocaleDateString('id-ID'),
            item.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            item.role.replace(/_/g, ' '),
            item.testType,
            item.value,
            item.normalRange,
            item.status,
            item.notes || '-'
          ]);
        } else if (type === 'handled') {
          columns = ['Tanggal', 'Waktu', 'Petugas', 'Diagnosis', 'Treatment Plan', 'Prioritas', 'Status'];
          rows = items.map(item => [
            item.timestamp.toLocaleDateString('id-ID'),
            item.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            item.role.replace(/_/g, ' '),
            item.diagnosis || '-',
            item.treatmentPlan || '-',
            item.priority,
            item.status
          ]);
        } else if (type === 'visitation') {
          columns = ['Tanggal', 'Waktu', 'Petugas', 'Shift', 'TD', 'Suhu', 'Nadi', 'RR', 'SpO2', 'GDS'];
          rows = items.map(item => [
            item.timestamp.toLocaleDateString('id-ID'),
            item.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            item.role.replace(/_/g, ' '),
            item.shift,
            item.bloodPressure || '-',
            item.temperature || '-',
            item.heartRate || '-',
            item.respiratoryRate || '-',
            item.oxygenSaturation || '-',
            item.bloodSugar || '-'
          ]);
        } else if (type === 'nutrition') {
          columns = ['Tanggal', 'Waktu', 'Petugas', 'Target Kalori', 'Diet Plan', 'Kepatuhan', 'Perubahan BB'];
          rows = items.map(item => [
            item.timestamp.toLocaleDateString('id-ID'),
            item.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            item.role.replace(/_/g, ' '),
            `${item.targetCalories} kkal`,
            item.dietPlan || '-',
            item.complianceScore ? `${item.complianceScore}%` : '-',
            item.weightChange ? `${item.weightChange > 0 ? '+' : ''}${item.weightChange} kg` : '-'
          ]);
        } else if (type === 'pharmacy') {
          columns = ['Tanggal', 'Waktu', 'Petugas', 'Daftar Obat', 'Total Item', 'Status'];
          rows = items.map(item => [
            item.timestamp.toLocaleDateString('id-ID'),
            item.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            item.role.replace(/_/g, ' '),
            item.items && item.items.length > 0
              ? item.items.map((drug: any) => `${drug.drugName} x${drug.quantity}`).join(', ')
              : '-',
            item.items?.length || 0,
            item.status
          ]);
        } else if (type === 'medical-report') {
          columns = ['Tanggal', 'Waktu', 'Petugas', 'Jenis Laporan', 'Keluhan Utama', 'Diagnosis'];
          rows = items.map(item => [
            item.timestamp.toLocaleDateString('id-ID'),
            item.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            item.role.replace(/_/g, ' '),
            item.reportType?.replace(/_/g, ' ') || '-',
            item.chiefComplaint || '-',
            item.diagnosis
          ]);
        }

        autoTable(doc, {
          startY: startY + 5,
          head: [columns],
          body: rows,
          theme: 'grid',
          styles: {
            fontSize: 8,
            cellPadding: 2
          },
          headStyles: {
            fillColor: [34, 197, 94],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
          },
          columnStyles: {
            0: { cellWidth: 22 },
            1: { cellWidth: 15 }
          },
          margin: { left: 14, right: 14 }
        });

        const finalY = (doc as any).lastAutoTable.finalY;
        startY = finalY + 10;
      });

      isFirstPatient = false;
    });

    const now = new Date();
    const formattedDate = now
      .toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
      .replace(/\//g, '-');
    const formattedTime = now
      .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      .replace(':', '-');

    const patientLabel =
      selectedPatientId !== 'all' && selectedPatient
        ? selectedPatient.name.replace(/\s+/g, '_')
        : 'Semua_Pasien';

    doc.save(`Riwayat_Pasien_${patientLabel}_${formattedDate}_${formattedTime}.pdf`);
  };

  const exportStaffToPDF = () => {
    const doc = new jsPDF('landscape');
    const filteredActivities = getFilteredStaffActivities();

    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('DATA STAFF', 14, 15);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`, 14, 25);
    doc.text(`Total Staff: ${filteredActivities.length} orang`, 14, 30);

    if (roleFilter !== 'all') {
      doc.text(`Filter Role: ${roleFilter.replace(/_/g, ' ')}`, 14, 35);
    }

    const columns = ['No', 'Tanggal Dibuat', 'Waktu', 'Nama Staff', 'Employee ID', 'Role', 'Email', 'Username', 'Status'];
    const rows = filteredActivities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .map((item, index) => [
        index + 1,
        item.timestamp.toLocaleDateString('id-ID'),
        item.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        item.staffName,
        item.staffEmployeeId,
        item.role.replace(/_/g, ' '),
        item.email,
        item.username,
        'AKTIF'
      ]);

    autoTable(doc, {
      startY: roleFilter !== 'all' ? 40 : 35,
      head: [columns],
      body: rows,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.5
      },
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 25 },
        2: { cellWidth: 20 },
        3: { cellWidth: 40 },
        4: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
        5: { cellWidth: 35 },
        6: { cellWidth: 45 },
        7: { cellWidth: 30 },
        8: { cellWidth: 20, halign: 'center', fontStyle: 'bold' }
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      margin: { left: 14, right: 14 }
    });

    const now = new Date();
    const formattedDate = now
      .toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
      .replace(/\//g, '-');
    const formattedTime = now
      .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      .replace(':', '-');

    doc.save(`Data_Staff_${formattedDate}_${formattedTime}.pdf`);
  };

  const grafikData = generateGrafikData();

  const totalPatients = patients.length;
  const totalStaff = users.filter(u => u.isActive).length;
  const totalDrugs = drugs.length;
  const totalStock = drugs.reduce((sum, drug) => sum + drug.stock, 0);
  const totalTransactions = transactions.length;

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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID');
  };

  const getFilteredPatients = () => {
    return patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.mrNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredPatients = getFilteredPatients();

  const renderActivitiesTable = (activities: any[]) => {
    const groupedByType: { [key: string]: any[] } = {};
    activities.forEach(activity => {
      if (!groupedByType[activity.activityType]) groupedByType[activity.activityType] = [];
      groupedByType[activity.activityType].push(activity);
    });

    return (
      <div className="space-y-4">
        {Object.entries(groupedByType).map(([type, items]) => (
          <div key={type} className="bg-white rounded-lg border-2 border-gray-300 overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b-2 border-gray-300">
              <div className="flex items-center gap-2">
                {type === 'complaint' && <FileText className="h-4 w-4 text-gray-700" />}
                {type === 'vital' && <Activity className="h-4 w-4 text-gray-700" />}
                {type === 'lab' && <FlaskConical className="h-4 w-4 text-gray-700" />}
                {type === 'handled' && <Stethoscope className="h-4 w-4 text-gray-700" />}
                {type === 'visitation' && <ClipboardList className="h-4 w-4 text-gray-700" />}
                {type === 'nutrition' && <Utensils className="h-4 w-4 text-gray-700" />}
                {type === 'pharmacy' && <Pill className="h-4 w-4 text-gray-700" />}
                {type === 'medical-report' && <FileText className="h-4 w-4 text-gray-700" />}
                <span className="text-sm font-bold text-gray-900">
                  {type === 'complaint' && 'Keluhan'}
                  {type === 'vital' && 'Vital Signs'}
                  {type === 'lab' && 'Hasil Lab'}
                  {type === 'handled' && 'Penanganan Dokter'}
                  {type === 'visitation' && 'Kunjungan Ruangan'}
                  {type === 'nutrition' && 'Nutrisi'}
                  {type === 'pharmacy' && 'Farmasi'}
                  {type === 'medical-report' && 'Laporan Medis'}
                </span>
                <span className="text-xs text-gray-600">({items.length} data)</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Waktu</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Pasien</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Petugas</th>

                    {type === 'complaint' && (
                      <>
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Keluhan</th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Tingkat</th>
                      </>
                    )}

                    {type === 'vital' && (
                      <>
                        <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">TD</th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Nadi</th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Suhu</th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">RR</th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">SpO2</th>
                      </>
                    )}

                    {type === 'lab' && (
                      <>
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Test</th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Hasil</th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Normal</th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Status</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Catatan</th>
                      </>
                    )}

                    {type === 'handled' && (
                      <>
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Diagnosis</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Treatment Plan</th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Prioritas</th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Status</th>
                      </>
                    )}

                    {type === 'visitation' && (
                      <>
                        <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Shift</th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">TD</th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Suhu</th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Nadi</th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">RR</th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">SpO2</th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">GDS</th>
                      </>
                    )}

                    {type === 'nutrition' && (
                      <>
                        <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Target Kalori</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Diet Plan</th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Kepatuhan</th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Perubahan BB</th>
                      </>
                    )}

                    {type === 'pharmacy' && (
                      <>
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Daftar Obat</th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Total Item</th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Status</th>
                      </>
                    )}

                    {type === 'medical-report' && (
                      <>
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Jenis Laporan</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Keluhan Utama</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Diagnosis</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((activity, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-xs font-bold text-gray-900 whitespace-nowrap">
                        <div>{activity.timestamp.toLocaleDateString('id-ID')}</div>
                        <div className="text-gray-600">{activity.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-900">
                        <div className="font-bold">{activity.patientName}</div>
                        <div className="text-gray-600">{activity.patientMrNumber}</div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getRoleBadgeColor(activity.role)}`}>
                          {activity.role.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {type === 'complaint' && (
                        <>
                          <td className="px-3 py-2 text-sm text-gray-900">{activity.content}</td>
                          <td className="px-3 py-2 text-center">
                            {activity.metadata?.severity && (
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${activity.metadata.severity === 'BERAT' ? 'bg-red-600 text-white' :
                                activity.metadata.severity === 'SEDANG' ? 'bg-yellow-600 text-white' :
                                  'bg-green-600 text-white'
                                }`}>
                                {activity.metadata.severity}
                              </span>
                            )}
                          </td>
                        </>
                      )}

                      {type === 'vital' && (
                        <>
                          <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">{activity.bloodPressure || '-'}</td>
                          <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">{activity.heartRate || '-'}</td>
                          <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">{activity.temperature || '-'}</td>
                          <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">{activity.metadata?.respiratoryRate || '-'}</td>
                          <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">{activity.metadata?.oxygenSaturation || '-'}</td>
                        </>
                      )}

                      {type === 'lab' && (
                        <>
                          <td className="px-3 py-2 text-sm font-bold text-gray-900">{activity.testType}</td>
                          <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">{activity.value}</td>
                          <td className="px-3 py-2 text-center text-xs text-gray-600">{activity.normalRange}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${activity.status === 'CRITICAL' ? 'bg-red-600 text-white' :
                              activity.status === 'HIGH' ? 'bg-orange-600 text-white' :
                                activity.status === 'LOW' ? 'bg-yellow-600 text-white' :
                                  'bg-green-600 text-white'
                              }`}>
                              {activity.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900">{activity.notes || '-'}</td>
                        </>
                      )}

                      {type === 'handled' && (
                        <>
                          <td className="px-3 py-2 text-sm text-gray-900">{activity.diagnosis || '-'}</td>
                          <td className="px-3 py-2 text-sm text-gray-900 max-w-xs">{activity.treatmentPlan || '-'}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${activity.priority === 'URGENT' ? 'bg-red-600 text-white' :
                              activity.priority === 'HIGH' ? 'bg-orange-600 text-white' :
                                activity.priority === 'NORMAL' ? 'bg-green-600 text-white' :
                                  'bg-gray-600 text-white'
                              }`}>
                              {activity.priority}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${activity.status === 'SELESAI' ? 'bg-green-600 text-white' :
                              activity.status === 'SEDANG_DITANGANI' ? 'bg-blue-600 text-white' :
                                'bg-yellow-600 text-white'
                              }`}>
                              {activity.status}
                            </span>
                          </td>
                        </>
                      )}

                      {type === 'visitation' && (
                        <>
                          <td className="px-3 py-2 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${activity.shift === 'PAGI' ? 'bg-orange-600 text-white' :
                              activity.shift === 'SORE' ? 'bg-yellow-600 text-white' :
                                'bg-purple-600 text-white'
                              }`}>
                              {activity.shift}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">{activity.bloodPressure || '-'}</td>
                          <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">{activity.temperature || '-'}</td>
                          <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">{activity.heartRate || '-'}</td>
                          <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">{activity.respiratoryRate || '-'}</td>
                          <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">{activity.oxygenSaturation || '-'}</td>
                          <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">{activity.bloodSugar || '-'}</td>
                        </>
                      )}

                      {type === 'nutrition' && (
                        <>
                          <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">{activity.targetCalories} kkal</td>
                          <td className="px-3 py-2 text-sm text-gray-900">{activity.dietPlan || '-'}</td>
                          <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">{activity.complianceScore ? `${activity.complianceScore}%` : '-'}</td>
                          <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">{activity.weightChange ? `${activity.weightChange > 0 ? '+' : ''}${activity.weightChange} kg` : '-'}</td>
                        </>
                      )}

                      {type === 'pharmacy' && (
                        <>
                          <td className="px-3 py-2">
                            {activity.items && activity.items.length > 0 ? (
                              <div className="space-y-1">
                                {activity.items.map((item: any, i: number) => (
                                  <div key={i} className="text-xs text-gray-900">
                                    <span className="font-bold">{item.drugName}</span>
                                    <span className="text-gray-600 ml-2">x{item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            ) : '-'}
                          </td>
                          <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">{activity.items?.length || 0} item</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${activity.status === 'COMPLETED' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                              }`}>
                              {activity.status}
                            </span>
                          </td>
                        </>
                      )}

                      {type === 'medical-report' && (
                        <>
                          <td className="px-3 py-2 text-sm text-gray-900">{activity.reportType?.replace(/_/g, ' ')}</td>
                          <td className="px-3 py-2 text-sm text-gray-900">{activity.chiefComplaint || '-'}</td>
                          <td className="px-3 py-2 text-sm text-gray-900">{activity.diagnosis}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderStaffActivitiesTable = (activities: any[]) => {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg border-2 border-gray-300 overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b-2 border-gray-300">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-gray-700" />
              <span className="text-sm font-bold text-gray-900">Aktivitas Staff</span>
              <span className="text-xs text-gray-600">({activities.length} data)</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Tanggal & Waktu</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Staff</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Role</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Email</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Username</th>
                  <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Aktivitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {activities.map((activity, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-xs font-bold text-gray-900 whitespace-nowrap">
                      <div>{activity.timestamp.toLocaleDateString('id-ID')}</div>
                      <div className="text-gray-600">{activity.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900">
                      <div className="font-bold">{activity.staffName}</div>
                      <div className="text-gray-600">{activity.staffEmployeeId}</div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getRoleBadgeColor(activity.role)}`}>
                        {activity.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900">{activity.email}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{activity.username}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${activity.activityType === 'staff-created'
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 text-white'
                        }`}>
                        {activity.activityType === 'staff-created' ? 'DIBUAT' : 'DIPERBARUI'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const navigationItems = [
    { key: 'dashboard', label: 'Dashboard', icon: Activity },
    { key: 'history', label: 'Riwayat Pasien', icon: History },
    { key: 'staff-history', label: 'Riwayat Staff', icon: Users }
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
          <h2 className="text-lg font-semibold text-gray-900">Menu Manajer</h2>
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
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-6 hidden lg:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-75 px-6 justify-center">
              {navigationItems.map(tab => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.key
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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

        <div className="space-y-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-linear-to-br from-white to-blue-50 p-6 rounded-xl shadow-sm border border-blue-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Total Pasien</p>
                          <p className="text-3xl font-bold text-gray-900 mt-2">{totalPatients}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                          <Users className="h-8 w-8 text-blue-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-linear-to-br from-white to-green-50 p-6 rounded-xl shadow-sm border border-green-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">Total Staff</p>
                          <p className="text-3xl font-bold text-gray-900 mt-2">{totalStaff}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                          <Activity className="h-8 w-8 text-green-600" />
                        </div>
                      </div>
                    </div>

                    {/* CARD TOTAL OBAT */}
                    <div className="bg-linear-to-br from-white to-purple-50 p-6 rounded-xl shadow-sm border border-purple-100 sm:col-span-2 lg:col-span-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600">Total Obat</p>
                          <p className="text-3xl font-bold text-gray-900 mt-2">{totalDrugs}</p>
                          <p className="text-xs text-purple-600 mt-1">Stok: {totalStock} unit</p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full">
                          <Calendar className="h-8 w-8 text-purple-600" />
                        </div>
                      </div>
                    </div>
                  </div>


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

                  <div className="p-6">
                    <div className="space-y-4 mb-6">
                      {/* === PERIODE + TANGGAL === */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 flex-wrap">
                        {/* PERIODE */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Periode:</span>
                          <button
                            onClick={() => {
                              setGrafikTimeRange('all');
                              setGrafikDateRange({ startDate: '', endDate: '' });
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${grafikTimeRange === 'all' && !grafikDateRange.startDate && !grafikDateRange.endDate
                              ? 'bg-green-600 text-white shadow-sm'
                              : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
                              }`}
                          >
                            Semua
                          </button>
                          <button
                            onClick={() => {
                              const today = new Date();
                              setGrafikDateRange({
                                startDate: today.toISOString().split('T')[0],
                                endDate: today.toISOString().split('T')[0]
                              });
                              setGrafikTimeRange('all');
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${grafikDateRange.startDate === new Date().toISOString().split('T')[0] &&
                              grafikDateRange.endDate === new Date().toISOString().split('T')[0]
                              ? 'bg-green-600 text-white shadow-sm'
                              : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
                              }`}
                          >
                            Hari Ini
                          </button>
                          {[
                            { key: '7d', label: '7 Hari' },
                            { key: '30d', label: '30 Hari' },
                            { key: '3m', label: '3 Bulan' },
                            { key: '6m', label: '6 Bulan' }
                          ].map(({ key, label }) => (
                            <button
                              key={key}
                              onClick={() => {
                                setGrafikTimeRange(key as typeof grafikTimeRange);
                                setGrafikDateRange({ startDate: '', endDate: '' });
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${grafikTimeRange === key && !grafikDateRange.startDate && !grafikDateRange.endDate
                                ? 'bg-green-600 text-white shadow-sm'
                                : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
                                }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>

                        {/* TANGGAL */}
                        <div className="flex items-center gap-2 flex-wrap mt-2 sm:mt-0">
                          <span className="text-sm font-medium text-gray-700">Tanggal:</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="date"
                              value={grafikDateRange.startDate}
                              onChange={(e) => {
                                setGrafikDateRange({ ...grafikDateRange, startDate: e.target.value });
                                if (e.target.value) setGrafikTimeRange('all');
                              }}
                              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                            <span className="text-gray-500 text-xs">s/d</span>
                            <input
                              type="date"
                              value={grafikDateRange.endDate}
                              onChange={(e) => {
                                setGrafikDateRange({ ...grafikDateRange, endDate: e.target.value });
                                if (e.target.value) setGrafikTimeRange('all');
                              }}
                              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* === STATUS PASIEN === */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-700">Status Pasien:</span>
                        {[
                          { key: 'all', label: 'Semua' },
                          { key: 'AKTIF', label: 'Aktif' },
                          { key: 'RAWAT_JALAN', label: 'Rawat Jalan' },
                          { key: 'RAWAT_INAP', label: 'Rawat Inap' }
                        ].map(({ key, label }) => (
                          <button
                            key={key}
                            onClick={() => setPatientStatusFilter(key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${patientStatusFilter === key
                              ? 'bg-green-600 text-white shadow-sm'
                              : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                              }`}
                          >
                            {label}
                          </button>
                        ))}

                        {/* === RESET SEMUA FILTER === */}
                        {(grafikDateRange.startDate ||
                          grafikDateRange.endDate ||
                          grafikTimeRange !== 'all' ||
                          patientStatusFilter !== 'all') && (
                            <button
                              onClick={() => {
                                setGrafikDateRange({ startDate: '', endDate: '' });
                                setGrafikTimeRange('all');
                                setPatientStatusFilter('all');
                              }}
                              className="ml-auto px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                            >
                              Reset Semua
                            </button>
                          )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <Users className="h-5 w-5 text-blue-600" />
                          <h3 className="text-lg font-semibold text-gray-900">Registrasi Pasien per Hari</h3>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                          <LineChart data={grafikData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                              dataKey="date"
                              stroke="#6b7280"
                              style={{ fontSize: '12px' }}
                              tick={{ fill: '#6b7280' }}
                            />
                            <YAxis
                              stroke="#6b7280"
                              style={{ fontSize: '12px' }}
                              tick={{ fill: '#6b7280' }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}
                              labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Line
                              type="monotone"
                              dataKey="pasien"
                              stroke="#3b82f6"
                              strokeWidth={3}
                              dot={{ fill: '#3b82f6', r: 4 }}
                              activeDot={{ r: 6 }}
                              name="Pasien Baru"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <Activity className="h-5 w-5 text-green-600" />
                          <h3 className="text-lg font-semibold text-gray-900">Total Staff Aktif</h3>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                          <LineChart data={grafikData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                              dataKey="date"
                              stroke="#6b7280"
                              style={{ fontSize: '12px' }}
                              tick={{ fill: '#6b7280' }}
                            />
                            <YAxis
                              stroke="#6b7280"
                              style={{ fontSize: '12px' }}
                              tick={{ fill: '#6b7280' }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}
                              labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Line
                              type="monotone"
                              dataKey="staff"
                              stroke="#10b981"
                              strokeWidth={3}
                              dot={{ fill: '#10b981', r: 4 }}
                              activeDot={{ r: 6 }}
                              name="Jumlah Staff"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <Calendar className="h-5 w-5 text-purple-600" />
                          <h3 className="text-lg font-semibold text-gray-900">Total Stok Obat</h3>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                          <LineChart data={grafikData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                              dataKey="date"
                              stroke="#6b7280"
                              style={{ fontSize: '12px' }}
                              tick={{ fill: '#6b7280' }}
                            />
                            <YAxis
                              stroke="#6b7280"
                              style={{ fontSize: '12px' }}
                              tick={{ fill: '#6b7280' }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}
                              labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Line
                              type="monotone"
                              dataKey="obat"
                              stroke="#8b5cf6"
                              strokeWidth={3}
                              dot={{ fill: '#8b5cf6', r: 4 }}
                              activeDot={{ r: 6 }}
                              name="Stok Obat"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <Activity className="h-5 w-5 text-orange-600" />
                          <h3 className="text-lg font-semibold text-gray-900">Transaksi Farmasi per Hari</h3>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                          <LineChart data={grafikData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                              dataKey="date"
                              stroke="#6b7280"
                              style={{ fontSize: '12px' }}
                              tick={{ fill: '#6b7280' }}
                            />
                            <YAxis
                              stroke="#6b7280"
                              style={{ fontSize: '12px' }}
                              tick={{ fill: '#6b7280' }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}
                              labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Line
                              type="monotone"
                              dataKey="transaksi"
                              stroke="#f59e0b"
                              strokeWidth={3}
                              dot={{ fill: '#f59e0b', r: 4 }}
                              activeDot={{ r: 6 }}
                              name="Transaksi"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <History className="h-6 w-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Riwayat Pasien</h3>
                  </div>
                  <button
                    onClick={exportToPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <FileDown className="h-4 w-4" />
                    Export PDF
                  </button>
                </div>

                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    {/* === FILTER PASIEN === */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Pasien:</span>
                      <select
                        value={selectedPatientId}
                        onChange={(e) => setSelectedPatientId(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 min-w-[200px]"
                      >
                        <option value="all">Semua Pasien</option>
                        {patients.map((patient) => (
                          <option key={patient.id} value={patient.id}>
                            {patient.name} - {patient.mrNumber}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* === FILTER ROLE === */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Role:</span>
                      {[
                        { key: 'all', label: 'Semua Role' },
                        { key: 'DOKTER', label: 'Dokter' },
                        { key: 'PERAWAT_POLI', label: 'Perawat Poli' },
                        { key: 'LABORATORIUM', label: 'Laboratorium' },
                        { key: 'PERAWAT_RUANGAN', label: 'Perawat Ruangan' },
                        { key: 'AHLI_GIZI', label: 'Ahli Gizi' },
                        { key: 'FARMASI', label: 'Farmasi' },
                        { key: 'ADMINISTRASI', label: 'Administrasi' }
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setRoleFilter(key)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${roleFilter === key
                            ? 'bg-green-600 text-white shadow-sm'
                            : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                            }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* === PERIODE & TANGGAL === */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 flex-wrap">
                      {/* PERIODE */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Periode:</span>
                        <button
                          onClick={() => {
                            setTimeRange('all');
                            setDateRange({ startDate: '', endDate: '' });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${timeRange === 'all' && !dateRange.startDate && !dateRange.endDate
                            ? 'bg-green-600 text-white shadow-sm'
                            : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
                            }`}
                        >
                          Semua
                        </button>
                        <button
                          onClick={() => {
                            const today = new Date();
                            setDateRange({
                              startDate: today.toISOString().split('T')[0],
                              endDate: today.toISOString().split('T')[0]
                            });
                            setTimeRange('all');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${dateRange.startDate === new Date().toISOString().split('T')[0] &&
                            dateRange.endDate === new Date().toISOString().split('T')[0]
                            ? 'bg-green-600 text-white shadow-sm'
                            : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
                            }`}
                        >
                          Hari Ini
                        </button>
                        {[
                          { key: '7d', label: '7 Hari' },
                          { key: '30d', label: '30 Hari' },
                          { key: '3m', label: '3 Bulan' },
                          { key: '6m', label: '6 Bulan' }
                        ].map(({ key, label }) => (
                          <button
                            key={key}
                            onClick={() => {
                              setTimeRange(key as typeof timeRange);
                              setDateRange({ startDate: '', endDate: '' });
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${timeRange === key && !dateRange.startDate && !dateRange.endDate
                              ? 'bg-green-600 text-white shadow-sm'
                              : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
                              }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      {/* TANGGAL + RESET */}
                      <div className="flex items-center gap-2 flex-wrap mt-2 sm:mt-0">
                        <span className="text-sm font-medium text-gray-700">Tanggal:</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => {
                              setDateRange({ ...dateRange, startDate: e.target.value });
                              setTimeRange('all');
                            }}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                          <span className="text-gray-500 text-xs">s/d</span>
                          <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => {
                              setDateRange({ ...dateRange, endDate: e.target.value });
                              setTimeRange('all');
                            }}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />

                          {/* === RESET SEMUA FILTER === */}
                          {(selectedPatientId !== 'all' ||
                            roleFilter !== 'all' ||
                            timeRange !== 'all' ||
                            dateRange.startDate ||
                            dateRange.endDate) && (
                              <button
                                onClick={() => {
                                  setSelectedPatientId('all');
                                  setRoleFilter('all');
                                  setTimeRange('all');
                                  setDateRange({ startDate: '', endDate: '' });
                                }}
                                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                              >
                                Reset
                              </button>
                            )}
                        </div>
                      </div>
                    </div>

                    {/* === TOTAL AKTIVITAS === */}
                    <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
                      <span className="text-sm text-gray-500 font-medium">
                        Total: {getFilteredActivities().length} aktivitas
                      </span>
                    </div>
                  </div>



                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                      <p className="text-gray-600">Memuat riwayat...</p>
                    </div>
                  ) : Object.keys(activitiesByPatient).length > 0 ? (
                    <div className="space-y-6">
                      {Object.entries(activitiesByPatient)
                        .sort(([, activitiesA], [, activitiesB]) => {
                          const latestA = Math.max(...activitiesA.map((a: any) => a.timestamp.getTime()));
                          const latestB = Math.max(...activitiesB.map((a: any) => a.timestamp.getTime()));
                          return latestB - latestA;
                        })
                        .map(([patientId, activities]) => {
                          const patientInfo = activities[0];
                          return (
                            <div key={patientId} className="bg-white rounded-lg border-2 border-gray-300 overflow-hidden">
                              <div className="bg-linear-to-r from-blue-50 to-green-50 px-6 py-4 border-b-2 border-gray-300">
                                <div className="flex items-center gap-3">
                                  <User className="h-5 w-5 text-green-600" />
                                  <div>
                                    <h3 className="text-base font-bold text-gray-900">{patientInfo.patientName}</h3>
                                    <p className="text-sm text-gray-700 font-medium">
                                      RM: {patientInfo.patientMrNumber} | {activities.length} aktivitas
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="p-6">
                                {renderActivitiesTable(activities)}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                        <History className="h-8 w-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Tidak ada aktivitas</h4>
                      <p className="text-gray-600 mb-1">
                        {roleFilter !== 'all' || selectedPatientId !== 'all'
                          ? 'Tidak ada aktivitas yang sesuai dengan filter'
                          : 'Belum ada riwayat aktivitas'}
                      </p>
                      {(roleFilter !== 'all' || selectedPatientId !== 'all') && (
                        <button
                          onClick={() => {
                            setRoleFilter('all');
                            setSelectedPatientId('all');
                          }}
                          className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                          Reset Filter
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'staff-history' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="h-6 w-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Data Staff</h3>
                  </div>
                  <button
                    onClick={exportStaffToPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
                  >
                    <FileDown className="h-4 w-4" />
                    Export PDF
                  </button>
                </div>

                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    {/* === FILTER ROLE === */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Role:</span>
                      {[
                        { key: 'all', label: 'Semua Role' },
                        { key: 'DOKTER_SPESIALIS', label: 'Dokter Spesialis' },
                        { key: 'PERAWAT_RUANGAN', label: 'Perawat Ruangan' },
                        { key: 'PERAWAT_POLI', label: 'Perawat Poli' },
                        { key: 'LABORATORIUM', label: 'Laboratorium' },
                        { key: 'AHLI_GIZI', label: 'Ahli Gizi' },
                        { key: 'FARMASI', label: 'Farmasi' },
                        { key: 'ADMINISTRASI', label: 'Administrasi' },
                        { key: 'MANAJER', label: 'Manajer' }
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setRoleFilter(key)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${roleFilter === key
                            ? 'bg-green-600 text-white shadow-sm'
                            : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                            }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* === PERIODE + TANGGAL === */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 flex-wrap">
                      {/* PERIODE */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Periode:</span>
                        <button
                          onClick={() => {
                            setTimeRange('all');
                            setDateRange({ startDate: '', endDate: '' });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${timeRange === 'all' && !dateRange.startDate && !dateRange.endDate
                            ? 'bg-green-600 text-white shadow-sm'
                            : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
                            }`}
                        >
                          Semua
                        </button>
                        <button
                          onClick={() => {
                            const today = new Date();
                            setDateRange({
                              startDate: today.toISOString().split('T')[0],
                              endDate: today.toISOString().split('T')[0]
                            });
                            setTimeRange('all');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${dateRange.startDate === new Date().toISOString().split('T')[0] &&
                            dateRange.endDate === new Date().toISOString().split('T')[0]
                            ? 'bg-green-600 text-white shadow-sm'
                            : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
                            }`}
                        >
                          Hari Ini
                        </button>
                        {[
                          { key: '7d', label: '7 Hari' },
                          { key: '30d', label: '30 Hari' },
                          { key: '3m', label: '3 Bulan' },
                          { key: '6m', label: '6 Bulan' }
                        ].map(({ key, label }) => (
                          <button
                            key={key}
                            onClick={() => {
                              setTimeRange(key as typeof timeRange);
                              setDateRange({ startDate: '', endDate: '' });
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${timeRange === key && !dateRange.startDate && !dateRange.endDate
                              ? 'bg-green-600 text-white shadow-sm'
                              : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
                              }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      {/* TANGGAL + RESET */}
                      <div className="flex items-center gap-2 flex-wrap mt-2 sm:mt-0">
                        <span className="text-sm font-medium text-gray-700">Tanggal:</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => {
                              setDateRange({ ...dateRange, startDate: e.target.value });
                              setTimeRange('all');
                            }}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                          <span className="text-gray-500 text-xs">s/d</span>
                          <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => {
                              setDateRange({ ...dateRange, endDate: e.target.value });
                              setTimeRange('all');
                            }}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />

                          {/* === RESET SEMUA FILTER === */}
                          {(roleFilter !== 'all' ||
                            timeRange !== 'all' ||
                            dateRange.startDate ||
                            dateRange.endDate) && (
                              <button
                                onClick={() => {
                                  setRoleFilter('all');
                                  setTimeRange('all');
                                  setDateRange({ startDate: '', endDate: '' });
                                }}
                                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                              >
                                Reset
                              </button>
                            )}
                        </div>
                      </div>
                    </div>

                    {/* === TOTAL STAFF === */}
                    <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
                      <span className="text-sm text-gray-500 font-medium">
                        Total: {getFilteredStaffActivities().length} staff
                      </span>
                    </div>
                  </div>


                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                      <p className="text-gray-600">Memuat data staff...</p>
                    </div>
                  ) : getFilteredStaffActivities().length > 0 ? (
                    <div className="bg-white rounded-lg border-2 border-gray-300 overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y-2 divide-gray-300">
                          <thead className="bg-green-50 to-blue-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider border-r border-gray-200">
                                No
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider border-r border-gray-200">
                                Tanggal Dibuat
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider border-r border-gray-200">
                                Nama Staff
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider border-r border-gray-200">
                                Employee ID
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider border-r border-gray-200">
                                Role
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider border-r border-gray-200">
                                Email
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider border-r border-gray-200">
                                Username
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {getFilteredStaffActivities()
                              .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                              .map((activity, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-4 py-3 text-sm font-bold text-gray-900 border-r border-gray-200">
                                    {idx + 1}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap border-r border-gray-200">
                                    <div className="text-sm font-bold text-gray-900">{activity.timestamp.toLocaleDateString('id-ID')}</div>
                                    <div className="text-xs text-gray-600">{activity.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                                  </td>
                                  <td className="px-4 py-3 text-sm font-bold text-gray-900 border-r border-gray-200">
                                    {activity.staffName}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                                    <span className="font-mono font-semibold">{activity.staffEmployeeId}</span>
                                  </td>
                                  <td className="px-4 py-3 border-r border-gray-200">
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadgeColor(activity.role)}`}>
                                      {activity.role.replace(/_/g, ' ')}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                                    {activity.email}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                                    <span className="font-mono">{activity.username}</span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
                                      AKTIF
                                    </span>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data staff</h4>
                      <p className="text-gray-600 mb-1">
                        {roleFilter !== 'all'
                          ? 'Tidak ada staff yang sesuai dengan filter'
                          : 'Belum ada data staff'}
                      </p>
                      {roleFilter !== 'all' && (
                        <button
                          onClick={() => setRoleFilter('all')}
                          className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                          Reset Filter
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div >
  );
};

export default ManajerDashboard;