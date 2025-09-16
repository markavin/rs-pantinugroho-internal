// src/components/dashboard/admin/PatientRegistrationForm.tsx
import React, { useState } from 'react';
import { X, Save, User, Calendar, Phone, MapPin, Heart, Shield } from 'lucide-react';

interface Patient {
  id: string;
  mrNumber: string;
  name: string;
  birthDate: Date;
  gender: 'MALE' | 'FEMALE';
  phone?: string;
  address?: string;
  height?: number;
  weight?: number;
  diabetesType?: string;
  insuranceType: string;
  allergies?: string[];
  medicalHistory?: string;
  createdAt: Date; 
}

interface PatientRegistrationFormProps {
  selectedPatient?: Patient | null;
  formMode?: 'add' | 'edit' | 'view';
  onClose?: () => void;
  onPatientAdded: () => void;
}

const PatientRegistrationForm: React.FC<PatientRegistrationFormProps> = ({
  selectedPatient,
  formMode = 'add',
  onClose,
  onPatientAdded
}) => {
  const [loading, setLoading] = useState(false);
  const [allergies, setAllergies] = useState<string[]>(selectedPatient?.allergies || []);
  const [newAllergy, setNewAllergy] = useState('');
  
  const [patientData, setPatientData] = useState({
    name: selectedPatient?.name || '',
    birthDate: selectedPatient ? new Date(selectedPatient.birthDate).toISOString().split('T')[0] : '',
    gender: selectedPatient?.gender || 'MALE' as 'MALE' | 'FEMALE',
    phone: selectedPatient?.phone || '',
    address: selectedPatient?.address || '',
    height: selectedPatient?.height?.toString() || '',
    weight: selectedPatient?.weight?.toString() || '',
    diabetesType: selectedPatient?.diabetesType || '',
    insuranceType: selectedPatient?.insuranceType || '',
    medicalHistory: selectedPatient?.medicalHistory || '',
    // Fields for initial complaint during registration
    complaint: '',
    complaintSeverity: 'RINGAN' as 'RINGAN' | 'SEDANG' | 'BERAT'
  });

  const resetForm = () => {
    setPatientData({
      name: '',
      birthDate: '',
      gender: 'MALE',
      phone: '',
      address: '',
      height: '',
      weight: '',
      diabetesType: '',
      insuranceType: '',
      medicalHistory: '',
      complaint: '',
      complaintSeverity: 'RINGAN'
    });
    setAllergies([]);
    setNewAllergy('');
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formMode === 'view') return;

    setLoading(true);

    try {
      const payload = {
        name: patientData.name,
        birthDate: new Date(patientData.birthDate),
        gender: patientData.gender,
        phone: patientData.phone || undefined,
        address: patientData.address || undefined,
        height: patientData.height ? parseFloat(patientData.height) : undefined,
        weight: patientData.weight ? parseFloat(patientData.weight) : undefined,
        diabetesType: patientData.diabetesType || undefined,
        insuranceType: patientData.insuranceType,
        allergies: allergies.length > 0 ? allergies : undefined,
        medicalHistory: patientData.medicalHistory || undefined,
        // Include complaint only for new registrations
        complaint: formMode === 'add' ? (patientData.complaint || undefined) : undefined,
        complaintSeverity: formMode === 'add' ? patientData.complaintSeverity : undefined
      };

      const url = formMode === 'edit' && selectedPatient
        ? `/api/patients/${selectedPatient.id}`
        : '/api/patients';

      const method = formMode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onPatientAdded();
        if (onClose) {
          onClose();
        } else {
          resetForm();
        }
        alert(
          formMode === 'edit' 
            ? 'Data pasien berhasil diperbarui!' 
            : 'Pasien berhasil didaftarkan!'
        );
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Gagal menyimpan data pasien'}`);
      }
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Terjadi kesalahan saat menyimpan data pasien');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} tahun`;
  };

  const getModalTitle = () => {
    switch (formMode) {
      case 'add': return 'Registrasi Pasien Baru';
      case 'edit': return 'Edit Data Pasien';
      case 'view': return 'Detail Pasien';
      default: return 'Form Pasien';
    }
  };

  const isModal = !!onClose;

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information Section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <User className="h-5 w-5 text-blue-600" />
          <span>Informasi Pribadi</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Nama Lengkap {formMode !== 'view' && <span className="text-red-500">*</span>}
            </label>
            {formMode === 'view' ? (
              <div className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900">
                {selectedPatient?.name}
              </div>
            ) : (
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                placeholder="Masukkan nama lengkap"
                value={patientData.name}
                onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Lahir {formMode !== 'view' && <span className="text-red-500">*</span>}
            </label>
            {formMode === 'view' ? (
              <div className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900">
                {new Date(selectedPatient?.birthDate || '').toLocaleDateString('id-ID')} ({calculateAge(new Date(selectedPatient?.birthDate || '').toISOString().split('T')[0])})
              </div>
            ) : (
              <div className="relative">
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  value={patientData.birthDate}
                  onChange={(e) => setPatientData({ ...patientData, birthDate: e.target.value })}
                />
                {patientData.birthDate && (
                  <div className="mt-1 text-sm text-gray-700">
                    Umur: {calculateAge(patientData.birthDate)}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Kelamin {formMode !== 'view' && <span className="text-red-500">*</span>}
            </label>
            {formMode === 'view' ? (
              <div className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-700">
                {selectedPatient?.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}
              </div>
            ) : (
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                value={patientData.gender}
                onChange={(e) => setPatientData({ ...patientData, gender: e.target.value as 'MALE' | 'FEMALE' })}
              >
                <option value="MALE">Laki-laki</option>
                <option value="FEMALE">Perempuan</option>
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Penjamin {formMode !== 'view' && <span className="text-red-500">*</span>}
            </label>
            {formMode === 'view' ? (
              <div className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-700">
                {selectedPatient?.insuranceType}
              </div>
            ) : (
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                value={patientData.insuranceType}
                onChange={(e) => setPatientData({ ...patientData, insuranceType: e.target.value })}
              >
                <option value="">Pilih penjamin</option>
                <option value="BPJS">BPJS</option>
                <option value="PRIVATE">Pribadi</option>
                <option value="CORPORATE">Asuransi Swasta</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Phone className="h-5 w-5 text-green-600" />
          <span>Informasi Kontak</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Telepon
            </label>
            {formMode === 'view' ? (
              <div className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900">
                {selectedPatient?.phone || '-'}
              </div>
            ) : (
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                placeholder="08xxxxxxxxxx"
                value={patientData.phone}
                onChange={(e) => setPatientData({ ...patientData, phone: e.target.value })}
              />
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alamat Lengkap
            </label>
            {formMode === 'view' ? (
              <div className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900">
                {selectedPatient?.address || '-'}
              </div>
            ) : (
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                placeholder="Masukkan alamat lengkap"
                rows={3}
                value={patientData.address}
                onChange={(e) => setPatientData({ ...patientData, address: e.target.value })}
              />
            )}
          </div>
        </div>
      </div>

      {/* Medical Information Section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Heart className="h-5 w-5 text-red-600" />
          <span>Informasi Medis</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tinggi Badan (cm)
            </label>
            {formMode === 'view' ? (
              <div className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900">
                {selectedPatient?.height ? `${selectedPatient.height} cm` : '-'}
              </div>
            ) : (
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                placeholder="contoh: 165"
                value={patientData.height}
                onChange={(e) => setPatientData({ ...patientData, height: e.target.value })}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Berat Badan (kg)
            </label>
            {formMode === 'view' ? (
              <div className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900">
                {selectedPatient?.weight ? `${selectedPatient.weight} kg` : '-'}
              </div>
            ) : (
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                placeholder="contoh: 65"
                value={patientData.weight}
                onChange={(e) => setPatientData({ ...patientData, weight: e.target.value })}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipe Diabetes
            </label>
            {formMode === 'view' ? (
              <div className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900">
                {selectedPatient?.diabetesType || '-'}
              </div>
            ) : (
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                value={patientData.diabetesType}
                onChange={(e) => setPatientData({ ...patientData, diabetesType: e.target.value })}
              >
                <option value="">Pilih tipe diabetes</option>
                <option value="Tipe 1">Tipe 1</option>
                <option value="Tipe 2">Tipe 2</option>
                <option value="Gestational">Gestational</option>
                <option value="Prediabetes">Prediabetes</option>
              </select>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Riwayat Penyakit
            </label>
            {formMode === 'view' ? (
              <div className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900">
                {selectedPatient?.medicalHistory || '-'}
              </div>
            ) : (
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                placeholder="Masukkan riwayat penyakit (contoh: hipertensi, kolesterol tinggi, dll)"
                rows={3}
                value={patientData.medicalHistory}
                onChange={(e) => setPatientData({ ...patientData, medicalHistory: e.target.value })}
              />
            )}
          </div>
        </div>
      </div>

      {/* Allergies Section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Shield className="h-5 w-5 text-orange-600" />
          <span>Alergi</span>
        </h4>

        {formMode === 'view' ? (
          <div className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900">
            {selectedPatient?.allergies && selectedPatient.allergies.length > 0 ? (
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
        ) : (
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                placeholder="Tambah alergi (contoh: Sulfa, Penisilin, Makanan laut)"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAllergy())}
              />
              <button
                type="button"
                onClick={handleAddAllergy}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Tambah
              </button>
            </div>
            
            {allergies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {allergies.map((allergy, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                    {allergy}
                    <button
                      type="button"
                      onClick={() => handleRemoveAllergy(index)}
                      className="ml-2 text-orange-600 hover:text-orange-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Initial Complaint Section - Only for new registrations */}
      {formMode === 'add' && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            <span>Keluhan Awal (Opsional)</span>
          </h4>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keluhan Saat Ini
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                placeholder="Masukkan keluhan pasien (opsional)"
                rows={3}
                value={patientData.complaint}
                onChange={(e) => setPatientData({ ...patientData, complaint: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tingkat Keparahan
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                value={patientData.complaintSeverity}
                onChange={(e) => setPatientData({ ...patientData, complaintSeverity: e.target.value as any })}
              >
                <option value="RINGAN">Ringan</option>
                <option value="SEDANG">Sedang</option>
                <option value="BERAT">Berat</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Display additional info in view mode */}
      {formMode === 'view' && selectedPatient && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Informasi Sistem</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                No. Medical Record
              </label>
              <div className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900">
                {selectedPatient.mrNumber}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Registrasi
              </label>
              <div className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900">
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
      )}

      {formMode !== 'view' && (
        <div className="text-xs text-gray-500">
          * Field wajib diisi
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose || resetForm}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          {formMode === 'view' ? 'Tutup' : 'Batal'}
        </button>
        {formMode !== 'view' && (
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>
              {loading ? 'Menyimpan...' : (formMode === 'edit' ? 'Update Data' : 'Daftarkan Pasien')}
            </span>
          </button>
        )}
      </div>
    </form>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {getModalTitle()}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="p-6">
            {formContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{getModalTitle()}</h3>
      </div>
      <div className="p-6">
        {formContent}
      </div>
    </div>
  );
};

export default PatientRegistrationForm