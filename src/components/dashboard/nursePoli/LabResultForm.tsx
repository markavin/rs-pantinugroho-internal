// src/components/dashboard/nursePoli/LabResultForm.tsx
import React, { useState } from 'react';
import { FlaskConical, Search, X, Save } from 'lucide-react';

interface Patient {
  id: string;
  mrNumber: string;
  name: string;
  birthDate: Date;
  gender: 'MALE' | 'FEMALE';
  insuranceType: string;
  createdAt: Date;
}

interface LabResultFormProps {
  patients: Patient[];
  onLabResultAdded: () => void;
}

const LabResultForm: React.FC<LabResultFormProps> = ({ patients, onLabResultAdded }) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [labData, setLabData] = useState({
    testType: '',
    value: '',
    normalRange: '',
    status: 'NORMAL' as 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL',
    notes: ''
  });

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const labTestTypes = [
    { value: 'HbA1c', label: 'HbA1c', normalRange: '<7%' },
    { value: 'Gula Darah Puasa', label: 'Gula Darah Puasa', normalRange: '70-100 mg/dL' },
    { value: 'Gula Darah 2 Jam PP', label: 'Gula Darah 2 Jam PP', normalRange: '<140 mg/dL' },
    { value: 'Gula Darah Sewaktu', label: 'Gula Darah Sewaktu', normalRange: '<200 mg/dL' },
    { value: 'Kreatinin', label: 'Kreatinin', normalRange: '0.6-1.3 mg/dL' },
    { value: 'Ureum', label: 'Ureum', normalRange: '15-50 mg/dL' },
    { value: 'Kolesterol Total', label: 'Kolesterol Total', normalRange: '<200 mg/dL' },
    { value: 'HDL', label: 'HDL', normalRange: '>40 mg/dL (L), >50 mg/dL (P)' },
    { value: 'LDL', label: 'LDL', normalRange: '<100 mg/dL' },
    { value: 'Trigliserida', label: 'Trigliserida', normalRange: '<150 mg/dL' },
    { value: 'Albumin Urin', label: 'Albumin Urin', normalRange: '<30 mg/g' }
  ];

  const resetForm = () => {
    setSelectedPatient(null);
    setLabData({
      testType: '',
      value: '',
      normalRange: '',
      status: 'NORMAL',
      notes: ''
    });
    setSearchTerm('');
    setShowPatientSearch(false);
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientSearch(false);
    setSearchTerm('');
  };

  const handleTestTypeChange = (testType: string) => {
    const selectedTest = labTestTypes.find(test => test.value === testType);
    setLabData(prev => ({
      ...prev,
      testType,
      normalRange: selectedTest?.normalRange || ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setLoading(true);

    try {
      const response = await fetch('/api/lab-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          testType: labData.testType,
          value: labData.value,
          normalRange: labData.normalRange,
          status: labData.status,
          notes: labData.notes || undefined,
          testDate: new Date()
        }),
      });

      if (response.ok) {
        resetForm();
        onLabResultAdded();
        alert('Hasil laboratorium berhasil disimpan!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Gagal menyimpan hasil laboratorium'}`);
      }
    } catch (error) {
      console.error('Error saving lab result:', error);
      alert('Terjadi kesalahan saat menyimpan hasil laboratorium');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center space-x-3">
        <FlaskConical className="h-6 w-6 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Input Hasil Laboratorium</h3>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Patient Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Pasien <span className="text-red-500">*</span>
          </label>
          
          {selectedPatient ? (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{selectedPatient.name}</p>
                <p className="text-sm text-gray-600">RM: {selectedPatient.mrNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPatientSearch(!showPatientSearch)}
                className="w-full p-3 border border-gray-300 rounded-lg text-left text-gray-500 hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <span>Pilih Pasien...</span>
                <Search className="h-5 w-5" />
              </button>

              {showPatientSearch && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Cari nama atau RM pasien..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredPatients.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() => handlePatientSelect(patient)}
                        className="w-full p-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <p className="font-medium text-gray-900">{patient.name}</p>
                        <p className="text-sm text-gray-600">RM: {patient.mrNumber} | {patient.insuranceType}</p>
                      </button>
                    ))}
                    {filteredPatients.length === 0 && (
                      <p className="p-4 text-gray-500 text-center">Tidak ada pasien ditemukan</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Pemeriksaan <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={labData.testType}
              onChange={(e) => handleTestTypeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Pilih jenis pemeriksaan</option>
              {labTestTypes.map((test) => (
                <option key={test.value} value={test.value}>
                  {test.label}
                </option>
              ))}
            </select>
          </div>

          {/* Test Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hasil Pemeriksaan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={labData.value}
              onChange={(e) => setLabData(prev => ({ ...prev, value: e.target.value }))}
              placeholder="Masukkan hasil pemeriksaan"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Normal Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nilai Normal
            </label>
            <input
              type="text"
              value={labData.normalRange}
              onChange={(e) => setLabData(prev => ({ ...prev, normalRange: e.target.value }))}
              placeholder="Rentang nilai normal"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
              readOnly
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Hasil <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={labData.status}
              onChange={(e) => setLabData(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="NORMAL">Normal</option>
              <option value="HIGH">Tinggi</option>
              <option value="LOW">Rendah</option>
              <option value="CRITICAL">Kritis</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catatan Tambahan
          </label>
          <textarea
            value={labData.notes}
            onChange={(e) => setLabData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Catatan atau keterangan tambahan..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading || !selectedPatient}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Menyimpan...' : 'Simpan Hasil Lab'}</span>
          </button>
        </div>

        <div className="text-xs text-gray-500">
          * Field wajib diisi
        </div>
      </form>
    </div>
  );
};

export default LabResultForm;