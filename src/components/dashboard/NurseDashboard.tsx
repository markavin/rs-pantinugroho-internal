// components/dashboard/NurseDashboard.tsx
'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface VitalSignInput {
  patientId: string;
  bloodSugar: string;
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  weight: string;
  temperature: string;
  heartRate: string;
}

interface PatientAlert {
  id: string;
  patientName: string;
  mrNumber: string;
  alertType: 'CRITICAL' | 'HIGH' | 'MODERATE';
  message: string;
  timestamp: Date;
}

interface MedicationTask {
  id: string;
  patientName: string;
  mrNumber: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  status: 'PENDING' | 'ADMINISTERED' | 'MISSED';
}

export default function NurseDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'monitoring' | 'medications' | 'vitals'>('monitoring');
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState<PatientAlert[]>([]);
  const [medicationTasks, setMedicationTasks] = useState<MedicationTask[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [vitalSigns, setVitalSigns] = useState<VitalSignInput>({
    patientId: '',
    bloodSugar: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    weight: '',
    temperature: '',
    heartRate: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Stats untuk dashboard
  const [stats, setStats] = useState({
    totalPatients: 0,
    criticalAlerts: 0,
    medicationsPending: 0,
    vitalsRecorded: 0
  });

  useEffect(() => {
    fetchDashboardData();
    // Refresh alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [patientsRes, alertsRes, medicationsRes, statsRes] = await Promise.all([
        fetch('/api/patients?assignedToNurse=true'),
        fetch('/api/alerts?role=nurse'),
        fetch('/api/medication-tasks?status=pending'),
        fetch('/api/dashboard/stats?role=nurse')
      ]);

      setPatients(await patientsRes.json());
      setAlerts(await alertsRes.json());
      setMedicationTasks(await medicationsRes.json());
      setStats(await statsRes.json());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/alerts?role=nurse');
      setAlerts(await res.json());
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleVitalSignsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/vital-signs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...vitalSigns,
          patientId: selectedPatient,
          recordedBy: session?.user?.id
        })
      });

      if (response.ok) {
        // Reset form
        setVitalSigns({
          patientId: '',
          bloodSugar: '',
          bloodPressureSystolic: '',
          bloodPressureDiastolic: '',
          weight: '',
          temperature: '',
          heartRate: ''
        });
        setSelectedPatient('');
        
        // Refresh data
        fetchDashboardData();
        alert('✅ Tanda vital berhasil dicatat!');
      }
    } catch (error) {
      console.error('Error submitting vital signs:', error);
      alert('❌ Gagal mencatat tanda vital');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMedicationAdministered = async (taskId: string) => {
    try {
      const response = await fetch(`/api/medication-tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ADMINISTERED',
          administeredBy: session?.user?.id,
          administeredAt: new Date()
        })
      });

      if (response.ok) {
        fetchDashboardData();
        alert('✅ Obat telah diberikan!');
      }
    } catch (error) {
      console.error('Error updating medication task:', error);
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'CRITICAL': return 'bg-red-100 border-red-500 text-red-800';
      case 'HIGH': return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'MODERATE': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      default: return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const getBloodSugarStatus = (value: number) => {
    if (value < 70) return { status: 'Rendah', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (value <= 140) return { status: 'Normal', color: 'text-green-600', bg: 'bg-green-100' };
    if (value <= 200) return { status: 'Tinggi', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { status: 'Sangat Tinggi', color: 'text-red-600', bg: 'bg-red-100' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            👩‍⚕️ Dashboard Perawat
          </h1>
          <p className="text-gray-600 mt-2">
            Selamat datang, {session?.user?.name}! Kelola perawatan pasien diabetes dengan efektif.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pasien</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalPatients}</p>
              </div>
              <div className="text-3xl">🏥</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alert Kritis</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalAlerts}</p>
              </div>
              <div className="text-3xl">🚨</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Obat Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.medicationsPending}</p>
              </div>
              <div className="text-3xl">💊</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vital Hari Ini</p>
                <p className="text-2xl font-bold text-green-600">{stats.vitalsRecorded}</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'monitoring', label: '📊 Monitoring Pasien', icon: '📊' },
                { id: 'medications', label: '💊 Pemberian Obat', icon: '💊' },
                { id: 'vitals', label: '🩺 Input Tanda Vital', icon: '🩺' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'monitoring' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">🚨 Alert Pasien</h3>
                
                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">✅</div>
                    <p className="text-gray-600">Tidak ada alert kritis saat ini</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {alerts.map((alert) => (
                      <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.alertType)}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{alert.patientName} ({alert.mrNumber})</h4>
                            <p className="text-sm mt-1">{alert.message}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'medications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">💊 Jadwal Pemberian Obat</h3>
                
                {medicationTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">✅</div>
                    <p className="text-gray-600">Semua obat sudah diberikan hari ini</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {medicationTasks.map((task) => (
                      <div key={task.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {task.patientName} ({task.mrNumber})
                            </h4>
                            <p className="text-sm text-gray-600">
                              {task.medicationName} - {task.dosage}
                            </p>
                            <p className="text-xs text-gray-500">
                              Dijadwalkan: {task.scheduledTime}
                            </p>
                          </div>
                          <button
                            onClick={() => handleMedicationAdministered(task.id)}
                            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
                          >
                            ✅ Sudah Diberikan
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'vitals' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">🩺 Input Tanda Vital Pasien</h3>
                
                <form onSubmit={handleVitalSignsSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pilih Pasien
                    </label>
                    <select
                      value={selectedPatient}
                      onChange={(e) => setSelectedPatient(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                      required
                    >
                      <option value="">-- Pilih Pasien --</option>
                      {patients.map((patient: any) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.name} ({patient.mrNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🩸 Gula Darah (mg/dL)
                      </label>
                      <input
                        type="number"
                        value={vitalSigns.bloodSugar}
                        onChange={(e) => setVitalSigns({...vitalSigns, bloodSugar: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                        placeholder="70-140"
                      />
                      {vitalSigns.bloodSugar && (
                        <div className="mt-1">
                          {(() => {
                            const status = getBloodSugarStatus(Number(vitalSigns.bloodSugar));
                            return (
                              <span className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
                                {status.status}
                              </span>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ❤️ Tekanan Darah Sistolik
                      </label>
                      <input
                        type="number"
                        value={vitalSigns.bloodPressureSystolic}
                        onChange={(e) => setVitalSigns({...vitalSigns, bloodPressureSystolic: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                        placeholder="120"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        💙 Tekanan Darah Diastolik
                      </label>
                      <input
                        type="number"
                        value={vitalSigns.bloodPressureDiastolic}
                        onChange={(e) => setVitalSigns({...vitalSigns, bloodPressureDiastolic: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                        placeholder="80"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ⚖️ Berat Badan (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={vitalSigns.weight}
                        onChange={(e) => setVitalSigns({...vitalSigns, weight: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                        placeholder="65.5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🌡️ Suhu Tubuh (°C)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={vitalSigns.temperature}
                        onChange={(e) => setVitalSigns({...vitalSigns, temperature: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                        placeholder="36.5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        💓 Detak Jantung (bpm)
                      </label>
                      <input
                        type="number"
                        value={vitalSigns.heartRate}
                        onChange={(e) => setVitalSigns({...vitalSigns, heartRate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                        placeholder="72"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !selectedPatient}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                  >
                    {isLoading ? 'Menyimpan...' : '💾 Simpan Tanda Vital'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}