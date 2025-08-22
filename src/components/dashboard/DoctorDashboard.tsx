// src/components/dashboard/DoctorDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Patient {
  id: string;
  mrNumber: string;
  name: string;
  diabetesType: string;
  lastVisit: string;
  lastBloodSugar: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  nextAppointment?: string;
}

interface Appointment {
  id: string;
  patientName: string;
  patientMR: string;
  time: string;
  type: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

interface Alert {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  patientName: string;
  timestamp: string;
}

const DoctorDashboard = () => {
  const { data: session } = useSession();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Demo data - nanti akan diganti dengan API calls
  useEffect(() => {
    setPatients([
      {
        id: '1',
        mrNumber: 'MR-001',
        name: 'Ahmad Santoso',
        diabetesType: 'Tipe 2',
        lastVisit: '2024-01-10',
        lastBloodSugar: 180,
        riskLevel: 'HIGH',
        nextAppointment: '2024-01-20'
      },
      {
        id: '2',
        mrNumber: 'MR-002',
        name: 'Siti Nurhaliza',
        diabetesType: 'Tipe 1',
        lastVisit: '2024-01-12',
        lastBloodSugar: 120,
        riskLevel: 'LOW',
        nextAppointment: '2024-01-25'
      },
      {
        id: '3',
        mrNumber: 'MR-003',
        name: 'Budi Pratama',
        diabetesType: 'Tipe 2',
        lastVisit: '2024-01-08',
        lastBloodSugar: 160,
        riskLevel: 'MEDIUM'
      }
    ]);

    setTodayAppointments([
      {
        id: '1',
        patientName: 'Ahmad Santoso',
        patientMR: 'MR-001',
        time: '09:00',
        type: 'Konsultasi Rutin',
        status: 'SCHEDULED'
      },
      {
        id: '2',
        patientName: 'Maya Sari',
        patientMR: 'MR-004',
        time: '10:30',
        type: 'Follow Up',
        status: 'IN_PROGRESS'
      },
      {
        id: '3',
        patientName: 'Rudi Hartono',
        patientMR: 'MR-005',
        time: '14:00',
        type: 'Konsultasi Baru',
        status: 'SCHEDULED'
      }
    ]);

    setAlerts([
      {
        id: '1',
        type: 'CRITICAL',
        message: 'Gula darah sangat tinggi: 250 mg/dL',
        patientName: 'Ahmad Santoso',
        timestamp: '08:30'
      },
      {
        id: '2',
        type: 'WARNING',
        message: 'Tidak mengonsumsi obat selama 2 hari',
        patientName: 'Budi Pratama',
        timestamp: '07:45'
      }
    ]);
  }, []);

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'CRITICAL': return '🚨';
      case 'WARNING': return '⚠️';
      case 'INFO': return 'ℹ️';
      default: return '📢';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'text-blue-600 bg-blue-100';
      case 'IN_PROGRESS': return 'text-green-600 bg-green-100';
      case 'COMPLETED': return 'text-gray-600 bg-gray-100';
      case 'CANCELLED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAppointmentStatusChange = (appointmentId: string, newStatus: string) => {
    setTodayAppointments(appointments =>
      appointments.map(apt =>
        apt.id === appointmentId 
          ? { ...apt, status: newStatus as any }
          : apt
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Doctor Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Dr. {session?.user?.name} 👨‍⚕️
              </h1>
              <p className="text-gray-600 mt-1">Diabetes Care Management - RS Pantinugroho</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-lg font-semibold text-blue-600">
                {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pasien</p>
                <p className="text-2xl font-bold text-blue-600">{patients.length}</p>
                <p className="text-xs text-gray-500">aktif ditangani</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Janji Hari Ini</p>
                <p className="text-2xl font-bold text-green-600">{todayAppointments.length}</p>
                <p className="text-xs text-gray-500">
                  {todayAppointments.filter(apt => apt.status === 'COMPLETED').length} selesai
                </p>
              </div>
              <div className="text-3xl">📅</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pasien Risiko Tinggi</p>
                <p className="text-2xl font-bold text-red-600">
                  {patients.filter(p => p.riskLevel === 'HIGH').length}
                </p>
                <p className="text-xs text-gray-500">perlu perhatian khusus</p>
              </div>
              <div className="text-3xl">🚨</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Notifikasi</p>
                <p className="text-2xl font-bold text-orange-600">{alerts.length}</p>
                <p className="text-xs text-gray-500">peringatan aktif</p>
              </div>
              <div className="text-3xl">🔔</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Today's Appointments */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              📅 Jadwal Hari Ini
            </h2>
            
            <div className="space-y-3">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">
                          {appointment.patientName}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {appointment.patientMR} • {appointment.type}
                      </p>
                      <p className="text-sm font-medium text-blue-600">
                        {appointment.time}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      {appointment.status === 'SCHEDULED' && (
                        <button
                          onClick={() => handleAppointmentStatusChange(appointment.id, 'IN_PROGRESS')}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Mulai
                        </button>
                      )}
                      {appointment.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleAppointmentStatusChange(appointment.id, 'COMPLETED')}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Selesai
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              🚨 Peringatan Penting
            </h2>
            
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${
                    alert.type === 'CRITICAL' 
                      ? 'bg-red-50 border-red-200' 
                      : alert.type === 'WARNING'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-xl">{getAlertIcon(alert.type)}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {alert.patientName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {alert.timestamp}
                      </p>
                    </div>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                      Tindak Lanjut
                    </button>
                  </div>
                </div>
              ))}
              
              {alerts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">✅</div>
                  <p>Tidak ada peringatan saat ini</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Patient Management */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              👥 Manajemen Pasien
            </h2>
            <button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105">
              + Tambah Pasien Baru
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="🔍 Cari pasien berdasarkan nama atau nomor MR..."
            />
          </div>

          {/* Patient List */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50 rounded-lg">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">No. MR</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nama Pasien</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tipe DM</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Kunjungan Terakhir</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Gula Darah</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Risiko</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">
                      {patient.mrNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {patient.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {patient.diabetesType}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(patient.lastVisit).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <span className={`font-medium ${
                        patient.lastBloodSugar > 140 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {patient.lastBloodSugar} mg/dL
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(patient.riskLevel)}`}>
                        {patient.riskLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedPatient(patient)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Detail
                        </button>
                        <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                          Rekam Medis
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPatients.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🔍</div>
              <p>Tidak ada pasien yang ditemukan</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white cursor-pointer hover:scale-105 transition-transform">
            <div className="flex items-center gap-4">
              <div className="text-4xl">📋</div>
              <div>
                <h3 className="font-bold text-lg">Buat Resep</h3>
                <p className="text-sm opacity-90">Tulis resep untuk pasien</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white cursor-pointer hover:scale-105 transition-transform">
            <div className="flex items-center gap-4">
              <div className="text-4xl">📊</div>
              <div>
                <h3 className="font-bold text-lg">Laporan Bulanan</h3>
                <p className="text-sm opacity-90">Lihat statistik pasien</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white cursor-pointer hover:scale-105 transition-transform">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🎓</div>
              <div>
                <h3 className="font-bold text-lg">Edukasi Pasien</h3>
                <p className="text-sm opacity-90">Materi pembelajaran</p>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Detail Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Detail Pasien</h3>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Nomor MR</label>
                  <p className="font-medium">{selectedPatient.mrNumber}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Nama Lengkap</label>
                  <p className="font-medium">{selectedPatient.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Tipe Diabetes</label>
                  <p className="font-medium">{selectedPatient.diabetesType}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Gula Darah Terakhir</label>
                  <p className="font-medium">{selectedPatient.lastBloodSugar} mg/dL</p>
                </div>
                {selectedPatient.nextAppointment && (
                  <div>
                    <label className="text-sm text-gray-600">Janji Berikutnya</label>
                    <p className="font-medium">
                      {new Date(selectedPatient.nextAppointment).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex gap-3">
                <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg">
                  Lihat Rekam Medis
                </button>
                <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg">
                  Buat Janji Temu
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DoctorDashboard;