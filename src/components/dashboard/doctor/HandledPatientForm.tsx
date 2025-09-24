import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Save, User, Calendar, Activity, AlertCircle, FileText, Edit, Eye, Trash2, Clock, Flag, CheckCircle2 } from 'lucide-react';

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

interface HandledPatientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  mode: 'add' | 'edit' | 'view';
  selectedHandledPatient?: HandledPatient | null;
  availablePatients: Patient[];
  loading?: boolean;
}

const HandledPatientForm: React.FC<HandledPatientFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  selectedHandledPatient,
  availablePatients,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    patientId: '',
    diagnosis: '',
    treatmentPlan: '',
    notes: '',
    status: 'ACTIVE',
    priority: 'NORMAL',
    nextVisitDate: '',
    estimatedDuration: '',
    specialInstructions: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Calculate age helper
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

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen && mode === 'add') {
      setFormData({
        patientId: '',
        diagnosis: '',
        treatmentPlan: '',
        notes: '',
        status: 'ACTIVE',
        priority: 'NORMAL',
        nextVisitDate: '',
        estimatedDuration: '',
        specialInstructions: ''
      });
    } else if (isOpen && selectedHandledPatient && (mode === 'edit' || mode === 'view')) {
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
        specialInstructions: selectedHandledPatient.specialInstructions || ''
      });
    }
  }, [isOpen, mode, selectedHandledPatient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') return;

    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">
            {mode === 'add' && 'Tambah Pasien Ditangani'}
            {mode === 'edit' && 'Edit Pasien Ditangani'}
            {mode === 'view' && 'Detail Pasien Ditangani'}
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
          {/* Patient Selection - Only for Add Mode */}
          {mode === 'add' && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
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
                {availablePatients.map((patient) => (
                  <option
                    key={patient.id}
                    value={patient.id}
                    className="text-gray-700 font-medium"
                  >
                    {patient.name} - {patient.mrNumber} (
                    {calculateAge(patient.birthDate)} tahun,{" "}
                    {patient.gender === "MALE" ? "L" : "P"})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Patient Info Display - For Edit and View modes */}
          {(mode === 'edit' || mode === 'view') && selectedHandledPatient && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedHandledPatient.patient.name}</h4>
                  <p className="text-sm text-gray-600">
                    {selectedHandledPatient.patient.mrNumber} • {calculateAge(selectedHandledPatient.patient.birthDate)} tahun
                  </p>
                </div>
              </div>
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
                readOnly={mode === 'view'}
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-700 focus:border-transparent"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                disabled={mode === 'view' || submitting}
              >
                <option value="ACTIVE">Aktif</option>
                <option value="COMPLETED">Selesai</option>
                <option value="ON_HOLD">Ditunda</option>
                <option value="TRANSFERRED">Transfer</option>
                <option value="DISCONTINUED">Dihentikan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioritas
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                disabled={mode === 'view' || submitting}
              >
                <option value="LOW">Rendah</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">Tinggi</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kunjungan Berikutnya
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700"
                value={formData.nextVisitDate}
                onChange={(e) => handleInputChange('nextVisitDate', e.target.value)}
                readOnly={mode === 'view'}
                disabled={submitting}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimasi Durasi
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700"
                placeholder="e.g., 2 minggu, 1 bulan"
                value={formData.estimatedDuration}
                onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                readOnly={mode === 'view'}
                disabled={submitting}
              />
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
              readOnly={mode === 'view'}
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instruksi Khusus
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700"
              rows={2}
              placeholder="Instruksi khusus untuk pasien"
              value={formData.specialInstructions}
              onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
              readOnly={mode === 'view'}
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700"
              rows={3}
              placeholder="Catatan tambahan"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              readOnly={mode === 'view'}
              disabled={submitting}
            />
          </div>

          {/* Additional Patient Details for View Mode */}
          {mode === 'view' && selectedHandledPatient && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900">Informasi Tambahan</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Ditangani sejak:</p>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedHandledPatient.handledDate).toLocaleDateString('id-ID')}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Penanggung jawab:</p>
                  <p className="text-sm text-gray-900">{selectedHandledPatient.handler.name}</p>
                  <p className="text-xs text-gray-600">{selectedHandledPatient.handler.role}</p>
                </div>
              </div>

              {selectedHandledPatient.patient.allergies && selectedHandledPatient.patient.allergies.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
                    Alergi
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedHandledPatient.patient.allergies.map((allergy, index) => (
                      <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={submitting}
            >
              {mode === 'view' ? 'Tutup' : 'Batal'}
            </button>
            {mode !== 'view' && (
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                disabled={submitting}
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