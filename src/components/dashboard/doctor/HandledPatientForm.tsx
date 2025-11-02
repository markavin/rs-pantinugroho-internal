import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Save, User, Calendar, Activity, AlertCircle, FileText, Edit, Eye, Trash2, Clock, Flag, CheckCircle2, Info, Heart, Thermometer, Users2, Stethoscope, History, TrendingUp, Droplet, Droplets, Wind, Pill, ClipboardList, FlaskConical, CheckSquare, Square } from 'lucide-react';

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

interface HandledPatientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  mode: 'add' | 'edit' | 'view';
  selectedHandledPatient?: HandledPatient | null;
  availablePatients: Patient[];
  handledPatients: HandledPatient[];
  loading?: boolean;
}

const HandledPatientForm: React.FC<HandledPatientFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  selectedHandledPatient,
  availablePatients,
  handledPatients,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    patientId: '',
    diagnosis: '',
    treatmentPlan: '',
    notes: '',
    status: 'SEDANG_DITANGANI',
    priority: 'NORMAL',
    nextVisitDate: '',
    estimatedDuration: '',
    specialInstructions: '',
    isPulangPaksa: false,
    autoCalculateNextVisit: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedPatientData, setSelectedPatientData] = useState<Patient | null>(null);
  const [patientHistory, setPatientHistory] = useState<{
    complaints: any[];
    vitals: any[];
    labs: any[];
    visitations: any[];
    handledHistory: any[];
  }>({
    complaints: [],
    vitals: [],
    labs: [],
    visitations: [],
    handledHistory: []
  });
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [requestLabTests, setRequestLabTests] = useState(false);
  const [labTestsRequested, setLabTestsRequested] = useState<string[]>([]);
  const [selectAllLabs, setSelectAllLabs] = useState(false);

  const availableLabTests = [
    'Gula Darah Sewaktu',
    'Gula Darah Puasa',
    'Glukosa 2 Jam PP',
    'HbA1c',
    'Kolesterol Total',
    'LDL',
    'HDL',
    'Trigliserida',
    'Urea',
    'Kreatinin',
    'Albumin',
    'SGOT (AST)',
    'SGPT (ALT)',
    'Hemoglobin (Hb)',
    'Leukosit (AL)'
  ];

  const fetchPatientHistory = async (patientId: string) => {
    setLoadingHistory(true);
    try {
      const [recordsResponse, labsResponse, visitationsResponse, handledResponse] = await Promise.all([
        fetch(`/api/patient-records?patientId=${patientId}`),
        fetch(`/api/lab-results?patientId=${patientId}`),
        fetch(`/api/visitations?patientId=${patientId}`),
        fetch(`/api/handled-patients?patientId=${patientId}`)
      ]);

      const complaints = [];
      const vitals = [];

      if (recordsResponse.ok) {
        const records = await recordsResponse.json();
        complaints.push(...records.filter((r: any) => r.recordType === 'COMPLAINTS'));
        vitals.push(...records.filter((r: any) => r.recordType === 'VITAL_SIGNS'));
      }

      const labs = labsResponse.ok ? await labsResponse.json() : [];
      const visitations = visitationsResponse.ok ? await visitationsResponse.json() : [];
      const handledHistory = handledResponse.ok ? await handledResponse.json() : [];

      setPatientHistory({ complaints, vitals, labs, visitations, handledHistory });
    } catch (error) {
      console.error('Error fetching patient history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSelectAllLabs = () => {
    if (selectAllLabs) {
      setLabTestsRequested([]);
    } else {
      setLabTestsRequested([...availableLabTests]);
    }
    setSelectAllLabs(!selectAllLabs);
  };

  useEffect(() => {
    setSelectAllLabs(labTestsRequested.length === availableLabTests.length && labTestsRequested.length > 0);
  }, [labTestsRequested]);

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

  const parseEstimatedDuration = (duration: string): Date | null => {
    if (!duration) return null;

    const today = new Date();
    const lowerDuration = duration.toLowerCase();

    let days = 0;

    if (lowerDuration.includes('hari')) {
      const match = lowerDuration.match(/(\d+)\s*hari/);
      if (match) days = parseInt(match[1]);
    } else if (lowerDuration.includes('minggu')) {
      const match = lowerDuration.match(/(\d+)\s*minggu/);
      if (match) days = parseInt(match[1]) * 7;
    } else if (lowerDuration.includes('bulan')) {
      const match = lowerDuration.match(/(\d+)\s*bulan/);
      if (match) days = parseInt(match[1]) * 30;
    } else if (lowerDuration.includes('tahun')) {
      const match = lowerDuration.match(/(\d+)\s*tahun/);
      if (match) days = parseInt(match[1]) * 365;
    }

    if (days > 0) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + days);
      return nextDate;
    }

    return null;
  };

  const suggestPriority = (patient: Patient): 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' => {
    if (!patient) return 'NORMAL';

    if (patient.riskLevel === 'HIGH') {
      if (patient.bmi && patient.bmi > 40) return 'URGENT';
      return 'HIGH';
    }
    if (patient.riskLevel === 'MEDIUM') {
      if (patient.bmi && (patient.bmi < 18.5 || patient.bmi > 35)) return 'HIGH';
      return 'NORMAL';
    }
    if (patient.riskLevel === 'LOW') {
      if (patient.bmi && (patient.bmi < 16 || patient.bmi > 37)) return 'HIGH';
      return 'NORMAL';
    }

    return 'NORMAL';
  };

  const getCommonInstructions = () => [
    'Diet rendah gula dan karbohidrat sederhana',
    'Olahraga rutin 30 menit/hari',
    'Cek gula darah harian',
    'Minum obat sesuai resep dokter',
    'Kontrol rutin setiap 2 minggu',
    'Hindari makanan berlemak tinggi',
    'Konsumsi sayur dan buah secukupnya',
    'Jaga berat badan ideal'
  ];

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  useEffect(() => {
    if (formData.patientId && availablePatients.length > 0) {
      const patient = availablePatients.find(p => p.id === formData.patientId);
      setSelectedPatientData(patient || null);

      if (patient) {
        fetchPatientHistory(patient.id);
      }

      if (patient && mode === 'add') {
        const suggestedPriority = suggestPriority(patient);
        setFormData(prev => ({ ...prev, priority: suggestedPriority }));
      }
    } else {
      setSelectedPatientData(null);
      setPatientHistory({ complaints: [], vitals: [], labs: [], visitations: [], handledHistory: [] });
    }
  }, [formData.patientId, availablePatients, mode]);

  useEffect(() => {
    if (formData.estimatedDuration && formData.autoCalculateNextVisit) {
      const calculatedDate = parseEstimatedDuration(formData.estimatedDuration);
      if (calculatedDate) {
        const dateString = calculatedDate.toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, nextVisitDate: dateString }));
      }
    }
  }, [formData.estimatedDuration, formData.autoCalculateNextVisit]);

  useEffect(() => {
    if (isOpen && mode === 'add') {
      setFormData({
        patientId: '',
        diagnosis: '',
        treatmentPlan: '',
        notes: '',
        status: 'SEDANG_DITANGANI',
        priority: 'NORMAL',
        nextVisitDate: '',
        estimatedDuration: '',
        specialInstructions: '',
        isPulangPaksa: false,
        autoCalculateNextVisit: true
      });
      setRequestLabTests(false);
      setLabTestsRequested([]);
    } else if (isOpen && selectedHandledPatient && (mode === 'edit' || mode === 'view')) {
      const isPulangPaksa = selectedHandledPatient.notes?.toLowerCase().includes('pulang paksa') || false;

      setFormData({
        patientId: selectedHandledPatient.patientId,
        diagnosis: selectedHandledPatient.diagnosis || '',
        treatmentPlan: selectedHandledPatient.treatmentPlan || '',
        notes: selectedHandledPatient.notes || '',
        status: selectedHandledPatient.status,
        priority: selectedHandledPatient.priority,
        nextVisitDate: selectedHandledPatient.nextVisitDate
          ? selectedHandledPatient.nextVisitDate.split('T')[0]
          : '',
        estimatedDuration: selectedHandledPatient.estimatedDuration || '',
        specialInstructions: selectedHandledPatient.specialInstructions || '',
        isPulangPaksa,
        autoCalculateNextVisit: false
      });

      if (selectedHandledPatient.patient) {
        setSelectedPatientData(selectedHandledPatient.patient);
        fetchPatientHistory(selectedHandledPatient.patient.id);
      }
    }
  }, [isOpen, mode, selectedHandledPatient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') return;

    if (!formData.patientId && mode === 'add') {
      alert('Silakan pilih pasien terlebih dahulu');
      return;
    }

    if (formData.nextVisitDate) {
      const nextDate = new Date(formData.nextVisitDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (nextDate < today) {
        alert('Tanggal kunjungan berikutnya tidak boleh kurang dari hari ini');
        return;
      }
    }

    setSubmitting(true);
    try {
      const submitData = {
        ...formData,
        notes: formData.isPulangPaksa ?
          (formData.notes ? `${formData.notes} - Pulang paksa` : 'Pulang paksa') :
          formData.notes,
        requestLabTests,
        labTestsRequested
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Terjadi kesalahan saat menyimpan data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addInstructionToField = (instruction: string) => {
    const currentInstructions = formData.specialInstructions;
    const newInstructions = currentInstructions
      ? `${currentInstructions}\n• ${instruction}`
      : `• ${instruction}`;
    setFormData(prev => ({ ...prev, specialInstructions: newInstructions }));
  };

  if (!isOpen) return null;

  const getAvailablePatients = () => {
    return availablePatients.filter(patient => {
      const isActiveStatus =
        patient.status === 'AKTIF' ||
        patient.status === 'RAWAT_JALAN' ||
        patient.status === 'RAWAT_INAP';

      return isActiveStatus;
    });
  };

  const availablePatientsFiltered = getAvailablePatients();
  const isViewMode = mode === 'view';
  const isReadOnly = isViewMode;
  const isDisabled = isViewMode || submitting;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-green-50">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Stethoscope className="h-6 w-6 mr-2 text-green-600" />
            {mode === 'add' && 'Tambah Pasien Ditangani'}
            {mode === 'edit' && 'Edit Pasien Ditangani'}
            {isViewMode && 'Detail Pasien Ditangani'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-700 hover:text-gray-600"
            disabled={submitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {mode === 'add' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Pasien *
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 text-base font-medium"
                value={formData.patientId}
                onChange={(e) => handleInputChange('patientId', e.target.value)}
                disabled={submitting}
              >
                <option value="" className="text-gray-500">
                  Pilih pasien...
                </option>
                {availablePatientsFiltered.map((patient) => (
                  <option
                    key={patient.id}
                    value={patient.id}
                    className="text-gray-700 font-medium"
                  >
                    {patient.name} - {patient.mrNumber}
                    ({calculateAge(patient.birthDate)} tahun, {patient.gender === "MALE" ? "L" : "P"})
                    {patient.diabetesType && ` - ${patient.diabetesType}`}
                  </option>
                ))}
              </select>
              {availablePatientsFiltered.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Tidak ada pasien yang tersedia untuk ditangani saat ini
                </p>
              )}
            </div>
          )}

          {selectedPatientData && (
            <div className="bg-white p-6 rounded-xl border border-green-400">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-gray-900">{selectedPatientData.name}</h4>
                    <p className="text-gray-600 font-medium">
                      {selectedPatientData.mrNumber} • {calculateAge(selectedPatientData.birthDate)} tahun • {selectedPatientData.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskLevelColor(selectedPatientData.riskLevel)}`}>
                  Risk: {selectedPatientData.riskLevel}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Activity className="h-4 w-4 text-orange-600" />
                    <span className="text-xs font-medium text-gray-600">BMI</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedPatientData.bmi ? selectedPatientData.bmi.toFixed(1) : 'N/A'}
                  </p>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Heart className="h-4 w-4 text-red-600" />
                    <span className="text-xs font-medium text-gray-600">Diabetes</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedPatientData.diabetesType || 'Tidak ada'}
                  </p>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Users2 className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-medium text-gray-600">Penjamin</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedPatientData.insuranceType}
                  </p>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-xs font-medium text-gray-600">Alergi</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedPatientData.allergies.length > 0 ? `${selectedPatientData.allergies.length} item` : 'Tidak ada'}
                  </p>
                </div>
              </div>

              {selectedPatientData.allergies.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-red-700 mb-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Alergi Pasien:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatientData.allergies.map((allergy, index) => (
                      <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium border border-red-200">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAMBAH: Riwayat Penanganan Pasien */}
          {selectedPatientData && patientHistory.handledHistory.length > 0 && (
            <div className="bg-white rounded-lg border border-green-400 overflow-hidden">
              <div className="bg-green-50 px-4 py-2 border-b border-green-200">
                <h4 className="font-semibold text-gray-900 mb-2 mt-2 flex items-center">
                  <ClipboardList className="h-5 w-5 mr-2 text-green-600" />
                  Riwayat Penanganan Pasien (5 terakhir)
                </h4>
              </div>

              {loadingHistory ? (
                <div className="text-center py-4">
                  <div className="animate-spin h-6 w-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Tanggal & Waktu</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Status</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Prioritas</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Ditangani Oleh</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Diagnosis</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Rencana Pengobatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {patientHistory.handledHistory
                        .sort((a: any, b: any) => new Date(b.handledDate).getTime() - new Date(a.handledDate).getTime())
                        .slice(0, 5)
                        .map((handled: any, idx: number) => (
                          <tr key={idx} className="hover:bg-purple-50">
                            <td className="px-3 py-2 text-xs text-gray-900 font-medium whitespace-nowrap">
                              {new Date(handled.handledDate).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })} • {new Date(handled.handledDate).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getHandledStatusColor(handled.status)}`}>
                                {getHandledStatusLabel(handled.status)}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(handled.priority)}`}>
                                {handled.priority}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-900">
                              <div>
                                <p className="font-semibold">{handled.handler?.name || 'Unknown'}</p>
                                <p className="text-gray-600 text-[10px]">{handled.handler?.role || 'Unknown'}</p>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-900">
                              {handled.diagnosis ? (
                                <p className="line-clamp-2">{handled.diagnosis}</p>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-900">
                              {handled.treatmentPlan ? (
                                <p className="line-clamp-2">{handled.treatmentPlan}</p>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Patient History Section - Format Tabel */}
          {selectedPatientData && (patientHistory.complaints.length > 0 || patientHistory.vitals.length > 0 || patientHistory.labs.length > 0) && (
            <div className="bg-white p-4 rounded-xl border border-green-400">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <History className="h-5 w-5 mr-2 text-green-600" />
                Riwayat Pemeriksaan Terakhir
              </h4>

              {loadingHistory ? (
                <div className="text-center py-4">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Keluhan Terakhir - Table Format */}
                  {patientHistory.complaints.length > 0 && (
                    <div className="bg-white rounded-lg border border-green-200 overflow-hidden">
                      <div className="bg-green-50 px-4 py-2 border-b border-green-200">
                        <h5 className="text-sm font-semibold text-gray-900 flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-green-600" />
                          Keluhan Pasien ({Math.min(3, patientHistory.complaints.length)} terakhir)
                        </h5>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Tanggal & Waktu</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Tingkat</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Keluhan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {patientHistory.complaints.slice(0, 3).map((complaint, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-xs text-gray-900 font-medium whitespace-nowrap">
                                  {new Date(complaint.createdAt).toLocaleDateString('id-ID', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })} • {new Date(complaint.createdAt).toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {complaint.metadata?.severity && (
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${complaint.metadata.severity === 'BERAT' ? 'bg-red-100 text-red-800' :
                                      complaint.metadata.severity === 'SEDANG' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                      }`}>
                                      {complaint.metadata.severity}
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-900">{complaint.content}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {(patientHistory.vitals.length > 0 || patientHistory.visitations.filter((v: any) =>
                    v.temperature || v.bloodPressure || v.heartRate || v.respiratoryRate || v.oxygenSaturation
                  ).length > 0) && (
                      <div className="bg-white rounded-lg border border-green-200 overflow-hidden">
                        <div className="bg-green-50 px-4 py-2 border-b border-green-200">
                          <h5 className="text-sm font-semibold text-gray-900 flex items-center">
                            <Activity className="h-4 w-4 mr-2 text-green-600" />
                            Tanda Vital (3 terakhir dari semua pemeriksaan)
                          </h5>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Tanggal & Waktu</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Sumber</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Suhu (°C)</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Nadi (bpm)</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">TD (mmHg)</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">SpO2 (%)</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">RR (x/mnt)</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">GDS (mg/dL)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {(() => {
                                // Gabungkan vitals dari records dan visitations
                                const allVitals = [
                                  ...patientHistory.vitals.map((v: any) => ({
                                    ...v,
                                    source: 'Pemeriksaan',
                                    date: new Date(v.createdAt)
                                  })),
                                  ...patientHistory.visitations
                                    .filter((v: any) => v.temperature || v.bloodPressure || v.heartRate || v.respiratoryRate || v.oxygenSaturation)
                                    .map((v: any) => ({
                                      ...v,
                                      source: 'Visitasi',
                                      date: new Date(v.createdAt)
                                    }))
                                ];

                                // Sort by date descending and take last 3
                                const sortedVitals = allVitals
                                  .sort((a, b) => b.date.getTime() - a.date.getTime())
                                  .slice(0, 3);

                                return sortedVitals.map((vital, idx) => {
                                  const metadata = vital.metadata || {};
                                  return (
                                    <tr key={idx} className="hover:bg-gray-50">
                                      <td className="px-3 py-2 text-xs text-gray-900 font-medium whitespace-nowrap">
                                        {vital.date.toLocaleDateString('id-ID', {
                                          day: '2-digit',
                                          month: 'short',
                                          year: 'numeric'
                                        })} • {vital.date.toLocaleTimeString('id-ID', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${vital.source === 'Visitasi'
                                          ? 'bg-purple-100 text-purple-800'
                                          : 'bg-blue-100 text-blue-800'
                                          }`}>
                                          {vital.source}
                                          {vital.shift && ` - ${vital.shift}`}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                          <Thermometer className="h-3 w-3 text-blue-500" />
                                          <span className="text-xs text-gray-900 font-semibold">
                                            {vital.temperature || '-'}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                          <Heart className="h-3 w-3 text-red-500" />
                                          <span className="text-xs text-gray-900 font-semibold">
                                            {vital.heartRate || '-'}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                          <Activity className="h-3 w-3 text-purple-500" />
                                          <span className="text-xs text-gray-900 font-semibold">
                                            {vital.bloodPressure || '-'}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                          <Droplets className="h-3 w-3 text-emerald-500" />
                                          <span className="text-xs text-gray-900 font-semibold">
                                            {vital.oxygenSaturation || metadata.oxygenSaturation || '-'}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                          <Wind className="h-3 w-3 text-pink-500" />
                                          <span className="text-xs text-gray-900 font-semibold">
                                            {vital.respiratoryRate || metadata.respiratoryRate || '-'}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        <span className="text-xs text-gray-900 font-semibold">
                                          {vital.bloodSugar || '-'}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                });
                              })()}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  {/* Lab Results Terakhir - Table Format */}
                  {patientHistory.labs.length > 0 && (
                    <div className="bg-white rounded-lg border border-green-200 overflow-hidden">
                      <div className="bg-green-50 px-4 py-2 border-b border-green-200">
                        <h5 className="text-sm font-semibold text-gray-900 flex items-center">
                          <Activity className="h-4 w-4 mr-2 text-green-600" />
                          Hasil Laboratorium ({Math.min(3, patientHistory.labs.length)} sesi terakhir)
                        </h5>
                      </div>
                      <div className="overflow-x-auto">
                        {(() => {
                          // Define proper types
                          interface GroupedSession {
                            displayDate: string;
                            displayTime: string;
                            labs: any[];
                            timestamp: number;
                          }

                          // Group labs by exact datetime
                          const groupedByDateTime: Record<string, GroupedSession> = patientHistory.labs.reduce((acc: Record<string, GroupedSession>, lab: any) => {
                            const dateTime = new Date(lab.testDate);
                            const roundedMinutes = Math.floor(dateTime.getMinutes() / 5) * 5;
                            const dateKey = `${dateTime.getFullYear()}-${String(dateTime.getMonth() + 1).padStart(2, '0')}-${String(dateTime.getDate()).padStart(2, '0')}_${String(dateTime.getHours()).padStart(2, '0')}:${String(roundedMinutes).padStart(2, '0')}`;

                            if (!acc[dateKey]) {
                              acc[dateKey] = {
                                displayDate: dateTime.toLocaleDateString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                }),
                                displayTime: dateTime.toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }),
                                labs: [],
                                timestamp: dateTime.getTime()
                              };
                            }
                            acc[dateKey].labs.push(lab);
                            return acc;
                          }, {});

                          const allTestTypes = Array.from(new Set(
                            patientHistory.labs.map((lab: any) => lab.testType)
                          ));

                          const sortedSessions = Object.entries(groupedByDateTime)
                            .sort(([, a], [, b]) => b.timestamp - a.timestamp)
                            .slice(0, 3);

                          return (
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Tanggal & Waktu</th>
                                  {allTestTypes.map((testType: string) => (
                                    <th key={testType} className="px-3 py-2 text-center text-xs font-medium text-gray-700">
                                      {testType}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {sortedSessions.map(([dateKey, data], idx) => (
                                  <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 text-xs text-gray-900 font-medium whitespace-nowrap">
                                      {data.displayDate} • {data.displayTime}
                                    </td>
                                    {allTestTypes.map((testType: string) => {
                                      const lab = data.labs.find((l: any) => l.testType === testType);

                                      if (!lab) {
                                        return (
                                          <td key={testType} className="px-3 py-2 text-center text-xs text-gray-400">
                                            -
                                          </td>
                                        );
                                      }

                                      let cellClass = 'px-3 py-2 text-center';
                                      if (lab.status === 'CRITICAL') {
                                        cellClass += ' bg-red-50';
                                      } else if (lab.status === 'HIGH') {
                                        cellClass += ' bg-orange-50';
                                      } else if (lab.status === 'LOW') {
                                        cellClass += ' bg-yellow-50';
                                      } else if (lab.status === 'NORMAL') {
                                        cellClass += ' bg-green-50';
                                      }

                                      return (
                                        <td key={testType} className={cellClass}>
                                          <div className="flex flex-col items-center gap-1">
                                            <span className="text-xs font-bold text-gray-900">
                                              {lab.value}
                                            </span>
                                            <span className="text-[10px] text-gray-500">
                                              Normal: {lab.normalRange}
                                            </span>
                                            <span className={`text-[10px] font-semibold ${lab.status === 'CRITICAL' ? 'text-red-700' :
                                              lab.status === 'HIGH' ? 'text-orange-700' :
                                                lab.status === 'LOW' ? 'text-yellow-700' :
                                                  'text-green-700'
                                              }`}>
                                              {lab.status === 'CRITICAL' ? 'KRITIS' :
                                                lab.status === 'HIGH' ? 'TINGGI' :
                                                  lab.status === 'LOW' ? 'RENDAH' :
                                                    'NORMAL'}
                                            </span>
                                            {lab.notes && (
                                              <span className="text-[10px] text-gray-600 italic" title={lab.notes}>
                                                {lab.notes.substring(0, 15)}{lab.notes.length > 15 ? '...' : ''}
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* SEAR B Results - Table Format */}
                  {patientHistory.vitals.filter((v) => v.metadata?.searB).length > 0 && (
                    <div className="bg-white rounded-lg border border-green-200 overflow-hidden">
                      <div className="bg-green-50 px-4 py-2 border-b border-green-200">
                        <h5 className="text-sm font-semibold text-gray-900 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                          Prediksi Risiko Kardiovaskular (SEAR B WHO) - {Math.min(3, patientHistory.vitals.filter((v) => v.metadata?.searB).length)} terakhir
                        </h5>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Tanggal & Waktu</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Risiko 10 Tahun</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Level</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Umur</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Kolesterol</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Merokok</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Diabetes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {patientHistory.vitals
                              .filter((v) => v.metadata?.searB)
                              .slice(0, 3)
                              .map((vital, idx) => {
                                const searB = vital.metadata.searB;
                                const bgColorClass =
                                  searB.level === 'Sangat Rendah' ? 'bg-green-50' :
                                    searB.level === 'Rendah' ? 'bg-yellow-50' :
                                      searB.level === 'Sedang' ? 'bg-orange-50' :
                                        searB.level === 'Tinggi' ? 'bg-red-50' : 'bg-red-100';

                                return (
                                  <tr key={idx} className={`hover:brightness-95 ${bgColorClass}`}>
                                    <td className="px-3 py-2 text-xs text-gray-900 font-medium whitespace-nowrap">
                                      {new Date(vital.createdAt).toLocaleDateString('id-ID', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                      })} • {new Date(vital.createdAt).toLocaleTimeString('id-ID', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      <span className="text-lg font-bold text-gray-900">{searB.range}</span>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      <span className={`px-2 py-1 rounded text-xs font-semibold ${searB.level === 'Sangat Rendah' ? 'bg-green-100 text-green-800' :
                                        searB.level === 'Rendah' ? 'bg-yellow-100 text-yellow-800' :
                                          searB.level === 'Sedang' ? 'bg-orange-100 text-orange-800' :
                                            searB.level === 'Tinggi' ? 'bg-red-100 text-red-800' :
                                              'bg-red-900 text-white'
                                        }`}>
                                        {searB.level}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 text-center text-xs text-gray-900 font-semibold">
                                      {searB.age} tahun
                                    </td>
                                    <td className="px-3 py-2 text-center text-xs text-gray-900 font-semibold">
                                      {searB.cholesterolMmol} mmol/L
                                    </td>
                                    <td className="px-3 py-2 text-center text-xs text-gray-900 font-semibold">
                                      {searB.isSmoker ? 'Ya' : 'Tidak'}
                                    </td>
                                    <td className="px-3 py-2 text-center text-xs text-gray-900 font-semibold">
                                      {searB.hasDiabetes ? 'Ya' : 'Tidak'}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}


                  {patientHistory.visitations.filter((v: any) => v.medicationsGiven && v.medicationsGiven.length > 0).length > 0 && (
                    <div className="bg-white rounded-lg border border-green-200 overflow-hidden">
                      <div className="bg-green-50 px-4 py-2 border-b border-green-200">
                        <h5 className="text-sm font-semibold text-gray-900 flex items-center">
                          <Pill className="h-4 w-4 mr-2 text-green-600" />
                          Obat-obatan yang Diberikan (3 visitasi terakhir)
                        </h5>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Tanggal & Waktu</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Shift</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Obat yang Diberikan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {patientHistory.visitations
                              .filter((v: any) => v.medicationsGiven && v.medicationsGiven.length > 0)
                              .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                              .slice(0, 3)
                              .map((visit: any, idx: number) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 text-xs text-gray-900 font-medium whitespace-nowrap">
                                    {new Date(visit.createdAt).toLocaleDateString('id-ID', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric'
                                    })} • {new Date(visit.createdAt).toLocaleTimeString('id-ID', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${visit.shift === 'PAGI' ? 'bg-orange-100 text-orange-800' :
                                      visit.shift === 'SORE' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-purple-100 text-purple-800'
                                      }`}>
                                      {visit.shift}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2">
                                    <ul className="space-y-1">
                                      {visit.medicationsGiven.map((med: string, medIdx: number) => (
                                        <li key={medIdx} className="flex items-start text-xs text-gray-900">
                                          <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mr-2 mt-1"></span>
                                          <span>{med}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}



          {/* Form fields tetap sama seperti sebelumnya */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnosis
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700"
                placeholder="Diagnosis pasien"
                value={formData.diagnosis}
                onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                readOnly={isReadOnly}
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioritas
                {selectedPatientData && mode === 'add' && (
                  <span className="text-xs text-blue-600 ml-1">(Auto-suggested berdasarkan level risiko)</span>
                )}
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                disabled={isDisabled}
              >
                <option value="LOW">Rendah</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">Tinggi</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Penanganan
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                disabled={isDisabled}
              >
                <option value="SEDANG_DITANGANI">Sedang Ditangani</option>
                <option value="KONSULTASI">Konsultasi</option>
                <option value="OBSERVASI">Observasi</option>
                <option value="EMERGENCY">Emergency</option>
                <option value="STABIL">Stabil</option>
                <option value="RUJUK_KELUAR">Rujuk Keluar</option>
                <option value="SELESAI">Selesai</option>
                <option value="MENINGGAL">Meninggal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimasi Durasi Pengobatan
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700"
                placeholder="e.g., 2 minggu, 1 bulan, 14 hari"
                value={formData.estimatedDuration}
                onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                readOnly={isReadOnly}
                disabled={submitting}
              />
              <p className="text-xs text-gray-500 mt-1">Format: angka + hari/minggu/bulan/tahun</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Kunjungan Berikutnya
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700"
                  value={formData.nextVisitDate}
                  onChange={(e) => handleInputChange('nextVisitDate', e.target.value)}
                  readOnly={isReadOnly}
                  disabled={submitting}
                />
                {mode === 'add' && (
                  <label className="flex items-center text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={formData.autoCalculateNextVisit}
                      onChange={(e) => handleInputChange('autoCalculateNextVisit', e.target.checked)}
                      className="mr-2 rounded"
                    />
                    Auto-calculate dari estimasi durasi
                  </label>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rencana Pengobatan
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700"
              rows={3}
              placeholder="Rencana pengobatan dan tindakan"
              value={formData.treatmentPlan}
              onChange={(e) => handleInputChange('treatmentPlan', e.target.value)}
              readOnly={isReadOnly}
              disabled={submitting}
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <label className="flex items-start space-x-3 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={requestLabTests}
                onChange={(e) => setRequestLabTests(e.target.checked)}
                className="mt-1 h-4 w-4 text-yellow-600 rounded focus:ring-2 focus:ring-yellow-500"
                disabled={isViewMode}
              />
              <div>
                <div className="flex items-center space-x-2">
                  <FlaskConical className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-gray-900">Permintaan Pemeriksaan Lab Ulang</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Kirim permintaan ke Perawat Poli untuk melakukan pemeriksaan lab ulang
                </p>
              </div>
            </label>

            {requestLabTests && !isViewMode && (
              <div className="mt-3 pl-7">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Pilih Pemeriksaan yang Diminta:
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllLabs}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-amber-600 hover:text-amber-700 rounded-lg transition-colors"
                  >
                    {selectAllLabs ? (
                      <>
                        <CheckSquare className="h-4 w-4" />
                        <span>Batalkan Semua</span>
                      </>
                    ) : (
                      <>
                        <Square className="h-4 w-4" />
                        <span>Pilih Semua</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {availableLabTests.map((test) => (
                    <label key={test} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={labTestsRequested.includes(test)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setLabTestsRequested([...labTestsRequested, test]);
                          } else {
                            setLabTestsRequested(labTestsRequested.filter(t => t !== test));
                          }
                        }}
                        className="h-4 w-4 text-yellow-600 rounded"
                      />
                      <span className="text-gray-700">{test}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {requestLabTests && isViewMode && labTestsRequested.length > 0 && (
              <div className="mt-3 pl-7">
                <p className="text-sm font-medium text-gray-700 mb-2">Pemeriksaan yang Diminta:</p>
                <div className="flex flex-wrap gap-2">
                  {labTestsRequested.map((test) => (
                    <span key={test} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      {test}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Instruksi Khusus
              </label>
              {!isViewMode && (
                <div className="text-xs text-gray-500">
                  Quick add:
                </div>
              )}
            </div>

            {!isViewMode && (
              <div className="mb-3 flex flex-wrap gap-2">
                {getCommonInstructions().slice(0, 4).map((instruction, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => addInstructionToField(instruction)}
                    className="text-xs bg-white text-green-700 px-2 py-1 rounded-full hover:bg-green-200 transition-colors"
                    disabled={submitting}
                  >
                    + {instruction}
                  </button>
                ))}
              </div>
            )}

            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700"
              rows={4}
              placeholder="Instruksi khusus untuk pasien"
              value={formData.specialInstructions}
              onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
              readOnly={isReadOnly}
              disabled={submitting}
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Catatan
            </label>

            {!isViewMode && formData.status === 'SELESAI' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <label className="flex items-center text-sm font-medium text-yellow-800">
                  <input
                    type="checkbox"
                    checked={formData.isPulangPaksa}
                    onChange={(e) => handleInputChange('isPulangPaksa', e.target.checked)}
                    className="mr-2 text-yellow-600 focus:ring-yellow-500 border-yellow-300 rounded"
                    disabled={submitting}
                  />
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Pasien pulang paksa (tanpa rekomendasi medis)
                </label>
              </div>
            )}

            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700"
              rows={3}
              placeholder="Catatan tambahan tentang kondisi atau pengobatan pasien"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              readOnly={isReadOnly}
              disabled={submitting}
            />
          </div>

          {isViewMode && selectedHandledPatient && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <Info className="h-5 w-5 mr-2 text-blue-600" />
                Informasi Tambahan
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <p className="text-sm font-medium text-gray-700">Ditangani sejak:</p>
                  </div>
                  <p className="text-sm text-gray-900 font-medium">
                    {new Date(selectedHandledPatient.handledDate).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-gray-600" />
                    <p className="text-sm font-medium text-gray-700">Penanggung jawab:</p>
                  </div>
                  <p className="text-sm text-gray-900 font-medium">{selectedHandledPatient.handler.name}</p>
                  <p className="text-xs text-gray-600">{selectedHandledPatient.handler.role}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              disabled={submitting}
            >
              {isViewMode ? 'Tutup' : 'Batal'}
            </button>
            {!isViewMode && (
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                disabled={submitting || (mode === 'add' && !formData.patientId)}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{mode === 'edit' ? 'Update Pasien' : 'Tambah Pasien'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default HandledPatientForm;