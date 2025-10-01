import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Save, User, Calendar, Activity, AlertCircle, FileText, Edit, Eye, Trash2, Clock, Flag, CheckCircle2, Info, Heart, Thermometer, Users2, Stethoscope } from 'lucide-react';

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

    // Parse different duration formats
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

  useEffect(() => {
    if (formData.patientId && availablePatients.length > 0) {
      const patient = availablePatients.find(p => p.id === formData.patientId);
      setSelectedPatientData(patient || null);

      // Auto-suggest priority based on patient data
      if (patient && mode === 'add') {
        const suggestedPriority = suggestPriority(patient);
        setFormData(prev => ({ ...prev, priority: suggestedPriority }));
      }
    } else {
      setSelectedPatientData(null);
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
          formData.notes
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
      const isActiveStatus = patient.status === 'AKTIF';
      const notAlreadyHandled = !handledPatients.some(hp =>
        hp.patientId === patient.id &&
        !['SELESAI', 'RUJUK_KELUAR', 'MENINGGAL'].includes(hp.status)
      );

      return isActiveStatus && notAlreadyHandled;
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

          {/* Patient Summary Card */}
          {selectedPatientData && (
            <div className="bg-green-50 p-6 rounded-xl border border-green-50">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
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
                <option value="ANTRIAN">Antrian</option>
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
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
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
                    <span>{mode === 'edit' ? 'Simpan Perubahan' : 'Simpan'}</span>
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