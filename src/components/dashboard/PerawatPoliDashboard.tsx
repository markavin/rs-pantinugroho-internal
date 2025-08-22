// components/dashboard/PatientDashboard.tsx - NOW: Perawat Poli Dashboard
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface PatientData {
  id: string;
  name: string;
  mrNumber: string;
  lastVisit: string;
  bloodSugarTrend: 'IMPROVING' | 'STABLE' | 'WORSENING';
  currentBloodSugar: number;
  complaints: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface BloodSugarHistory {
  date: string;
  value: number;
  time: string;
  notes?: string;
}

interface MealReminder {
  id: string;
  time: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  portion: string;
  recommendation: string;
  isCompleted: boolean;
}

interface EducationMaterial {
  id: string;
  title: string;
  type: 'VIDEO' | 'IMAGE' | 'INFOGRAPHIC';
  content: string;
  category: 'DIET' | 'EXERCISE' | 'MEDICATION' | 'LIFESTYLE';
}

const PerawatPoliDashboard = () => {
  const { data: session } = useSession();
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [bloodSugarHistory, setBloodSugarHistory] = useState<BloodSugarHistory[]>([]);
  const [mealReminders, setMealReminders] = useState<MealReminder[]>([]);
  const [educationMaterials, setEducationMaterials] = useState<EducationMaterial[]>([]);
  const [newComplaint, setNewComplaint] = useState('');
  const [showNotifications, setShowNotifications] = useState(true);

  // Demo data - disesuaikan untuk kebutuhan Perawat Poli
  useEffect(() => {
    setPatients([
      {
        id: '1',
        name: 'Ibu Sari Wijaya',
        mrNumber: 'MR001234',
        lastVisit: '2024-01-15',
        bloodSugarTrend: 'IMPROVING',
        currentBloodSugar: 140,
        complaints: ['Sering haus', 'Mudah lelah'],
        riskLevel: 'MEDIUM'
      },
      {
        id: '2', 
        name: 'Bapak Ahmad Santoso',
        mrNumber: 'MR001235',
        lastVisit: '2024-01-14',
        bloodSugarTrend: 'WORSENING',
        currentBloodSugar: 180,
        complaints: ['Penglihatan kabur', 'Sering buang air kecil'],
        riskLevel: 'HIGH'
      },
      {
        id: '3',
        name: 'Ibu Maya Kusuma',
        mrNumber: 'MR001236', 
        lastVisit: '2024-01-13',
        bloodSugarTrend: 'STABLE',
        currentBloodSugar: 120,
        complaints: [],
        riskLevel: 'LOW'
      }
    ]);

    setBloodSugarHistory([
      { date: '2024-01-15', value: 140, time: '08:00', notes: 'Setelah sarapan' },
      { date: '2024-01-14', value: 135, time: '08:00', notes: 'Setelah sarapan' },
      { date: '2024-01-13', value: 145, time: '08:00', notes: 'Setelah sarapan' },
      { date: '2024-01-12', value: 150, time: '08:00', notes: 'Setelah sarapan' },
      { date: '2024-01-11', value: 155, time: '08:00', notes: 'Setelah sarapan' },
    ]);

    setMealReminders([
      {
        id: '1',
        time: '07:00',
        mealType: 'BREAKFAST',
        portion: '1 porsi sedang',
        recommendation: '1 piring nasi merah + sayur + lauk protein',
        isCompleted: true
      },
      {
        id: '2', 
        time: '12:00',
        mealType: 'LUNCH',
        portion: '1 porsi sedang',
        recommendation: '1 piring nasi + sayur hijau + ikan/ayam',
        isCompleted: false
      },
      {
        id: '3',
        time: '18:00', 
        mealType: 'DINNER',
        portion: '1 porsi kecil',
        recommendation: 'Makanan ringan + buah rendah gula',
        isCompleted: false
      }
    ]);

    setEducationMaterials([
      {
        id: '1',
        title: 'Cara Mengukur Gula Darah yang Benar',
        type: 'VIDEO',
        content: '🎥 Video edukasi 5 menit',
        category: 'MEDICATION'
      },
      {
        id: '2',
        title: 'Menu Diabetes Sehat & Lezat',
        type: 'INFOGRAPHIC',  
        content: '📊 Infografis menu harian',
        category: 'DIET'
      },
      {
        id: '3',
        title: 'Olahraga Ringan untuk Diabetes',
        type: 'IMAGE',
        content: '🖼️ Panduan gerakan sederhana',
        category: 'EXERCISE'
      }
    ]);

    // Set patient pertama sebagai default
    setSelectedPatient(patients[0] || null);
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'IMPROVING': return '📈';
      case 'STABLE': return '➡️';
      case 'WORSENING': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'IMPROVING': return 'text-green-600';
      case 'STABLE': return 'text-blue-600';
      case 'WORSENING': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'BREAKFAST': return '🌅';
      case 'LUNCH': return '☀️';
      case 'DINNER': return '🌙';
      case 'SNACK': return '🍎';
      default: return '🍽️';
    }
  };

  const toggleMealCompletion = (reminderId: string) => {
    setMealReminders(prev => 
      prev.map(reminder => 
        reminder.id === reminderId 
          ? { ...reminder, isCompleted: !reminder.isCompleted }
          : reminder
      )
    );
  };

  const addComplaint = () => {
    if (newComplaint.trim() && selectedPatient) {
      setPatients(prev => 
        prev.map(patient => 
          patient.id === selectedPatient.id 
            ? { ...patient, complaints: [...patient.complaints, newComplaint.trim()] }
            : patient
        )
      );
      setNewComplaint('');
      
      // Update selected patient
      if (selectedPatient) {
        setSelectedPatient(prev => 
          prev ? { ...prev, complaints: [...prev.complaints, newComplaint.trim()] } : null
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header dengan warna cerah dan motivasi */}
        <div className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                💉 Dashboard Perawat Poli Diabetes
              </h1>
              <p className="mt-1 opacity-90">
                Selamat datang, {session?.user?.name} - Berikan pelayanan terbaik dengan hati! 💙
              </p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-sm font-medium">
                  {new Date().toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    day: 'numeric',
                    month: 'long'
                  })}
                </p>
                <p className="text-xs opacity-75">Shift Poliklinik</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notifikasi Pengingat - Interaktif */}
        {showNotifications && (
          <div className="bg-orange-100 border-l-4 border-orange-500 p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl animate-bounce">🔔</div>
                <div>
                  <h3 className="font-semibold text-orange-800">Pengingat Aktif</h3>
                  <p className="text-sm text-orange-700">
                    3 pasien perlu pemantauan gula darah hari ini • 2 jadwal makan pending
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowNotifications(false)}
                className="text-orange-600 hover:text-orange-800 font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Panel Kiri: Daftar Pasien */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                👥 Pasien Hari Ini ({patients.length})
              </h2>
              
              <div className="space-y-3">
                {patients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedPatient?.id === patient.id 
                        ? 'bg-blue-50 border-blue-300 shadow-md' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800">{patient.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(patient.riskLevel)}`}>
                        {patient.riskLevel}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-1">MR: {patient.mrNumber}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{getTrendIcon(patient.bloodSugarTrend)}</span>
                        <span className={`text-sm font-medium ${getTrendColor(patient.bloodSugarTrend)}`}>
                          {patient.currentBloodSugar} mg/dL
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(patient.lastVisit).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel Tengah & Kanan: Detail Pasien */}
          <div className="lg:col-span-2 space-y-6">
            
            {selectedPatient && (
              <>
                {/* Riwayat Gula Darah & Kecenderungan */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                  <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    📈 Riwayat Gula Darah - {selectedPatient.name}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Grafik Trend (simplified) */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-700">Kecenderungan 5 Hari Terakhir</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        {bloodSugarHistory.map((record, index) => (
                          <div key={index} className="flex items-center justify-between py-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span className="text-sm text-gray-600">
                                {new Date(record.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-blue-600">{record.value}</span>
                              <span className="text-xs text-gray-500">mg/dL</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status & Keluhan */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-700">Status & Keluhan Pasien</h3>
                      <div className="space-y-3">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-blue-800">Gula Darah Saat Ini</p>
                          <p className="text-xl font-bold text-blue-600">
                            {selectedPatient.currentBloodSugar} mg/dL
                          </p>
                          <p className={`text-sm ${getTrendColor(selectedPatient.bloodSugarTrend)}`}>
                            {getTrendIcon(selectedPatient.bloodSugarTrend)} Trend: {
                              selectedPatient.bloodSugarTrend === 'IMPROVING' ? 'Membaik' :
                              selectedPatient.bloodSugarTrend === 'STABLE' ? 'Stabil' : 'Perlu Perhatian'
                            }
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Keluhan Pasien:</p>
                          {selectedPatient.complaints.length > 0 ? (
                            <div className="space-y-1">
                              {selectedPatient.complaints.map((complaint, index) => (
                                <div key={index} className="bg-yellow-50 border-l-3 border-yellow-400 p-2 text-sm">
                                  • {complaint}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">Tidak ada keluhan</p>
                          )}

                          {/* Input keluhan baru */}
                          <div className="mt-3 flex space-x-2">
                            <input
                              type="text"
                              value={newComplaint}
                              onChange={(e) => setNewComplaint(e.target.value)}
                              placeholder="Tambah keluhan baru..."
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={addComplaint}
                              className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600"
                            >
                              ➕
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pengingat Makan & Porsi */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                  <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    🍽️ Pengingat Makan & Porsi Hari Ini
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mealReminders.map((reminder) => (
                      <div
                        key={reminder.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          reminder.isCompleted 
                            ? 'bg-green-50 border-green-300' 
                            : 'bg-orange-50 border-orange-300'
                        }`}
                      >
                        <div className="text-center mb-3">
                          <div className="text-2xl mb-2">{getMealIcon(reminder.mealType)}</div>
                          <h3 className="font-semibold text-gray-800">
                            {reminder.mealType === 'BREAKFAST' ? 'Sarapan' :
                             reminder.mealType === 'LUNCH' ? 'Makan Siang' :
                             reminder.mealType === 'DINNER' ? 'Makan Malam' : 'Cemilan'}
                          </h3>
                          <p className="text-sm text-gray-600">{reminder.time}</p>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <p><strong>Porsi:</strong> {reminder.portion}</p>
                          <p className="text-gray-600">{reminder.recommendation}</p>
                        </div>
                        
                        <button
                          onClick={() => toggleMealCompletion(reminder.id)}
                          className={`w-full mt-3 py-2 px-4 rounded-lg font-medium transition-colors ${
                            reminder.isCompleted
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-orange-500 text-white hover:bg-orange-600'
                          }`}
                        >
                          {reminder.isCompleted ? '✅ Selesai' : '⏰ Belum'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Informasi & Edukasi untuk Pasien - Interaktif */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            🎓 Materi Edukasi Interaktif
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {educationMaterials.map((material) => (
              <div key={material.id} className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-4 border border-purple-200">
                <div className="text-center mb-3">
                  <div className="text-3xl mb-2">
                    {material.type === 'VIDEO' ? '🎥' : 
                     material.type === 'IMAGE' ? '🖼️' : '📊'}
                  </div>
                  <h3 className="font-semibold text-gray-800">{material.title}</h3>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{material.content}</p>
                
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    material.category === 'DIET' ? 'bg-green-100 text-green-800' :
                    material.category === 'EXERCISE' ? 'bg-blue-100 text-blue-800' :
                    material.category === 'MEDICATION' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {material.category}
                  </span>
                  
                  <button className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-purple-600">
                    📱 Bagikan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Motivational Footer dengan warna cerah */}
        <div className="bg-gradient-to-r from-green-400 to-teal-500 rounded-xl p-6 text-white text-center">
          <h2 className="text-xl font-bold mb-2">💪 Semangat Pelayanan Hari Ini!</h2>
          <p className="opacity-90 mb-4">
            Setiap senyuman dan kepedulian Anda membuat perbedaan besar dalam hidup pasien diabetes
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-1">
              <span>👥</span>
              <span>{patients.length} Pasien Terlayani</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>🎯</span>
              <span>85% Target Edukasi Tercapai</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>💙</span>
              <span>Pelayanan Penuh Kasih</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PerawatPoliDashboard;