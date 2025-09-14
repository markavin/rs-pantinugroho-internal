// src/components/dashboard/nursePoli/PatientRegistration.tsx
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, User, Calendar, Phone, MapPin, X } from 'lucide-react';

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
  lastVisit?: Date;
  status?: string;
  createdAt: Date;
}

interface PatientComplaint {
  id: string;
  patientId: string;
  complaint: string;
  severity: 'RINGAN' | 'SEDANG' | 'BERAT';
  status: 'BARU' | 'DALAM_PROSES' | 'SELESAI';
  date: Date;
}

interface PatientRegistrationProps {
  patients: Patient[];
  onPatientsUpdate: () => void;
  searchTerm: string;
}

const PatientRegistration: React.FC<PatientRegistrationProps> = ({
  patients,
  onPatientsUpdate,
  searchTerm
}) => {
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showComplaints, setShowComplaints] = useState<string | null>(null);
  const [complaints, setComplaints] = useState<PatientComplaint[]>([]);
  const [loading, setLoading] = useState(false);

  const [newPatient, setNewPatient] = useState({
    name: '',
    birthDate: '',
    gender: 'MALE' as 'MALE' | 'FEMALE',
    phone: '',
    address: '',
    height: '',
    weight: '',
    diabetesType: '',
    insuranceType: '',
    complaint: '',
    complaintSeverity: 'RINGAN' as 'RINGAN' | 'SEDANG' | 'BERAT'
  });

  const [newComplaint, setNewComplaint] = useState({
    complaint: '',
    severity: 'RINGAN' as 'RINGAN' | 'SEDANG' | 'BERAT'
  });

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setNewPatient({
      name: '',
      birthDate: '',
      gender: 'MALE',
      phone: '',
      address: '',
      height: '',
      weight: '',
      diabetesType: '',
      insuranceType: '',
      complaint: '',
      complaintSeverity: 'RINGAN'
    });
  };

  const handleAddPatient = () => {
    resetForm();
    setEditingPatient(null);
    setFormMode('add');
    setShowPatientForm(true);
  };

  const handleViewPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setFormMode('view');
    setShowPatientForm(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setNewPatient({
      name: patient.name,
      birthDate: new Date(patient.birthDate).toISOString().split('T')[0],
      gender: patient.gender,
      phone: patient.phone || '',
      address: patient.address || '',
      height: patient.height?.toString() || '',
      weight: patient.weight?.toString() || '',
      diabetesType: patient.diabetesType || '',
      insuranceType: patient.insuranceType,
      complaint: '',
      complaintSeverity: 'RINGAN'
    });
    setEditingPatient(patient);
    setFormMode('edit');
    setShowPatientForm(true);
  };

  const handleClosePatientForm = () => {
    setShowPatientForm(false);
    setEditingPatient(null);
    setFormMode('add');
    resetForm();
  };

  const handleSubmitPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formMode === 'view') return;

    setLoading(true);

    try {
      const patientData = {
        name: newPatient.name,
        birthDate: new Date(newPatient.birthDate),
        gender: newPatient.gender,
        phone: newPatient.phone || undefined,
        address: newPatient.address || undefined,
        height: newPatient.height ? parseFloat(newPatient.height) : undefined,
        weight: newPatient.weight ? parseFloat(newPatient.weight) : undefined,
        diabetesType: newPatient.diabetesType || undefined,
        insuranceType: newPatient.insuranceType,
        complaint: formMode === 'add' ? (newPatient.complaint || undefined) : undefined,
        complaintSeverity: formMode === 'add' ? newPatient.complaintSeverity : undefined
      };

      const url = formMode === 'edit' && editingPatient
        ? `/api/patients/${editingPatient.id}`
        : '/api/patients';

      const method = formMode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (response.ok) {
        handleClosePatientForm();
        onPatientsUpdate();
        alert(formMode === 'edit' ? 'Data pasien berhasil diperbarui!' : 'Pasien berhasil didaftarkan!');
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

  const handleDeletePatient = async (patientId: string, patientName: string) => {
    if (!confirm(`Yakin ingin menghapus data pasien ${patientName}? Data akan dihapus permanen dari database.`)) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onPatientsUpdate();
        alert('Data pasien berhasil dihapus!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Gagal menghapus data pasien'}`);
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Terjadi kesalahan saat menghapus data pasien');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showComplaints) return;

    setLoading(true);
    try {
      const response = await fetch('/api/patient-complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: showComplaints,
          complaint: newComplaint.complaint,
          severity: newComplaint.severity
        }),
      });

      if (response.ok) {
        setNewComplaint({ complaint: '', severity: 'RINGAN' });
        fetchComplaints(showComplaints);
        alert('Keluhan berhasil ditambahkan!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Gagal menambahkan keluhan'}`);
      }
    } catch (error) {
      console.error('Error adding complaint:', error);
      alert('Terjadi kesalahan saat menambahkan keluhan');
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaints = async (patientId: string) => {
    try {
      const response = await fetch(`/api/patient-complaints?patientId=${patientId}`);
      if (response.ok) {
        const complaintsData = await response.json();
        setComplaints(complaintsData);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  const formatDate = (date: Date | string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID');
  };

  const calculateAge = (birthDate: Date | string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'BERAT': return 'text-red-700 bg-red-50 border-red-200';
      case 'SEDANG': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'RINGAN': return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BARU': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'DALAM_PROSES': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'SELESAI': return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getModalTitle = () => {
    switch (formMode) {
      case 'add':
        return 'Registrasi Pasien Baru';
      case 'edit':
        return 'Edit Data Pasien';
      case 'view':
        return 'Detail Pasien';
      default:
        return 'Form Pasien';
    }
  };

  return (
    <div className="space-y-6">
      {/* Patients List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Daftar Pasien</h3>
          <button
            onClick={handleAddPatient}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 w-full sm:w-auto justify-center"
          >
            <Plus className="h-4 w-4" />
            <span>Pasien Baru</span>
          </button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No. RM
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Umur/Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Penjamin
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
                    {formatDate(patient.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleViewPatient(patient)}
                      className="text-gray-600 hover:text-gray-900 font-medium inline-flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Detail</span>
                    </button>
                    <button
                      onClick={() => handleEditPatient(patient)}
                      className="text-blue-600 hover:text-blue-900 font-medium inline-flex items-center space-x-1"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowComplaints(patient.id);
                        fetchComplaints(patient.id);
                      }}
                      className="text-green-600 hover:text-green-900 font-medium inline-flex items-center space-x-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Keluhan</span>
                    </button>
                    <button
                      onClick={() => handleDeletePatient(patient.id, patient.name)}
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
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4 p-4">
          {filteredPatients.map((patient) => (
            <div key={patient.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-lg">{patient.name}</h4>
                  <p className="text-sm text-gray-600">RM: {patient.mrNumber}</p>
                </div>
                <span className="inline-flex px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  {patient.insuranceType}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    {calculateAge(patient.birthDate)} tahun / {patient.gender === 'MALE' ? 'L' : 'P'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    {formatDate(patient.createdAt)}
                  </span>
                </div>
                {patient.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{patient.phone}</span>
                  </div>
                )}
                {patient.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 truncate">{patient.address}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewPatient(patient)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                >
                  <Eye className="h-4 w-4" />
                  <span>Detail</span>
                </button>
                <button
                  onClick={() => handleEditPatient(patient)}
                  className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors flex items-center justify-center space-x-1"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    setShowComplaints(patient.id);
                    fetchComplaints(patient.id);
                  }}
                  className="flex-1 bg-green-100 text-green-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-green-200 transition-colors flex items-center justify-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Keluhan</span>
                </button>
                <button
                  onClick={() => handleDeletePatient(patient.id, patient.name)}
                  className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-red-200 transition-colors flex items-center justify-center space-x-1"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}

          {filteredPatients.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{searchTerm ? 'Tidak ada pasien yang ditemukan' : 'Belum ada data pasien'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Patient Form Modal */}
      {showPatientForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {getModalTitle()}
              </h2>
              <button
                onClick={handleClosePatientForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitPatient} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap {formMode !== 'view' && <span className="text-red-500">*</span>}
                  </label>
                  {formMode === 'view' ? (
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {editingPatient?.name}
                    </div>
                  ) : (
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                      placeholder="Masukkan nama lengkap"
                      value={newPatient.name}
                      onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Lahir {formMode !== 'view' && <span className="text-red-500">*</span>}
                  </label>
                  {formMode === 'view' ? (
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {formatDate(editingPatient?.birthDate || '')} ({calculateAge(editingPatient?.birthDate || '')} tahun)
                    </div>
                  ) : (
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                      value={newPatient.birthDate}
                      onChange={(e) => setNewPatient({ ...newPatient, birthDate: e.target.value })}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Kelamin {formMode !== 'view' && <span className="text-red-500">*</span>}
                  </label>
                  {formMode === 'view' ? (
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {editingPatient?.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}
                    </div>
                  ) : (
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                      value={newPatient.gender}
                      onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value as 'MALE' | 'FEMALE' })}
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
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {editingPatient?.insuranceType}
                    </div>
                  ) : (
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                      value={newPatient.insuranceType}
                      onChange={(e) => setNewPatient({ ...newPatient, insuranceType: e.target.value })}
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
                    Nomor Telepon
                  </label>
                  {formMode === 'view' ? (
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {editingPatient?.phone || '-'}
                    </div>
                  ) : (
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                      placeholder="08xxxxxxxxxx"
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe Diabetes
                  </label>
                  {formMode === 'view' ? (
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {editingPatient?.diabetesType || '-'}
                    </div>
                  ) : (
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                      value={newPatient.diabetesType}
                      onChange={(e) => setNewPatient({ ...newPatient, diabetesType: e.target.value })}
                    >
                      <option value="">Pilih tipe diabetes</option>
                      <option value="Tipe 1">Tipe 1</option>
                      <option value="Tipe 2">Tipe 2</option>
                      <option value="Gestational">Gestational</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tinggi Badan (cm)
                  </label>
                  {formMode === 'view' ? (
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {editingPatient?.height ? `${editingPatient.height} cm` : '-'}
                    </div>
                  ) : (
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                      placeholder="contoh: 165"
                      value={newPatient.height}
                      onChange={(e) => setNewPatient({ ...newPatient, height: e.target.value })}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Berat Badan (kg)
                  </label>
                  {formMode === 'view' ? (
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {editingPatient?.weight ? `${editingPatient.weight} kg` : '-'}
                    </div>
                  ) : (
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                      placeholder="contoh: 65"
                      value={newPatient.weight}
                      onChange={(e) => setNewPatient({ ...newPatient, weight: e.target.value })}
                    />
                  )}
                </div>

                {/* Address field - full width */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat
                  </label>
                  {formMode === 'view' ? (
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {editingPatient?.address || '-'}
                    </div>
                  ) : (
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                      placeholder="Masukkan alamat lengkap"
                      rows={2}
                      value={newPatient.address}
                      onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                    />
                  )}
                </div>

                {/* Keluhan - only show for add mode */}
                {formMode === 'add' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keluhan Saat Ini
                    </label>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-2">
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                          placeholder="Masukkan keluhan pasien (opsional)"
                          rows={3}
                          value={newPatient.complaint}
                          onChange={(e) => setNewPatient({ ...newPatient, complaint: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tingkat Keparahan
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                          value={newPatient.complaintSeverity}
                          onChange={(e) => setNewPatient({ ...newPatient, complaintSeverity: e.target.value as 'RINGAN' | 'SEDANG' | 'BERAT' })}
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
                {formMode === 'view' && editingPatient && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        No. Medical Record
                      </label>
                      <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {editingPatient.mrNumber}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          editingPatient.status === 'ACTIVE' || !editingPatient.status
                            ? 'bg-green-100 text-green-800'
                            : editingPatient.status === 'RUJUK_BALIK'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {editingPatient.status === 'ACTIVE' || !editingPatient.status 
                            ? 'Aktif' 
                            : editingPatient.status === 'RUJUK_BALIK' 
                            ? 'Rujuk Balik' 
                            : editingPatient.status
                          }
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tanggal Registrasi
                      </label>
                      <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {new Date(editingPatient.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    {editingPatient.lastVisit && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kunjungan Terakhir
                        </label>
                        <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                          {new Date(editingPatient.lastVisit).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {formMode !== 'view' && (
                <div className="text-xs text-gray-500 mt-4">
                  * Field wajib diisi
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleClosePatientForm}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  disabled={loading}
                >
                  {formMode === 'view' ? 'Tutup' : 'Batal'}
                </button>
                {formMode !== 'view' && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Menyimpan...' : (formMode === 'edit' ? 'Update Pasien' : 'Simpan Pasien')}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Complaint Modal */}
      {showComplaints && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Keluhan Pasien</h3>
              <button
                onClick={() => {
                  setShowComplaints(null);
                  setComplaints([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-6">
              {/* Add Complaint Form */}
              <form onSubmit={handleAddComplaint}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keluhan Baru
                    </label>
                    <textarea
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                      placeholder="Masukkan keluhan pasien"
                      rows={3}
                      value={newComplaint.complaint}
                      onChange={(e) => setNewComplaint({ ...newComplaint, complaint: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tingkat Keparahan
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                      value={newComplaint.severity}
                      onChange={(e) => setNewComplaint({ ...newComplaint, severity: e.target.value as 'RINGAN' | 'SEDANG' | 'BERAT' })}
                    >
                      <option value="RINGAN">Ringan</option>
                      <option value="SEDANG">Sedang</option>
                      <option value="BERAT">Berat</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Menyimpan...' : 'Tambah Keluhan'}
                  </button>
                </div>
              </form>

              {/* Existing Complaints */}
              {complaints.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Riwayat Keluhan</h4>
                  <div className="space-y-3">
                    {complaints.map((complaint) => (
                      <div key={complaint.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(complaint.severity)}`}>
                            {complaint.severity}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                              {complaint.status.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-gray-500">{formatDate(complaint.date)}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{complaint.complaint}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRegistration;