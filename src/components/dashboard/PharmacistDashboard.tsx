// components/dashboard/PharmacistDashboard.tsx
'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Prescription {
  id: string;
  patientName: string;
  mrNumber: string;
  doctorName: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  prescribedDate: Date;
  status: 'PENDING' | 'VERIFIED' | 'DISPENSED' | 'REJECTED';
  interactions: string[];
  allergies: string[];
}

interface MedicationStock {
  id: string;
  name: string;
  genericName: string;
  type: string;
  stockQuantity: number;
  minStock: number;
  expiryDate: Date;
  manufacturer: string;
  batchNumber: string;
  price: number;
  diabetesSpecific: boolean;
}

interface DrugInteraction {
  medication1: string;
  medication2: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  description: string;
}

export default function PharmacistDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'inventory' | 'interactions' | 'reports'>('prescriptions');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medications, setMedications] = useState<MedicationStock[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  // Stats untuk dashboard
  const [stats, setStats] = useState({
    pendingPrescriptions: 8,
    lowStockItems: 3,
    totalMedications: 156,
    todayDispensed: 42
  });

  // Drug interaction checker
  const [interactionCheck, setInteractionCheck] = useState({
    medication1: '',
    medication2: '',
    result: null as DrugInteraction | null
  });

  // Demo data
  useEffect(() => {
    const demoPrescriptions: Prescription[] = [
      {
        id: '1',
        patientName: 'Ahmad Santoso',
        mrNumber: 'MR-001234',
        doctorName: 'Dr. Sarah Wijaya',
        medications: [
          {
            name: 'Metformin 500mg',
            dosage: '500mg',
            frequency: '2x sehari',
            duration: '30 hari',
            instructions: 'Diminum setelah makan'
          },
          {
            name: 'Insulin Rapid Acting',
            dosage: '10 unit',
            frequency: '3x sehari',
            duration: '30 hari',
            instructions: 'Injeksi 15 menit sebelum makan'
          }
        ],
        prescribedDate: new Date(),
        status: 'PENDING',
        interactions: ['Metformin + Kontras dapat menyebabkan asidosis laktat'],
        allergies: ['Penicillin', 'Sulfa']
      },
      {
        id: '2',
        patientName: 'Siti Rahayu',
        mrNumber: 'MR-005678',
        doctorName: 'Dr. Budi Hartono',
        medications: [
          {
            name: 'Glibenclamide 5mg',
            dosage: '5mg',
            frequency: '1x sehari',
            duration: '30 hari',
            instructions: 'Diminum sebelum sarapan'
          }
        ],
        prescribedDate: new Date(Date.now() - 86400000),
        status: 'VERIFIED',
        interactions: [],
        allergies: []
      }
    ];

    const demoMedications: MedicationStock[] = [
      {
        id: '1',
        name: 'Metformin 500mg',
        genericName: 'Metformin HCl',
        type: 'Tablet',
        stockQuantity: 45,
        minStock: 50,
        expiryDate: new Date('2025-12-31'),
        manufacturer: 'Kimia Farma',
        batchNumber: 'MF2024001',
        price: 2500,
        diabetesSpecific: true
      },
      {
        id: '2',
        name: 'Insulin Rapid Acting',
        genericName: 'Insulin Aspart',
        type: 'Injection',
        stockQuantity: 15,
        minStock: 20,
        expiryDate: new Date('2025-06-30'),
        manufacturer: 'Novo Nordisk',
        batchNumber: 'NN2024A',
        price: 125000,
        diabetesSpecific: true
      },
      {
        id: '3',
        name: 'Glibenclamide 5mg',
        genericName: 'Glibenclamide',
        type: 'Tablet',
        stockQuantity: 8,
        minStock: 25,
        expiryDate: new Date('2025-03-15'),
        manufacturer: 'Indofarma',
        batchNumber: 'IF2024B',
        price: 1800,
        diabetesSpecific: true
      }
    ];

    setPrescriptions(demoPrescriptions);
    setMedications(demoMedications);
  }, []);

  const handlePrescriptionAction = async (prescriptionId: string, action: 'VERIFIED' | 'DISPENSED' | 'REJECTED') => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setPrescriptions(prev => 
        prev.map(p => p.id === prescriptionId ? { ...p, status: action } : p)
      );
      setSelectedPrescription(null);
      setIsLoading(false);
      alert(`✅ Resep berhasil ${action.toLowerCase()}!`);
    }, 1000);
  };

  const checkDrugInteraction = () => {
    if (!interactionCheck.medication1 || !interactionCheck.medication2) return;

    // Demo interaction check
    const demoResult: DrugInteraction = {
      medication1: interactionCheck.medication1,
      medication2: interactionCheck.medication2,
      severity: 'MODERATE',
      description: 'Kombinasi ini dapat meningkatkan risiko hipoglikemia. Monitor gula darah lebih ketat.'
    };
    
    setInteractionCheck({ ...interactionCheck, result: demoResult });
  };

  const updateMedicationStock = (medicationId: string, newQuantity: number) => {
    setMedications(prev =>
      prev.map(med => med.id === medicationId ? { ...med, stockQuantity: newQuantity } : med)
    );
    alert('✅ Stok obat berhasil diupdate!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'VERIFIED': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'DISPENSED': return 'bg-green-100 text-green-800 border-green-300';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'MILD': return 'text-yellow-600 bg-yellow-100';
      case 'MODERATE': return 'text-orange-600 bg-orange-100';
      case 'SEVERE': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.mrNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || prescription.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const lowStockMedications = medications.filter(med => med.stockQuantity <= med.minStock);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            💊 Dashboard Apoteker
          </h1>
          <p className="text-gray-600 mt-2">
            Selamat datang, {session?.user?.name}! Kelola obat dan resep dengan keamanan optimal.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Obat</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalMedications}</p>
              </div>
              <div className="text-3xl">💊</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dispensed Hari Ini</p>
                <p className="text-2xl font-bold text-blue-600">{stats.todayDispensed}</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resep Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingPrescriptions}</p>
              </div>
              <div className="text-3xl">📋</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stok Menipis</p>
                <p className="text-2xl font-bold text-red-600">{stats.lowStockItems}</p>
              </div>
              <div className="text-3xl">⚠️</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'prescriptions', label: '📋 Verifikasi Resep' },
                { id: 'inventory', label: '📦 Manajemen Stok' },
                { id: 'interactions', label: '⚠️ Cek Interaksi Obat' },
                { id: 'reports', label: '📊 Laporan Farmasi' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'prescriptions' && (
              <div className="space-y-6">
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="🔍 Cari pasien atau nomor MR..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="DISPENSED">Dispensed</option>
                  </select>
                </div>

                {/* Prescriptions List */}
                <div className="grid gap-4">
                  {filteredPrescriptions.map((prescription) => (
                    <div key={prescription.id} className="bg-gradient-to-r from-white to-green-50 p-6 rounded-lg border border-green-200 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {prescription.patientName} ({prescription.mrNumber})
                          </h3>
                          <p className="text-sm text-gray-600">
                            Dokter: {prescription.doctorName} • {new Date(prescription.prescribedDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(prescription.status)}`}>
                          {prescription.status}
                        </span>
                      </div>

                      {/* Medications */}
                      <div className="space-y-2 mb-4">
                        {prescription.medications.map((med, index) => (
                          <div key={index} className="bg-white p-3 rounded border border-gray-200">
                            <p className="font-medium text-gray-800">{med.name}</p>
                            <p className="text-sm text-gray-600">
                              {med.dosage} • {med.frequency} • {med.duration}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{med.instructions}</p>
                          </div>
                        ))}
                      </div>

                      {/* Warnings */}
                      {(prescription.interactions.length > 0 || prescription.allergies.length > 0) && (
                        <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
                          <h4 className="font-medium text-red-800 mb-2">⚠️ Peringatan</h4>
                          {prescription.interactions.length > 0 && (
                            <p className="text-sm text-red-700 mb-1">
                              Interaksi: {prescription.interactions.join(', ')}
                            </p>
                          )}
                          {prescription.allergies.length > 0 && (
                            <p className="text-sm text-red-700">
                              Alergi: {prescription.allergies.join(', ')}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        {prescription.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handlePrescriptionAction(prescription.id, 'VERIFIED')}
                              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                              disabled={isLoading}
                            >
                              ✅ Verifikasi
                            </button>
                            <button
                              onClick={() => handlePrescriptionAction(prescription.id, 'REJECTED')}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                              disabled={isLoading}
                            >
                              ❌ Tolak
                            </button>
                          </>
                        )}
                        {prescription.status === 'VERIFIED' && (
                          <button
                            onClick={() => handlePrescriptionAction(prescription.id, 'DISPENSED')}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                            disabled={isLoading}
                          >
                            📦 Dispensed
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedPrescription(prescription)}
                          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          👁️ Detail
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-6">
                {/* Low Stock Alert */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-red-800 mb-3">⚠️ Stok Menipis</h3>
                  <div className="space-y-2">
                    {lowStockMedications.map((med) => (
                      <div key={med.id} className="bg-white p-3 rounded border flex justify-between items-center">
                        <div>
                          <p className="font-medium">{med.name}</p>
                          <p className="text-sm text-gray-600">
                            Sisa: {med.stockQuantity} | Min: {med.minStock}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const newStock = prompt(`Update stok ${med.name}:`, med.stockQuantity.toString());
                            if (newStock && !isNaN(Number(newStock))) {
                              updateMedicationStock(med.id, Number(newStock));
                            }
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm bg-blue-100 px-3 py-1 rounded"
                        >
                          Update
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* All Medications Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">📦 Semua Obat</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Obat</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kadaluarsa</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {medications.map((med) => (
                          <tr key={med.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-gray-800">{med.name}</p>
                                <p className="text-sm text-gray-600">{med.genericName}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                med.stockQuantity <= med.minStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {med.stockQuantity}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(med.expiryDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              Rp {med.price.toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => {
                                  const newStock = prompt(`Update stok ${med.name}:`, med.stockQuantity.toString());
                                  if (newStock && !isNaN(Number(newStock))) {
                                    updateMedicationStock(med.id, Number(newStock));
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Edit Stok
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

            {activeTab === 'interactions' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">⚠️ Cek Interaksi Obat</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Obat Pertama</label>
                      <select
                        value={interactionCheck.medication1}
                        onChange={(e) => setInteractionCheck({...interactionCheck, medication1: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">-- Pilih Obat --</option>
                        {medications.map((med) => (
                          <option key={med.id} value={med.name}>{med.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Obat Kedua</label>
                      <select
                        value={interactionCheck.medication2}
                        onChange={(e) => setInteractionCheck({...interactionCheck, medication2: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">-- Pilih Obat --</option>
                        {medications.map((med) => (
                          <option key={med.id} value={med.name}>{med.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={checkDrugInteraction}
                    className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-teal-700 transition-all"
                    disabled={!interactionCheck.medication1 || !interactionCheck.medication2}
                  >
                    🔍 Cek Interaksi
                  </button>

                  {interactionCheck.result && (
                    <div className={`mt-4 p-4 rounded-lg ${getSeverityColor(interactionCheck.result.severity)}`}>
                      <h4 className="font-semibold mb-2">
                        Hasil: {interactionCheck.result.severity}
                      </h4>
                      <p className="text-sm">{interactionCheck.result.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Dispensing Bulanan</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Resep:</span>
                        <span className="font-semibold">245</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Diabetes:</span>
                        <span className="font-semibold">189 (77%)</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">🔥 Obat Terpopuler</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Metformin:</span>
                        <span className="font-semibold">89x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Insulin:</span>
                        <span className="font-semibold">67x</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 Analisis Biaya</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-semibold">Rp 45.2M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rata-rata:</span>
                        <span className="font-semibold">Rp 184K</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">📄 Export Laporan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                      📊 Laporan Stok
                    </button>
                    <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                      💊 Laporan Dispensing
                    </button>
                    <button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
                      ⚠️ Laporan Interaksi
                    </button>
                    <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                      💰 Laporan Finansial
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Prescription Detail Modal */}
        {selectedPrescription && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Detail Resep</h3>
                <button
                  onClick={() => setSelectedPrescription(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ❌
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p><strong>Pasien:</strong> {selectedPrescription.patientName} ({selectedPrescription.mrNumber})</p>
                  <p><strong>Dokter:</strong> {selectedPrescription.doctorName}</p>
                  <p><strong>Tanggal:</strong> {new Date(selectedPrescription.prescribedDate).toLocaleDateString()}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Obat yang Diresepkan:</h4>
                  {selectedPrescription.medications.map((med, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded mb-2">
                      <p><strong>{med.name}</strong></p>
                      <p>Dosis: {med.dosage}</p>
                      <p>Frekuensi: {med.frequency}</p>
                      <p>Durasi: {med.duration}</p>
                      <p>Instruksi: {med.instructions}</p>
                    </div>
                  ))}
                </div>

                {selectedPrescription.interactions.length > 0 && (
                  <div className="bg-red-50 p-3 rounded">
                    <h4 className="font-semibold text-red-800">Peringatan Interaksi:</h4>
                    <ul className="list-disc list-inside text-red-700">
                      {selectedPrescription.interactions.map((interaction, index) => (
                        <li key={index}>{interaction}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedPrescription.status === 'PENDING' && (
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => handlePrescriptionAction(selectedPrescription.id, 'VERIFIED')}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      disabled={isLoading}
                    >
                      ✅ Verifikasi
                    </button>
                    <button
                      onClick={() => handlePrescriptionAction(selectedPrescription.id, 'REJECTED')}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                      disabled={isLoading}
                    >
                      ❌ Tolak
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}