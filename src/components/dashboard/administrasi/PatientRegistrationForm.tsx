// src/components/dashboard/admin/PatientRegistrationForm.tsx
import React, { useState, useEffect } from 'react';
import { X, Save, User, Calendar, Phone, MapPin, Heart, Shield, AlertCircle, Clock } from 'lucide-react';

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
  status?: string;
  createdAt: Date;
  complaints?: PatientComplaint[];
}

interface PatientComplaint {
  id: string;
  complaint: string;
  severity: 'RINGAN' | 'SEDANG' | 'BERAT';
  date: Date;
  notes?: string;
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
  const [error, setError] = useState('');
  const [showAllergyInput, setShowAllergyInput] = useState(
    selectedPatient?.allergies && selectedPatient.allergies.length > 0
  );
  const [patientComplaints, setPatientComplaints] = useState<PatientComplaint[]>([]);

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
    status: selectedPatient?.status || 'ACTIVE',
    complaint: '',
    complaintSeverity: 'RINGAN' as 'RINGAN' | 'SEDANG' | 'BERAT'
  });

  // Fetch patient complaints when in edit or view mode
  useEffect(() => {
    if (selectedPatient && (formMode === 'edit' || formMode === 'view')) {
      fetchPatientComplaints();
    }
  }, [selectedPatient, formMode]);

  const fetchPatientComplaints = async () => {
    if (!selectedPatient) return;

    try {
      const response = await fetch(`/api/patient-complaints?patientId=${selectedPatient.id}`);
      if (response.ok) {
        const complaints = await response.json();
        setPatientComplaints(complaints);
      }
    } catch (error) {
      console.error('Error fetching patient complaints:', error);
    }
  };

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
      status: 'ACTIVE',
      complaint: '',
      complaintSeverity: 'RINGAN'
    });
    setAllergies([]);
    setNewAllergy('');
    setShowAllergyInput(false);
    setError('');
    setPatientComplaints([]);
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
    setError('');

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
        status: patientData.status,
        complaint: formMode === 'add' ? (patientData.complaint || undefined) : undefined,
        complaintSeverity: formMode === 'add' ? patientData.complaintSeverity : undefined,
        complaints: formMode === 'edit' ? patientComplaints : undefined
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
            ? 'Data pasien dan keluhan berhasil diperbarui!'
            : 'Pasien berhasil didaftarkan!'
        );
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Gagal menyimpan data pasien');
      }
    } catch (error) {
      console.error('Error saving patient:', error);
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan data pasien');
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

  const getStatusColor = (status: string) => {
  switch (status) {
    case 'AKTIF': return 'bg-green-100 text-green-800 border-green-300';
    case 'RAWAT_JALAN': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'RAWAT_INAP': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'RUJUK_KELUAR': return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'PULANG': return 'bg-gray-100 text-gray-800 border-gray-300';
    case 'PULANG_PAKSA': return 'bg-red-100 text-red-800 border-red-300';
    case 'MENINGGAL': return 'bg-black text-white border-black';
    default: return 'bg-green-100 text-green-800 border-green-300';
  }
};

 const getStatusLabel = (status: string) => {
  switch (status) {
    case 'AKTIF': return 'Aktif';
    case 'RAWAT_JALAN': return 'Rawat Jalan';
    case 'RAWAT_INAP': return 'Rawat Inap';
    case 'RUJUK_KELUAR': return 'Rujuk Keluar';
    case 'PULANG': return 'Pulang';
    case 'PULANG_PAKSA': return 'Pulang Paksa';
    case 'MENINGGAL': return 'Meninggal';
    default: return 'Aktif';
  }
};

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'BERAT': return 'bg-red-100 text-red-800 border-red-300';
      case 'SEDANG': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'RINGAN': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };



  const isModal = !!onClose;

  const formContent = (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Lengkap{" "}
            {formMode !== "view" && (
              <span className="text-red-500">*</span>
            )}
          </label>

          {formMode === 'view' ? (
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
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
            Jenis Kelamin {formMode !== "view" && (
              <span className="text-red-500">*</span>
            )}
          </label>
          {formMode === 'view' ? (
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
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
            Tanggal Lahir  {formMode !== "view" && (
              <span className="text-red-500">*</span>
            )}
          </label>
          {formMode === 'view' ? (
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
              {new Date(selectedPatient?.birthDate || '').toLocaleDateString('id-ID')} ({calculateAge(new Date(selectedPatient?.birthDate || '').toISOString().split('T')[0])})
            </div>
          ) : (
            <div className="space-y-1">
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                value={patientData.birthDate}
                onChange={(e) => setPatientData({ ...patientData, birthDate: e.target.value })}
              />
              {patientData.birthDate && (
                <p className="text-xs text-gray-500">
                  Umur: {calculateAge(patientData.birthDate)}
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jenis Penjamin  {formMode !== "view" && (
              <span className="text-red-500">*</span>
            )}
          </label>
          {formMode === 'view' ? (
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status Pasien {formMode !== "view" && (
              <span className="text-red-500">*</span>
            )}
          </label>
          {formMode === 'view' ? (
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedPatient?.status || 'AKTIF')}`}>
                {getStatusLabel(selectedPatient?.status || 'AKTIF')}
              </span>
            </div>
          ) : (
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              value={patientData.status}
              onChange={(e) => setPatientData({ ...patientData, status: e.target.value })}
            >
              <option value="AKTIF">Aktif</option>
              <option value="RAWAT_JALAN">Rawat Jalan</option>
              <option value="RAWAT_INAP">Rawat Inap</option>
              <option value="RUJUK_KELUAR">Rujuk Keluar</option>
              <option value="PULANG">Pulang</option>
              <option value="PULANG_PAKSA">Pulang Paksa</option>
              <option value="MENINGGAL">Meninggal</option>
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nomor Telepon
          </label>
          {formMode === 'view' ? (
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tinggi Badan (cm)
          </label>
          {formMode === 'view' ? (
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
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
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
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
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
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
            Alamat Lengkap
          </label>
          {formMode === 'view' ? (
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
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

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Riwayat Penyakit
          </label>
          {formMode === 'view' ? (
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
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

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alergi
          </label>
          {formMode === 'view' ? (
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
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
              {!showAllergyInput && allergies.length === 0 && (
                <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="text-gray-600">Tidak ada alergi yang diketahui</span>
                  <button
                    type="button"
                    onClick={() => setShowAllergyInput(true)}
                    className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                  >
                    Tambah Alergi
                  </button>
                </div>
              )}

              {(showAllergyInput || allergies.length > 0) && (
                <>
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
                    {allergies.length === 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowAllergyInput(false);
                          setNewAllergy('');
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Batal
                      </button>
                    )}
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
                </>
              )}
            </div>
          )}
        </div>

        {/* Keluhan section - separate from status */}
        {formMode === 'add' && (
          <>
            <div className="md:col-span-2">
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
          </>
        )}

        {/* Display existing complaints in view/edit mode - separate from status */}
        {(formMode === 'view' || formMode === 'edit') && patientComplaints.length > 0 && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <span>Keluhan Pasien</span>
              </div>
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              {patientComplaints.map((complaint, index) => (
                <div key={complaint.id} className="bg-white border border-gray-200 rounded-lg p-3">
                  {formMode === 'view' ? (
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">{complaint.complaint}</p>
                          {complaint.notes && (
                            <p className="text-gray-600 text-sm mt-1">Catatan: {complaint.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(complaint.severity)}`}>
                            {complaint.severity}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{new Date(complaint.date).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </>
                  ) : (
                    // Edit mode - make complaints editable
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Keluhan
                        </label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 text-sm"
                          rows={2}
                          value={complaint.complaint}
                          onChange={(e) => {
                            const updatedComplaints = [...patientComplaints];
                            updatedComplaints[index] = { ...complaint, complaint: e.target.value };
                            setPatientComplaints(updatedComplaints);
                          }}
                        />
                      </div>

                      {complaint.notes !== undefined && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Catatan
                          </label>
                          <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 text-sm"
                            rows={1}
                            value={complaint.notes || ''}
                            onChange={(e) => {
                              const updatedComplaints = [...patientComplaints];
                              updatedComplaints[index] = { ...complaint, notes: e.target.value };
                              setPatientComplaints(updatedComplaints);
                            }}
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Tingkat Keparahan
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 text-sm"
                            value={complaint.severity}
                            onChange={(e) => {
                              const updatedComplaints = [...patientComplaints];
                              updatedComplaints[index] = { ...complaint, severity: e.target.value as 'RINGAN' | 'SEDANG' | 'BERAT' };
                              setPatientComplaints(updatedComplaints);
                            }}
                          >
                            <option value="RINGAN">Ringan</option>
                            <option value="SEDANG">Sedang</option>
                            <option value="BERAT">Berat</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{new Date(complaint.date).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Yakin ingin menghapus keluhan ini?')) {
                              const updatedComplaints = patientComplaints.filter((_, i) => i !== index);
                              setPatientComplaints(updatedComplaints);
                            }
                          }}
                          className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center space-x-1"
                        >
                          <X className="h-3 w-3" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {formMode === 'edit' && (
                <button
                  type="button"
                  onClick={() => {
                    const newComplaint: PatientComplaint = {
                      id: `temp_${Date.now()}`, // Temporary ID for new complaints
                      complaint: '',
                      severity: 'RINGAN',
                      date: new Date(),
                      notes: ''
                    };
                    setPatientComplaints([...patientComplaints, newComplaint]);
                  }}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center space-x-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>Tambah Keluhan Baru</span>
                </button>
              )}
            </div>
          </div>
        )}

        {formMode === 'view' && selectedPatient && (
          <>
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
          </>
        )}
      </div>

      {formMode !== 'view' && (
        <div className="text-xs text-gray-500 mt-4">
          <span className="text-red-500">*</span> Field wajib diisi!!!
        </div>
      )}

      {formMode === 'edit' && patientData.status !== (selectedPatient?.status || 'ACTIVE') && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-sm">
              <h4 className="font-medium text-yellow-800 mb-1">Perubahan Status Pasien:</h4>
              <p className="text-yellow-700">
                Status akan berubah dari "{getStatusLabel(selectedPatient?.status || 'ACTIVE')}" ke "{getStatusLabel(patientData.status)}".
                {patientData.status === 'RUJUK_BALIK' && " Pasien akan dipindahkan ke kategori Rujuk Balik."}
                {patientData.status === 'SELESAI' && " Pasien akan dipindahkan ke kategori Selesai."}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end space-x-4">
        <button
          type="button"
          onClick={onClose || resetForm}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          disabled={loading}
        >
          {formMode === 'view' ? 'Tutup' : 'Batal'}
        </button>
        {formMode !== 'view' && (
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
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
              className="text-gray-900 hover:text-gray-600 transition-colors"
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

export default PatientRegistrationForm;