// components/dashboard/PatientDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface VitalSign {
  id: string;
  bloodSugar: number;
  bloodPressure: string;
  weight: number;
  date: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  nextDose: string;
  taken: boolean;
}

const PatientDashboard = () => {
  const { data: session } = useSession();
  const [vitalSigns, setVitalSigns] = useState<VitalSign[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [bloodSugar, setBloodSugar] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [weight, setWeight] = useState('');

  // Demo data - nanti akan diganti dengan API calls
  useEffect(() => {
    setVitalSigns([
      { id: '1', bloodSugar: 120, bloodPressure: '120/80', weight: 70, date: '2024-01-15' },
      { id: '2', bloodSugar: 115, bloodPressure: '118/78', weight: 69.5, date: '2024-01-14' }
    ]);

    setMedications([
      { id: '1', name: 'Metformin', dosage: '500mg', frequency: '2x sehari', nextDose: '14:00', taken: false },
      { id: '2', name: 'Insulin Lantus', dosage: '10 unit', frequency: '1x sehari', nextDose: '20:00', taken: true }
    ]);
  }, []);

  const handleVitalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API call to save vital signs
    const newVital: VitalSign = {
      id: Date.now().toString(),
      bloodSugar: parseInt(bloodSugar),
      bloodPressure,
      weight: parseFloat(weight),
      date: new Date().toISOString().split('T')[0]
    };
    
    setVitalSigns([newVital, ...vitalSigns]);
    setBloodSugar('');
    setBloodPressure('');
    setWeight('');
  };

  const markMedicationTaken = (medicationId: string) => {
    setMedications(medications.map(med => 
      med.id === medicationId ? { ...med, taken: true } : med
    ));
  };

  const getBloodSugarStatus = (value: number) => {
    if (value < 70) return { status: 'Rendah', color: 'text-red-500', bg: 'bg-red-50' };
    if (value <= 140) return { status: 'Normal', color: 'text-green-500', bg: 'bg-green-50' };
    return { status: 'Tinggi', color: 'text-red-500', bg: 'bg-red-50' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Welcome Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Selamat Datang, {session?.user?.name} 👋
              </h1>
              <p className="text-gray-600 mt-1">Mari jaga kesehatan diabetes Anda hari ini</p>
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
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gula Darah Terakhir</p>
                <p className="text-2xl font-bold text-blue-600">
                  {vitalSigns[0]?.bloodSugar || '--'} mg/dL
                </p>
                {vitalSigns[0] && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBloodSugarStatus(vitalSigns[0].bloodSugar).bg} ${getBloodSugarStatus(vitalSigns[0].bloodSugar).color}`}>
                    {getBloodSugarStatus(vitalSigns[0].bloodSugar).status}
                  </span>
                )}
              </div>
              <div className="text-3xl">🩸</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Obat Hari Ini</p>
                <p className="text-2xl font-bold text-green-600">
                  {medications.filter(med => med.taken).length}/{medications.length}
                </p>
                <p className="text-xs text-gray-500">obat telah diminum</p>
              </div>
              <div className="text-3xl">💊</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Berat Badan</p>
                <p className="text-2xl font-bold text-purple-600">
                  {vitalSigns[0]?.weight || '--'} kg
                </p>
                <p className="text-xs text-gray-500">terakhir diukur</p>
              </div>
              <div className="text-3xl">⚖️</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Vital Signs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              📊 Input Tanda Vital
            </h2>
            
            <form onSubmit={handleVitalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gula Darah (mg/dL)
                </label>
                <input
                  type="number"
                  value={bloodSugar}
                  onChange={(e) => setBloodSugar(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="contoh: 120"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tekanan Darah
                </label>
                <input
                  type="text"
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="contoh: 120/80"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Berat Badan (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="contoh: 70.5"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105"
              >
                💾 Simpan Data Vital
              </button>
            </form>
          </div>

          {/* Medication Reminders */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              💊 Pengingat Obat
            </h2>
            
            <div className="space-y-3">
              {medications.map((medication) => (
                <div
                  key={medication.id}
                  className={`p-4 rounded-lg border ${
                    medication.taken 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {medication.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {medication.dosage} • {medication.frequency}
                      </p>
                      <p className="text-xs text-gray-500">
                        Dosis berikutnya: {medication.nextDose}
                      </p>
                    </div>
                    
                    {!medication.taken ? (
                      <button
                        onClick={() => markMedicationTaken(medication.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        ✅ Minum
                      </button>
                    ) : (
                      <div className="text-green-500 font-medium">
                        ✅ Sudah diminum
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vital Signs History */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            📈 Riwayat Tanda Vital
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50 rounded-lg">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tanggal</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Gula Darah</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tekanan Darah</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Berat Badan</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vitalSigns.map((vital) => (
                  <tr key={vital.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(vital.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {vital.bloodSugar} mg/dL
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {vital.bloodPressure}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {vital.weight} kg
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBloodSugarStatus(vital.bloodSugar).bg} ${getBloodSugarStatus(vital.bloodSugar).color}`}>
                        {getBloodSugarStatus(vital.bloodSugar).status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl p-6 text-white">
          <h2 className="text-xl font-bold mb-3">💡 Tips Hari Ini</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2">🥗 Pola Makan</h3>
              <p className="text-sm opacity-90">
                Konsumsi makanan tinggi serat dan rendah gula untuk menjaga kadar gula darah stabil.
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-2">🏃‍♂️ Aktivitas Fisik</h3>
              <p className="text-sm opacity-90">
                Lakukan olahraga ringan 30 menit setiap hari untuk meningkatkan sensitivitas insulin.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PatientDashboard;