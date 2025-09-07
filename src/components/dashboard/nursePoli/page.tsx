// src/components/dashboard/nursePoli/page.tsx
import React, { useState, useEffect } from 'react';
import { Search, Plus, User, Calendar, Activity, TrendingUp, AlertCircle, FileText, Users, HeartPulse, Edit, Trash2, Eye } from 'lucide-react';
import {
  mockPatients, mockAlerts,
  dashboardStats,
  Patient,
  Alert
} from '@/data/mockData';

interface PatientComplaint {
  id: string;
  patientId: string;
  complaint: string;
  severity: 'Ringan' | 'Sedang' | 'Berat';
  date: string;
  status: 'Baru' | 'Dalam Proses' | 'Selesai';
}

interface BloodSugarHistory {
  id: string;
  patientId: string;
  value: number;
  date: string;
  time: string;
  notes: string;
}

const NursePoliDashboard = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'patients' | 'complaints' | 'blood-sugar' | 'education'>('patients');
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showEditPatient, setShowEditPatient] = useState<string | null>(null);
  const [showAddComplaint, setShowAddComplaint] = useState<string | null>(null);
  
  const [complaints] = useState<PatientComplaint[]>([
    { id: '1', patientId: '1', complaint: 'Sering merasa haus dan lapar', severity: 'Sedang', date: '2024-08-29', status: 'Baru' },
    { id: '2', patientId: '2', complaint: 'Kesemutan di kaki', severity: 'Ringan', date: '2024-08-28', status: 'Dalam Proses' },
    { id: '3', patientId: '3', complaint: 'Penglihatan kabur', severity: 'Berat', date: '2024-08-27', status: 'Selesai' }
  ]);

  const [bloodSugarHistory] = useState<BloodSugarHistory[]>([
    { id: '1', patientId: '1', value: 180, date: '2024-08-29', time: '08:00', notes: 'Setelah sarapan' },
    { id: '2', patientId: '1', value: 145, date: '2024-08-28', time: '07:30', notes: 'Puasa' },
    { id: '3', patientId: '2', value: 145, date: '2024-08-29', time: '08:15', notes: 'Setelah minum obat' },
    { id: '4', patientId: '3', value: 220, date: '2024-08-29', time: '09:00', notes: 'Tidak minum obat' }
  ]);

  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: '',
    insuranceType: '',
    bloodSugar: '',
    address: '',
    phone: '',
    emergencyContact: ''
  });

  const [newComplaint, setNewComplaint] = useState({
    complaint: '',
    severity: 'Ringan' as 'Ringan' | 'Sedang' | 'Berat'
  });

  useEffect(() => {
    setPatients(mockPatients);
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    const nextMRNumber = `RM${(1013 + patients.length).toString().padStart(4, '0')}`;

    const patient: Patient = {
      id: (patients.length + 1).toString(),
      mrNumber: nextMRNumber,
      name: newPatient.name,
      age: parseInt(newPatient.age),
      gender: newPatient.gender as 'L' | 'P',
      diabetesType: 'Tipe 2',
      lastVisit: new Date().toISOString().split('T')[0],
      bloodSugar: {
        value: parseInt(newPatient.bloodSugar),
        date: new Date().toLocaleDateString('id-ID'),
        trend: 'stable'
      },
      riskLevel: parseInt(newPatient.bloodSugar) > 200 ? 'HIGH' : parseInt(newPatient.bloodSugar) > 140 ? 'MEDIUM' : 'LOW',
      medications: [],
      dietCompliance: 0,
      vitalSigns: { bloodPressure: '120/80', heartRate: 70, temperature: 36.5, weight: 65 },
      insuranceType: newPatient.insuranceType,
      status: 'Aktif'
    };

    setPatients([...patients, patient]);
    setNewPatient({ name: '', age: '', gender: '', insuranceType: '', bloodSugar: '', address: '', phone: '', emergencyContact: '' });
    setShowAddPatient(false);
  };

  const handleEditPatient = (patient: Patient) => {
    setNewPatient({
      name: patient.name,
      age: patient.age.toString(),
      gender: patient.gender,
      insuranceType: patient.insuranceType,
      bloodSugar: patient.bloodSugar.value.toString(),
      address: '',
      phone: '',
      emergencyContact: ''
    });
    setShowEditPatient(patient.id);
  };

  const handleUpdatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditPatient) return;

    setPatients(prev => prev.map(patient => {
      if (patient.id === showEditPatient) {
        return {
          ...patient,
          name: newPatient.name,
          age: parseInt(newPatient.age),
          gender: newPatient.gender as 'L' | 'P',
          insuranceType: newPatient.insuranceType,
          bloodSugar: {
            ...patient.bloodSugar,
            value: parseInt(newPatient.bloodSugar)
          }
        };
      }
      return patient;
    }));

    setNewPatient({ name: '', age: '', gender: '', insuranceType: '', bloodSugar: '', address: '', phone: '', emergencyContact: '' });
    setShowEditPatient(null);
  };

  const handleDeletePatient = (patientId: string) => {
    if (confirm('Yakin ingin menghapus data pasien ini?')) {
      setPatients(prev => prev.filter(patient => patient.id !== patientId));
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Berat': return 'text-red-700 bg-red-50 border-red-200';
      case 'Sedang': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'Ringan': return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Baru': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Dalam Proses': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'Selesai': return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getBloodSugarTrend = (patientId: string) => {
    const patientHistory = bloodSugarHistory
      .filter(h => h.patientId === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7);

    if (patientHistory.length < 2) return 'stable';
    
    const latest = patientHistory[0].value;
    const previous = patientHistory[1].value;
    
    if (latest > previous + 20) return 'increasing';
    if (latest < previous - 20) return 'decreasing';
    return 'stable';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari pasien..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'patients', label: 'Registrasi Pasien', icon: Users },
              { key: 'complaints', label: 'Keluhan Pasien', icon: FileText },
              { key: 'blood-sugar', label: 'Tren Gula Darah', icon: TrendingUp },
              { key: 'education', label: 'Edukasi', icon: HeartPulse }
            ].map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
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

      {/* Patients Tab */}
      {activeTab === 'patients' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pasien</p>
                  <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Registrasi Hari Ini</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Keluhan Aktif</p>
                  <p className="text-2xl font-bold text-gray-900">{complaints.filter(c => c.status !== 'Selesai').length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Add/Edit Patient Form */}
          {(showAddPatient || showEditPatient) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {showEditPatient ? 'Edit Data Pasien' : 'Registrasi Pasien Baru'}
              </h3>

              <form onSubmit={showEditPatient ? handleUpdatePatient : handleAddPatient}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Masukkan nama lengkap"
                      value={newPatient.name}
                      onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Umur
                    </label>
                    <input
                      type="number"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Umur"
                      value={newPatient.age}
                      onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Kelamin
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newPatient.gender}
                      onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    >
                      <option value="">Pilih jenis kelamin</option>
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Penjamin
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newPatient.insuranceType}
                      onChange={(e) => setNewPatient({ ...newPatient, insuranceType: e.target.value })}
                    >
                      <option value="">Pilih penjamin</option>
                      <option value="BPJS">BPJS</option>
                      <option value="Pribadi">Pribadi</option>
                      <option value="Asuransi Swasta">Asuransi Swasta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GDS Awal
                    </label>
                    <input
                      type="number"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="mg/dL"
                      value={newPatient.bloodSugar}
                      onChange={(e) => setNewPatient({ ...newPatient, bloodSugar: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="08xxxxxxxxxx"
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mt-6 space-x-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {showEditPatient ? 'Update' : 'Simpan'} Pasien
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddPatient(false);
                      setShowEditPatient(null);
                      setNewPatient({ name: '', age: '', gender: '', insuranceType: '', bloodSugar: '', address: '', phone: '', emergencyContact: '' });
                    }}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Patients Table */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Daftar Pasien</h3>
              <button
                onClick={() => setShowAddPatient(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Pasien Baru</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No.RM
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
                      GDS Terakhir
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
                        {patient.age} / {patient.gender}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.insuranceType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          patient.bloodSugar.value > 140 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {patient.bloodSugar.value} mg/dL
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button 
                          onClick={() => setSelectedPatient(patient)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          <Eye className="h-4 w-4 inline" />
                        </button>
                        <button 
                          onClick={() => handleEditPatient(patient)}
                          className="text-green-600 hover:text-green-900 font-medium"
                        >
                          <Edit className="h-4 w-4 inline" />
                        </button>
                        <button 
                          onClick={() => handleDeletePatient(patient.id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          <Trash2 className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Complaints Tab */}
      {activeTab === 'complaints' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Keluhan Pasien</h3>
            </div>

            <div className="divide-y divide-gray-200">
              {complaints.map((complaint) => {
                const patient = patients.find(p => p.id === complaint.patientId);
                return (
                  <div key={complaint.id} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-4">
                        <h4 className="font-semibold text-gray-900">{patient?.name}</h4>
                        <span className="text-sm text-gray-500">{patient?.mrNumber}</span>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(complaint.severity)}`}>
                          {complaint.severity}
                        </span>
                      </div>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{complaint.complaint}</p>
                    <p className="text-xs text-gray-500">{complaint.date}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Blood Sugar Tab */}
      {activeTab === 'blood-sugar' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Riwayat Gula Darah Pasien</h3>
            </div>

            <div className="divide-y divide-gray-200">
              {patients.slice(0, 4).map((patient) => {
                const patientHistory = bloodSugarHistory
                  .filter(h => h.patientId === patient.id)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                const trend = getBloodSugarTrend(patient.id);

                return (
                  <div key={patient.id} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                        <p className="text-sm text-gray-600">{patient.mrNumber}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{patient.bloodSugar.value} mg/dL</p>
                          <p className="text-sm text-gray-500">Terakhir: {patient.bloodSugar.date}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          trend === 'increasing' ? 'bg-red-100 text-red-700' :
                          trend === 'decreasing' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {trend === 'increasing' ? 'Naik' : trend === 'decreasing' ? 'Turun' : 'Stabil'}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-3">Riwayat 7 Hari Terakhir</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {patientHistory.slice(0, 3).map((record) => (
                          <div key={record.id} className="bg-white p-3 rounded border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-lg font-bold text-gray-900">{record.value} mg/dL</span>
                              <span className="text-xs text-gray-500">{record.time}</span>
                            </div>
                            <p className="text-sm text-gray-600">{record.date}</p>
                            <p className="text-xs text-gray-500">{record.notes}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Education Tab */}
      {activeTab === 'education' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <HeartPulse className="h-8 w-8 text-red-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Kontrol Gula Darah</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <p>• Periksa gula darah secara teratur sesuai anjuran dokter</p>
                <p>• Target gula darah puasa: 80-130 mg/dL</p>
                <p>• Target gula darah 2 jam setelah makan: kurang dari 180 mg/dL</p>
                <p>• Catat hasil pemeriksaan dalam buku harian</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <Activity className="h-8 w-8 text-green-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Pola Makan Sehat</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <p>• Makan dalam porsi kecil tapi sering (3 kali makan utama + 2-3 snack)</p>
                <p>• Pilih karbohidrat kompleks seperti nasi merah, roti gandum</p>
                <p>• Perbanyak sayuran hijau dan protein tanpa lemak</p>
                <p>• Batasi makanan manis dan berlemak tinggi</p>
              </div>
            </div>

           <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-8 w-8 text-blue-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Aktivitas Fisik</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <p>• Lakukan olahraga ringan 30 menit setiap hari</p>
                <p>• Pilih aktivitas yang disukai: jalan kaki, bersepeda, berenang</p>
                <p>• Mulai secara bertahap dan tingkatkan intensitas perlahan</p>
                <p>• Konsultasikan dengan dokter sebelum memulai program olahraga</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-8 w-8 text-orange-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Tanda Bahaya</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <p>• Gula darah di atas 250 mg/dL atau di bawah 70 mg/dL</p>
                <p>• Mual, muntah, atau sakit perut yang tidak biasa</p>
                <p>• Sesak napas atau nyeri dada</p>
                <p>• Luka yang tidak kunjung sembuh</p>
                <p className="font-medium text-red-600">Segera hubungi dokter jika mengalami gejala di atas</p>
              </div>
            </div>// Continuing from the Education Tab...

           <div className="bg-white rounded-lg shadow-sm p-6">
             <div className="flex items-center mb-4">
               <TrendingUp className="h-8 w-8 text-blue-500 mr-3" />
               <h3 className="text-lg font-semibold text-gray-900">Aktivitas Fisik</h3>
             </div>
             <div className="space-y-3 text-sm text-gray-700">
               <p>• Lakukan olahraga ringan 30 menit setiap hari</p>
               <p>• Pilih aktivitas yang disukai: jalan kaki, bersepeda, berenang</p>
               <p>• Mulai secara bertahap dan tingkatkan intensitas perlahan</p>
               <p>• Konsultasikan dengan dokter sebelum memulai program olahraga</p>
             </div>
           </div>

           <div className="bg-white rounded-lg shadow-sm p-6">
             <div className="flex items-center mb-4">
               <AlertCircle className="h-8 w-8 text-orange-500 mr-3" />
               <h3 className="text-lg font-semibold text-gray-900">Tanda Bahaya</h3>
             </div>
             <div className="space-y-3 text-sm text-gray-700">
               <p>• Gula darah di atas 250 mg/dL atau di bawah 70 mg/dL</p>
               <p>• Mual, muntah, atau sakit perut yang tidak biasa</p>
               <p>• Sesak napas atau nyeri dada</p>
               <p>• Luka yang tidak kunjung sembuh</p>
               <p className="font-medium text-red-600">Segera hubungi dokter jika mengalami gejala di atas</p>
             </div>
           </div>
         </div>

         <div className="bg-white rounded-lg shadow-sm p-6">
           <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips Harian untuk Penderita Diabetes</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <h4 className="font-medium text-gray-900 mb-3">Pagi Hari</h4>
               <ul className="space-y-2 text-sm text-gray-700">
                 <li>• Periksa gula darah sebelum sarapan</li>
                 <li>• Minum obat sesuai jadwal dokter</li>
                 <li>• Sarapan dengan menu seimbang</li>
                 <li>• Lakukan peregangan ringan</li>
               </ul>
             </div>
             <div>
               <h4 className="font-medium text-gray-900 mb-3">Siang Hari</h4>
               <ul className="space-y-2 text-sm text-gray-700">
                 <li>• Makan siang dengan porsi terkontrol</li>
                 <li>• Minum air putih yang cukup</li>
                 <li>• Istirahat sejenak dari aktivitas</li>
                 <li>• Jalan kaki ringan setelah makan</li>
               </ul>
             </div>
             <div>
               <h4 className="font-medium text-gray-900 mb-3">Sore Hari</h4>
               <ul className="space-y-2 text-sm text-gray-700">
                 <li>• Snack sehat jika diperlukan</li>
                 <li>• Lakukan aktivitas fisik ringan</li>
                 <li>• Periksa kaki dari luka atau lecet</li>
                 <li>• Siapkan obat untuk malam hari</li>
               </ul>
             </div>
             <div>
               <h4 className="font-medium text-gray-900 mb-3">Malam Hari</h4>
               <ul className="space-y-2 text-sm text-gray-700">
                 <li>• Makan malam 3-4 jam sebelum tidur</li>
                 <li>• Catat hasil gula darah hari ini</li>
                 <li>• Siapkan keperluan untuk besok</li>
                 <li>• Tidur cukup 7-8 jam</li>
               </ul>
             </div>
           </div>
         </div>
       </div>
     )}

     {/* Patient Detail Modal */}
     {selectedPatient && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
         <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
           <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
             <h3 className="text-lg font-semibold text-gray-900">Detail Pasien</h3>
             <button
               onClick={() => setSelectedPatient(null)}
               className="text-gray-400 hover:text-gray-600"
             >
               <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
           </div>
           
           <div className="px-6 py-4 space-y-6">
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <p className="text-sm font-medium text-gray-600">Nama</p>
                 <p className="text-lg text-gray-900">{selectedPatient.name}</p>
               </div>
               <div>
                 <p className="text-sm font-medium text-gray-600">No. RM</p>
                 <p className="text-lg text-gray-900">{selectedPatient.mrNumber}</p>
               </div>
               <div>
                 <p className="text-sm font-medium text-gray-600">Umur</p>
                 <p className="text-lg text-gray-900">{selectedPatient.age} tahun</p>
               </div>
               <div>
                 <p className="text-sm font-medium text-gray-600">Jenis Kelamin</p>
                 <p className="text-lg text-gray-900">{selectedPatient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
               </div>
               <div>
                 <p className="text-sm font-medium text-gray-600">Penjamin</p>
                 <p className="text-lg text-gray-900">{selectedPatient.insuranceType}</p>
               </div>
               <div>
                 <p className="text-sm font-medium text-gray-600">Tipe Diabetes</p>
                 <p className="text-lg text-gray-900">{selectedPatient.diabetesType}</p>
               </div>
             </div>

             <div className="border-t pt-4">
               <h4 className="font-medium text-gray-900 mb-3">Vital Signs Terakhir</h4>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="bg-blue-50 p-3 rounded-lg text-center">
                   <p className="text-2xl font-bold text-blue-700">{selectedPatient.bloodSugar.value}</p>
                   <p className="text-xs text-blue-600">GDS (mg/dL)</p>
                 </div>
                 <div className="bg-red-50 p-3 rounded-lg text-center">
                   <p className="text-2xl font-bold text-red-700">{selectedPatient.vitalSigns.bloodPressure}</p>
                   <p className="text-xs text-red-600">Tekanan Darah</p>
                 </div>
                 <div className="bg-green-50 p-3 rounded-lg text-center">
                   <p className="text-2xl font-bold text-green-700">{selectedPatient.vitalSigns.heartRate}</p>
                   <p className="text-xs text-green-600">Nadi (bpm)</p>
                 </div>
                 <div className="bg-purple-50 p-3 rounded-lg text-center">
                   <p className="text-2xl font-bold text-purple-700">{selectedPatient.vitalSigns.weight}</p>
                   <p className="text-xs text-purple-600">Berat Badan (kg)</p>
                 </div>
               </div>
             </div>

             {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
               <div className="border-t pt-4">
                 <h4 className="font-medium text-gray-900 mb-3">Alergi</h4>
                 <div className="flex flex-wrap gap-2">
                   {selectedPatient.allergies.map((allergy, index) => (
                     <span key={index} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                       {allergy}
                     </span>
                   ))}
                 </div>
               </div>
             )}

             <div className="border-t pt-4">
               <h4 className="font-medium text-gray-900 mb-3">Keluhan Terkait</h4>
               <div className="space-y-2">
                 {complaints
                   .filter(c => c.patientId === selectedPatient.id)
                   .map(complaint => (
                     <div key={complaint.id} className="bg-gray-50 p-3 rounded">
                       <div className="flex items-center justify-between mb-1">
                         <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(complaint.severity)}`}>
                           {complaint.severity}
                         </span>
                         <span className="text-xs text-gray-500">{complaint.date}</span>
                       </div>
                       <p className="text-sm text-gray-700">{complaint.complaint}</p>
                     </div>
                   ))}
               </div>
             </div>
           </div>
         </div>
       </div>
     )}
   </div>
 );
};

export default NursePoliDashboard;