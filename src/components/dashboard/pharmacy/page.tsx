import React, { useState, useEffect } from 'react';
import { Search, Plus, Pill, Users, FileText, Activity, Edit, Trash2, Eye, Menu, ShoppingCart, Package, AlertTriangle, CheckCircle, XCircle, X } from 'lucide-react';
import DataObatForm, { DrugData } from './DataObatForm';
import TransaksiObatForm from './TransaksiObatForm';
import SplashScreen from '@/components/SplashScreen';
// import PrescriptionSourceModal from './PrescriptionSourceModal';

interface Patient {
  id: string;
  name: string;
  mrNumber: string;
  phone?: string;
}

interface Transaction {
  id: string;
  patientId: string;
  patientName: string;
  mrNumber: string;
  items: TransactionItem[];
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

interface TransactionItem {
  drugId: string;
  drugName: string;
  quantity: number;
  subtotal: number;
}

const PharmacyDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'drugs' | 'transactions'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDrugForm, setShowDrugForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingDrug, setEditingDrug] = useState<DrugData | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [viewMode, setViewMode] = useState<'create' | 'edit' | 'detail'>('create');
  const [drugViewMode, setDrugViewMode] = useState<'create' | 'edit' | 'detail'>('create');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [drugData, setDrugData] = useState<DrugData[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRefreshSplash, setShowRefreshSplash] = useState(false);
  const [prescriptionSource, setPrescriptionSource] = useState<'DOCTOR_PRESCRIPTION' | 'MANUAL' | undefined>(undefined);
  const [relatedHandledPatientId, setRelatedHandledPatientId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const drugsResponse = await fetch('/api/drugs');
        if (drugsResponse.ok) {
          const drugsData = await drugsResponse.json();
          setDrugData(drugsData);
        }

        const patientsResponse = await fetch('/api/patients?activeOnly=true');
        if (patientsResponse.ok) {
          const patientsData = await patientsResponse.json();
          setPatients(patientsData.map((p: any) => ({
            id: p.id,
            name: p.name,
            mrNumber: p.mrNumber,
            phone: p.phone
          })));
        }

        const transactionsResponse = await fetch('/api/drug-transactions');
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          setTransactions(transactionsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveDrug = async (drug: Omit<DrugData, 'id'> | DrugData) => {
    try {
      if (editingDrug && 'id' in drug) {
        const response = await fetch(`/api/drugs/${drug.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(drug),
        });

        if (response.ok) {
          const updatedDrug = await response.json();
          setDrugData(prev => prev.map(d => d.id === updatedDrug.id ? updatedDrug : d));
          alert('Data obat berhasil diupdate!');
        } else {
          const error = await response.json();
          alert(`Gagal update data obat: ${error.error}`);
        }
      } else {
        const response = await fetch('/api/drugs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(drug),
        });

        if (response.ok) {
          const newDrug = await response.json();
          setDrugData(prev => [...prev, newDrug]);
          alert('Data obat berhasil ditambahkan!');
        } else {
          const error = await response.json();
          alert(`Gagal menambahkan data obat: ${error.error}`);
        }
      }

      setEditingDrug(null);
      setShowDrugForm(false);
      setDrugViewMode('create');
    } catch (error) {
      console.error('Error saving drug:', error);
      alert('Terjadi kesalahan saat menyimpan data obat');
    }
  };

  const handleDeleteDrug = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data obat ini?')) {
      try {
        const response = await fetch(`/api/drugs/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setDrugData(prev => prev.filter(drug => drug.id !== id));
          alert('Data obat berhasil dihapus!');
        } else {
          const error = await response.json();
          alert(`Gagal menghapus data obat: ${error.error}`);
        }
      } catch (error) {
        console.error('Error deleting drug:', error);
        alert('Terjadi kesalahan saat menghapus data obat');
      }
    }
  };

  const handleViewDrugDetail = (drug: DrugData) => {
    setEditingDrug(drug);
    setDrugViewMode('detail');
    setShowDrugForm(true);
  };

  const handleEditDrug = (drug: DrugData) => {
    setEditingDrug(drug);
    setDrugViewMode('edit');
    setShowDrugForm(true);
  };

  const handleNewDrug = () => {
    setEditingDrug(null);
    setDrugViewMode('create');
    setShowDrugForm(true);
  };

  const handleViewDetail = async (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setViewMode('detail');
    setPrescriptionSource(undefined);
    setShowTransactionForm(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setViewMode('edit');
    setPrescriptionSource(undefined);
    setShowTransactionForm(true);
  };

  const handleNewTransaction = () => {

    const isDoctorPrescription = confirm(
      'Apakah ini resep dari dokter?\n\nOK = Ya (dari dokter)\nCancel = Tidak (manual/rujukan)'
    );

    setPrescriptionSource(isDoctorPrescription ? 'DOCTOR_PRESCRIPTION' : 'MANUAL');
    setRelatedHandledPatientId(undefined);
    setEditingTransaction(null);
    setViewMode('create');
    setShowTransactionForm(true);
  };

  const handleSaveTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      if (editingTransaction && viewMode === 'edit') {
        const response = await fetch(`/api/drug-transactions/${editingTransaction.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transaction),
        });

        if (response.ok) {
          const updatedTransaction = await response.json();
          setTransactions(prev => prev.map(t =>
            t.id === updatedTransaction.id ? updatedTransaction : t
          ));

          const fetchDrugs = await fetch('/api/drugs');
          if (fetchDrugs.ok) {
            const drugsData = await fetchDrugs.json();
            setDrugData(drugsData);
          }

          alert('Transaksi berhasil diupdate!');
        } else {
          const error = await response.json();
          alert(`Gagal update transaksi: ${error.error}`);
        }
      } else {
        const response = await fetch('/api/drug-transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transaction),
        });

        if (response.ok) {
          const newTransaction = await response.json();
          setTransactions(prev => [newTransaction, ...prev]);

          const fetchDrugs = await fetch('/api/drugs');
          if (fetchDrugs.ok) {
            const drugsData = await fetchDrugs.json();
            setDrugData(drugsData);
          }

          alert('Transaksi berhasil dibuat dan stok obat telah dikurangi!');
        } else {
          const error = await response.json();
          alert(`Gagal membuat transaksi: ${error.error}`);
        }
      }

      setShowTransactionForm(false);
      setEditingTransaction(null);
      setViewMode('create');
      setPrescriptionSource(undefined);
      setRelatedHandledPatientId(undefined);
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Terjadi kesalahan saat menyimpan transaksi');
    }
  };

  const handleCancelTransaction = async (transactionId: string) => {
    if (confirm('Apakah Anda yakin ingin membatalkan transaksi ini? Stok obat akan dikembalikan.')) {
      try {
        const response = await fetch(`/api/drug-transactions/${transactionId}/cancel`, {
          method: 'PUT',
        });

        if (response.ok) {
          const updatedTransaction = await response.json();
          setTransactions(prev => prev.map(t =>
            t.id === transactionId ? updatedTransaction : t
          ));

          const fetchDrugs = await fetch('/api/drugs');
          if (fetchDrugs.ok) {
            const drugsData = await fetchDrugs.json();
            setDrugData(drugsData);
          }

          alert('Transaksi berhasil dibatalkan dan stok dikembalikan!');
        } else {
          const error = await response.json();
          alert(`Gagal membatalkan transaksi: ${error.error}`);
        }
      } catch (error) {
        console.error('Error cancelling transaction:', error);
        alert('Terjadi kesalahan saat membatalkan transaksi');
      }
    }
  };

  const filteredDrugs = drugData.filter(drug => {
    const searchLower = searchTerm.toLowerCase();
    return drug.name.toLowerCase().includes(searchLower) ||
      drug.category.toLowerCase().includes(searchLower) ||
      drug.manufacturer.toLowerCase().includes(searchLower);
  });

  const filteredTransactions = transactions.filter(transaction => {
    const searchLower = searchTerm.toLowerCase();
    return transaction.patientName.toLowerCase().includes(searchLower) ||
      transaction.mrNumber.toLowerCase().includes(searchLower) ||
      transaction.id.toLowerCase().includes(searchLower);
  });

  const totalDrugs = drugData.length;
  const lowStockDrugs = drugData.filter(drug => drug.stock < 50).length;
  const totalTransactions = transactions.length;
  const completedTransactions = transactions.filter(t => t.status === 'COMPLETED').length;
  const cancelledTransactions = transactions.filter(t => t.status === 'CANCELLED').length;

  const navigationItems = [
    { key: 'overview', label: 'Overview', icon: Activity },
    { key: 'drugs', label: 'Kelola Data Obat', icon: Pill },
    { key: 'transactions', label: 'Kelola Transaksi Obat', icon: ShoppingCart }
  ];

  const handleTabChange = (tab: 'overview' | 'drugs' | 'transactions') => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
  };

  const refreshData = async () => {
    setShowRefreshSplash(true);
    try {
      const drugsResponse = await fetch('/api/drugs');
      if (drugsResponse.ok) {
        const drugsData = await drugsResponse.json();
        setDrugData(drugsData);
      }

      const patientsResponse = await fetch('/api/patients?activeOnly=true');
      if (patientsResponse.ok) {
        const patientsData = await patientsResponse.json();
        setPatients(patientsData.map((p: any) => ({
          id: p.id,
          name: p.name,
          mrNumber: p.mrNumber,
          phone: p.phone
        })));
      }

      const transactionsResponse = await fetch('/api/drug-transactions');
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };
  const handleRefreshSplashFinish = () => {
    setShowRefreshSplash(false);
    setIsRefreshing(false);
  };

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
  //         <p className="text-gray-600">Memuat data...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-m font-semibold text-gray-900">Menu Farmasi</h2>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navigationItems.map(item => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => handleTabChange(item.key as any)}
                className={`flex items-center space-x-3 w-full p-3 rounded-lg font-medium text-sm transition-colors ${activeTab === item.key
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <IconComponent className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm border border-gray-200"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={() => {
              setIsRefreshing(true);
              refreshData();
            }}
            disabled={isRefreshing}
            className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm border border-emerald-500 text-sm text-gray-600 hover:bg-emerald-300 transition-colors disabled:opacity-50"
          >
            {isRefreshing ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full mr-2"></div>
                <span>Refreshing...</span>
              </>
            ) : (
              <>
                <Activity className="h-4 w-4 mr-2 text-emerald-600" />
                <span>Refresh</span>
              </>
            )}
          </button>
        </div>

        <div className="hidden lg:flex items-center justify-end mb-6">
          <button
            onClick={() => {
              setIsRefreshing(true);
              refreshData();
            }}
            disabled={isRefreshing}
            className="flex items-center bg-white px-3 md:px-4 py-2 rounded-lg shadow-sm border border-emerald-500 text-xs md:text-sm text-gray-600 hover:bg-emerald-300 transition-colors disabled:opacity-50"
          >
            {isRefreshing ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full mr-2"></div>
                <span>Refreshing...</span>
              </>
            ) : (
              <>
                <Activity className="h-4 w-4 mr-2 text-emerald-600" />
                <span>Refresh Data</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm mb-6 hidden lg:block">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-55 px-6 justify-center">
                {navigationItems.map(tab => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.key
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300'
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

          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-sm border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Obat</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{totalDrugs}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Package className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white to-red-50 p-6 rounded-xl shadow-sm border border-red-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Stok Rendah</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{lowStockDrugs}</p>
                    </div>
                    <div className="bg-red-100 p-3 rounded-full">
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white to-green-50 p-6 rounded-xl shadow-sm border border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Transaksi Selesai</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{completedTransactions}</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Obat Stok Rendah</h3>
                  </div>
                  <div className="p-6">
                    {drugData.filter(drug => drug.stock < 50).slice(0, 5).map(drug => (
                      <div key={drug.id} className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-medium text-gray-900">{drug.name}</p>
                          <p className="text-sm text-gray-600">{drug.category}</p>
                        </div>
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                          {drug.stock} unit
                        </span>
                      </div>
                    ))}
                    {drugData.filter(drug => drug.stock < 50).length === 0 && (
                      <p className="text-center text-gray-500 py-4">Semua stok obat mencukupi</p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Transaksi Terbaru</h3>
                  </div>
                  <div className="p-6">
                    {transactions.slice(0, 5).map(transaction => (
                      <div key={transaction.id} className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-medium text-gray-900">{transaction.patientName}</p>
                          <p className="text-sm text-gray-600">{transaction.mrNumber}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {transactions.length === 0 && (
                      <p className="text-center text-gray-500 py-4">Belum ada transaksi</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'drugs' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">Manajemen Data Obat</h3>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Cari Obat..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full md:w-64 text-gray-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>

                    <button
                      onClick={handleNewDrug}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Obat
                    </button>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Obat</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kat. Kehamilan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kadaluwarsa</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDrugs.map((drug) => (
                      <tr key={drug.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{drug.name}</p>
                            <p className="text-sm text-gray-500">{drug.strength}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{drug.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{drug.categoryKehamilan}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${drug.stock < 10 ? 'bg-red-100 text-red-800' :
                            drug.stock < 50 ? 'bg-orange-100 text-orange-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                            {drug.stock} unit
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(drug.expiryDate).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button
                            onClick={() => handleViewDrugDetail(drug)}
                            className="text-gray-600 hover:text-gray-900 font-medium inline-flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Detail</span>
                          </button>
                          <button
                            onClick={() => handleEditDrug(drug)}
                            className="text-blue-600 hover:text-blue-900 font-medium inline-flex items-center space-x-1"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteDrug(drug.id)}
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

              <div className="lg:hidden space-y-4 p-4">
                {filteredDrugs.map((drug) => (
                  <div key={drug.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg">{drug.name}</h4>
                        <p className="text-sm text-gray-600">{drug.strength} - {drug.category}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${drug.stock < 10 ? 'bg-red-100 text-red-800' :
                        drug.stock < 50 ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                        {drug.stock} unit
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">

                      <div>
                        <span className="text-gray-600">Exp: {new Date(drug.expiryDate).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">{drug.manufacturer}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleViewDrugDetail(drug)}
                        className="bg-gray-100 text-gray-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Detail</span>
                      </button>
                      <button
                        onClick={() => handleEditDrug(drug)}
                        className="bg-blue-100 text-blue-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteDrug(drug.id)}
                        className="col-span-2 bg-red-100 text-red-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-red-200 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredDrugs.length === 0 && (
                <div className="text-center py-12 px-4">
                  <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchTerm ? "Tidak ada obat yang ditemukan" : "Belum ada data obat"}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-4">
                    {searchTerm
                      ? "Coba gunakan kata kunci yang berbeda untuk pencarian."
                      : "Klik tombol 'Tambah Obat' untuk menambahkan data obat pertama."
                    }
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={handleNewDrug}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Tambah Obat Pertama</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">Manajemen Transaksi Obat</h3>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Cari Transaksi..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full md:w-64 text-gray-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>

                    <button
                      onClick={handleNewTransaction}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      Transaksi Baru
                    </button>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pasien</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          #{transaction.id.slice(-8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{transaction.patientName}</p>
                            <p className="text-sm text-gray-500">{transaction.mrNumber}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {transaction.items.length} obat
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.items.reduce((sum, item) => sum + item.quantity, 0)} unit
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{new Date(transaction.createdAt).toLocaleDateString('id-ID')}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(transaction.createdAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button
                            onClick={() => handleViewDetail(transaction)}
                            className="text-gray-600 hover:text-gray-900 font-medium inline-flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Detail</span>
                          </button>
                          {transaction.status === 'COMPLETED' && (
                            <>
                              <button
                                onClick={() => handleEditTransaction(transaction)}
                                className="text-blue-600 hover:text-blue-900 font-medium inline-flex items-center space-x-1"
                              >
                                <Edit className="h-4 w-4" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleCancelTransaction(transaction.id)}
                                className="text-red-600 hover:text-red-900 font-medium inline-flex items-center space-x-1"
                              >
                                <XCircle className="h-4 w-4" />
                                <span>Batalkan</span>
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="lg:hidden space-y-4 p-4">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg">{transaction.patientName}</h4>
                        <p className="text-sm text-gray-600">RM: {transaction.mrNumber}</p>
                        <p className="text-sm font-mono text-gray-500">#{transaction.id.slice(-8)}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                        {transaction.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-600">
                          Items: {transaction.items.length} obat ({transaction.items.reduce((sum, item) => sum + item.quantity, 0)} unit)
                        </span>
                      </div>

                      <div className="col-span-2">
                        <span className="text-gray-600">
                          Tanggal: {new Date(transaction.createdAt).toLocaleDateString('id-ID')} {new Date(transaction.createdAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleViewDetail(transaction)}
                        className="bg-gray-100 text-gray-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Detail</span>
                      </button>
                      {transaction.status === 'COMPLETED' && (
                        <>
                          <button
                            onClick={() => handleEditTransaction(transaction)}
                            className="bg-blue-100 text-blue-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors flex items-center justify-center space-x-1"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleCancelTransaction(transaction.id)}
                            className="col-span-2 bg-red-100 text-red-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-red-200 transition-colors flex items-center justify-center space-x-1"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Batalkan</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {filteredTransactions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{searchTerm ? 'Tidak ada transaksi yang ditemukan' : 'Belum ada transaksi'}</p>
                  </div>
                )}
              </div>

              {filteredTransactions.length === 0 && (
                <div className="text-center py-12 px-4">
                  <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchTerm ? "Tidak ada transaksi yang ditemukan" : "Belum ada transaksi"}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-4">
                    {searchTerm
                      ? "Coba gunakan kata kunci yang berbeda untuk pencarian."
                      : "Klik tombol 'Transaksi Baru' untuk membuat transaksi obat pertama."
                    }
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={handleNewTransaction}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Buat Transaksi Pertama</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <DataObatForm
        isOpen={showDrugForm}
        onClose={() => {
          setShowDrugForm(false);
          setEditingDrug(null);
          setDrugViewMode('create');
        }}
        onSave={handleSaveDrug}
        editingDrug={editingDrug}
        viewMode={drugViewMode}
      />

      <TransaksiObatForm
        isOpen={showTransactionForm}
        onClose={() => {
          setShowTransactionForm(false);
          setEditingTransaction(null);
          setViewMode('create');
          setPrescriptionSource(undefined);
          setRelatedHandledPatientId(undefined);
        }}
        onSave={handleSaveTransaction}
        patients={patients}
        drugs={drugData}
        editingTransaction={editingTransaction}
        viewMode={viewMode}
        prescriptionSource={prescriptionSource}
        relatedHandledPatientId={relatedHandledPatientId}
      />

      {showRefreshSplash && (
        <SplashScreen
          onFinish={handleRefreshSplashFinish}
          message="Memuat ulang data..."
          duration={1500}
        />
      )}
    </div>
  );
};

export default PharmacyDashboard;