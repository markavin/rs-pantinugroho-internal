import React, { useState, useEffect } from 'react';
import { X, Save, User, Calendar, Phone, MapPin, Shield, ClipboardList } from 'lucide-react';

interface Patient {
  id: string;
  mrNumber: string;
  name: string;
  birthDate: Date;
  gender: 'MALE' | 'FEMALE';
  phone?: string;
  address?: string;
  idNumber?: string;
  nationality?: string;
  bloodType?: string;
  language?: string;
  motherName?: string;
  intendedDoctor?: string;
  insuranceType: string;
  insuranceNumber?: string;
  status?: string;
  createdAt: Date;
}

interface Doctor {
  id: string;
  name: string;
  employeeId: string;
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
  const [error, setError] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [patientData, setPatientData] = useState({
    idNumber: selectedPatient?.idNumber || '',
    name: selectedPatient?.name || '',
    birthDate: selectedPatient ? new Date(selectedPatient.birthDate).toISOString().split('T')[0] : '',
    gender: selectedPatient?.gender || 'MALE' as 'MALE' | 'FEMALE',
    nationality: selectedPatient?.nationality || 'WNI',
    bloodType: selectedPatient?.bloodType || 'A',
    language: selectedPatient?.language || '',
    motherName: selectedPatient?.motherName || '',
    phone: selectedPatient?.phone || '',
    address: selectedPatient?.address || '',
    intendedDoctor: selectedPatient?.intendedDoctor || '',
    insuranceType: selectedPatient?.insuranceType || '',
    insuranceNumber: selectedPatient?.insuranceNumber || '',
    status: selectedPatient?.status || 'AKTIF'
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/staff?role=DOKTER_SPESIALIS');
      if (response.ok) {
        const data = await response.json();
        setDoctors(data.filter((user: any) => user.role === 'DOKTER_SPESIALIS'));
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
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

  const resetForm = () => {
    setPatientData({
      idNumber: '',
      name: '',
      birthDate: '',
      gender: 'MALE',
      nationality: 'WNI',
      bloodType: '',
      language: '',
      motherName: '',
      phone: '',
      address: '',
      intendedDoctor: '',
      insuranceType: '',
      insuranceNumber: '',
      status: 'AKTIF'
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formMode === 'view') return;

    setLoading(true);
    setError('');

    try {
      const payload: any = {
        name: patientData.name,
        birthDate: new Date(patientData.birthDate),
        gender: patientData.gender,
        idNumber: patientData.idNumber || undefined,
        nationality: patientData.nationality,
        bloodType: patientData.bloodType || undefined,
        language: patientData.language || undefined,
        motherName: patientData.motherName || undefined,
        phone: patientData.phone || undefined,
        address: patientData.address || undefined,
        intendedDoctor: patientData.intendedDoctor || undefined,
        insuranceType: patientData.insuranceType,
        insuranceNumber: patientData.insuranceNumber || undefined,
        status: patientData.status
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
        throw new Error(error.message || 'Gagal menyimpan data pasien');
      }
    } catch (error) {
      console.error('Error saving patient:', error);
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan data pasien');
    } finally {
      setLoading(false);
    }
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
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            No. KTP/Paspor  {formMode !== 'view' && <span className="text-red-500">*</span>}
          </label>
          {formMode === 'view' ? (
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
              {selectedPatient?.idNumber || '-'}
            </div>
          ) : (
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              placeholder="Masukkan nomor KTP/Paspor"
              value={patientData.idNumber}
              onChange={(e) => setPatientData({ ...patientData, idNumber: e.target.value })}
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kewarganegaraan {formMode !== 'view' && <span className="text-red-500">*</span>}
          </label>
          {formMode === 'view' ? (
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
              {selectedPatient?.nationality}
            </div>
          ) : (
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              value={patientData.nationality}
              onChange={(e) => setPatientData({ ...patientData, nationality: e.target.value })}
            >
              <option value="WNI">WNI</option>
              <option value="WNA">WNA</option>
            </select>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Lengkap {formMode !== 'view' && <span className="text-red-500">*</span>}
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
            Jenis Kelamin {formMode !== 'view' && <span className="text-red-500">*</span>}
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
            Tanggal Lahir {formMode !== 'view' && <span className="text-red-500">*</span>}
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
            Golongan Darah
          </label>
          {formMode === 'view' ? (
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
              {selectedPatient?.bloodType || '-'}
            </div>
          ) : (
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              value={patientData.bloodType}
              onChange={(e) => setPatientData({ ...patientData, bloodType: e.target.value })}
            >

              <option value="A">A</option>
              <option value="B">B</option>
              <option value="AB">AB</option>
              <option value="O">O</option>

              <option value="A+">A+</option>
              <option value="A-">A-</option>

              <option value="B+">B+</option>
              <option value="B-">B-</option>

              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>

              <option value="O+">O+</option>
              <option value="O-">O-</option>

            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bahasa
          </label>
          {formMode === 'view' ? (
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
              {selectedPatient?.language || '-'}
            </div>
          ) : (
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              placeholder="Contoh: Indonesia, English"
              value={patientData.language}
              onChange={(e) => setPatientData({ ...patientData, language: e.target.value })}
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Ibu Kandung
          </label>
          {formMode === 'view' ? (
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
              {selectedPatient?.motherName || '-'}
            </div>
          ) : (
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              placeholder="Masukkan nama ibu kandung"
              value={patientData.motherName}
              onChange={(e) => setPatientData({ ...patientData, motherName: e.target.value })}
            />
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rencana Periksa ke Dokter
          </label>
          {formMode === 'view' ? (
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
              {selectedPatient?.intendedDoctor || '-'}
            </div>
          ) : (
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              value={patientData.intendedDoctor}
              onChange={(e) => setPatientData({ ...patientData, intendedDoctor: e.target.value })}
            >
              <option value="">Pilih dokter</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.name}>
                  {doctor.name} ({doctor.employeeId})
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jenis Penjamin {formMode !== 'view' && <span className="text-red-500">*</span>}
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
            Nomor Penjamin
          </label>
          {formMode === 'view' ? (
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
              {selectedPatient?.insuranceNumber || '-'}
            </div>
          ) : (
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              placeholder="Masukkan nomor penjamin"
              value={patientData.insuranceNumber}
              onChange={(e) => setPatientData({ ...patientData, insuranceNumber: e.target.value })}
            />
          )}
        </div>

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
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
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
          <span className="text-red-500">*</span> Field wajib diisi
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
              {loading ? 'Menyimpan...' : (formMode === 'edit' ? 'Update Pasien' : 'Daftarkan Pasien')}
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
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-green-50">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <ClipboardList className="h-6 w-6 mr-2 text-green-600" />
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