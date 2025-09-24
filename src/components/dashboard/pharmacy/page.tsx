import React, { useState, useEffect } from 'react';
import { Search, Plus, Pill, Users, FileText, Activity, Edit, Trash2, Eye, Menu, ShoppingCart, Package, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import DataObatForm, { DrugData } from './DataObatForm';
import TransaksiObatForm from './TransaksiObatForm';

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
  totalAmount: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

interface TransactionItem {
  drugId: string;
  drugName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

const PharmacyDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'drugs' | 'transactions'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDrugForm, setShowDrugForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingDrug, setEditingDrug] = useState<DrugData | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [drugData, setDrugData] = useState<DrugData[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch drugs
        const drugsResponse = await fetch('/api/drugs');
        if (drugsResponse.ok) {
          const drugsData = await drugsResponse.json();
          setDrugData(drugsData);
        }

        // Fetch patients
        const patientsResponse = await fetch('/api/patients');
        if (patientsResponse.ok) {
          const patientsData = await patientsResponse.json();
          setPatients(patientsData.map((p: any) => ({
            id: p.id,
            name: p.name,
            mrNumber: p.mrNumber,
            phone: p.phone
          })));
        }

        // Fetch transactions
        const transactionsResponse = await fetch('/api/transactions');
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
        // Update existing drug
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
        }
      } else {
        // Create new drug
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
        }
      }
      
      setEditingDrug(null);
      setShowDrugForm(false);
    } catch (error) {
      console.error('Error saving drug:', error);
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
        }
      } catch (error) {
        console.error('Error deleting drug:', error);
      }
    }
  };

  const handleSaveTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
      });
      
      if (response.ok) {
        const newTransaction = await response.json();
        setTransactions(prev => [...prev, newTransaction]);
        
        // Update drug stock
        transaction.items.forEach(item => {
          setDrugData(prev => prev.map(drug => 
            drug.id === item.drugId 
              ? { ...drug, stock: drug.stock - item.quantity }
              : drug
          ));
        });
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleCompleteTransaction = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/transactions/${transactionId}/complete`, {
        method: 'PUT',
      });
      
      if (response.ok) {
        const updatedTransaction = await response.json();
        setTransactions(prev => prev.map(t => 
          t.id === transactionId ? updatedTransaction : t
        ));
      }
    } catch (error) {
      console.error('Error completing transaction:', error);
    }
  };

  const handleCancelTransaction = async (transactionId: string) => {
    if (confirm('Apakah Anda yakin ingin membatalkan transaksi ini?')) {
      try {
        const transaction = transactions.find(t => t.id === transactionId);
        if (!transaction) return;

        const response = await fetch(`/api/transactions/${transactionId}/cancel`, {
          method: 'PUT',
        });
        
        if (response.ok) {
          // Restore stock if transaction was pending
          if (transaction.status === 'PENDING') {
            transaction.items.forEach(item => {
              setDrugData(prev => prev.map(drug => 
                drug.id === item.drugId 
                  ? { ...drug, stock: drug.stock + item.quantity }
                  : drug
              ));
            });
          }
          
          setTransactions(prev => prev.map(t => 
            t.id === transactionId ? { ...t, status: 'CANCELLED' } : t
          ));
        }
      } catch (error) {
        console.error('Error cancelling transaction:', error);
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

  // Statistics
  const totalDrugs = drugData.length;
  const lowStockDrugs = drugData.filter(drug => drug.stock < 50).length;
  const totalTransactions = transactions.length;
  const pendingTransactions = transactions.filter(t => t.status === 'PENDING').length;
  const completedTransactions = transactions.filter(t => t.status === 'COMPLETED').length;
  const totalRevenue = transactions
    .filter(t => t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const navigationItems = [
    { key: 'overview', label: 'Overview', icon: Activity },
    { key: 'drugs', label: 'Kelola Data Obat', icon: Pill },
    { key: 'transactions', label: 'Kelola Transaksi Obat', icon: ShoppingCart }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu Farmasi</h2>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <XCircle className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navigationItems.map(item => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key as any);
                  setIsMobileSidebarOpen(false);
                }}
                className={`flex items-center space-x-3 w-full p-3 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === item.key
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
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
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6 hidden lg:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6 justify-center">
              {navigationItems.map(tab => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'border-emerald-500 text-emerald-600'
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Obat</p>
                    <p className="text-2xl font-bold text-gray-900">{totalDrugs}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Stok Rendah</p>
                    <p className="text-2xl font-bold text-red-600">{lowStockDrugs}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Transaksi Pending</p>
                    <p className="text-2xl font-bold text-orange-600">{pendingTransactions}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Transaksi Selesai</p>
                    <p className="text-2xl font-bold text-green-600">{completedTransactions}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
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
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Transaksi Terbaru</h3>
                </div>
                <div className="p-6">
                  {transactions.slice(-5).reverse().map(transaction => (
                    <div key={transaction.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-gray-900">{transaction.patientName}</p>
                        <p className="text-sm text-gray-600">{transaction.mrNumber}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Drugs Tab */}
        {activeTab === 'drugs' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-gray-900">Manajemen Data Obat</h3>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <div className="flex-1 sm:flex-none sm:w-80 relative">
                    <input
                      type="text"
                      placeholder="Cari obat..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-full text-gray-700"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>

                  <button
                    onClick={() => setShowDrugForm(true)}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tambah Obat</span>
                  </button>
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Obat</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kekuatan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kedaluwarsa</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDrugs.map((drug) => (
                      <tr key={drug.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{drug.name}</p>
                            <p className="text-sm text-gray-500">{drug.dosageForm} - {drug.manufacturer}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{drug.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{drug.strength}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${drug.stock < 50 ? 'text-red-600' : 'text-green-600'}`}>
                            {drug.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(drug.expiryDate).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button
                            onClick={() => {
                              setEditingDrug(drug);
                              setShowDrugForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDrug(drug.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4 p-4">
                {filteredDrugs.map((drug) => (
                  <div key={drug.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg mb-1">{drug.name}</h4>
                        <p className="text-sm text-gray-600 mb-1">{drug.dosageForm} - {drug.manufacturer}</p>
                        <p className="text-sm text-gray-600">Kategori: {drug.category}</p>
                      </div>
                      <div className="text-right ml-3">
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          {drug.strength}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Stok:</span>
                        <span className={`text-sm font-semibold ${drug.stock < 50 ? 'text-red-600' : 'text-green-600'}`}>
                          {drug.stock} unit
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Kedaluwarsa:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(drug.expiryDate).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setEditingDrug(drug);
                          setShowDrugForm(true);
                        }}
                        className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteDrug(drug.id)}
                        className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-red-200 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {filteredDrugs.length === 0 && (
                <div className="text-center py-12 px-4">
                  <Pill className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchTerm ? "Tidak ada obat yang ditemukan" : "Belum ada data obat"}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-4">
                    {searchTerm
                      ? "Coba gunakan kata kunci yang berbeda untuk pencarian."
                      : "Klik tombol 'Tambah Obat' untuk menambah data obat baru."
                    }
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => setShowDrugForm(true)}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors inline-flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Tambah Obat Pertama</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-gray-900">Kelola Transaksi Obat</h3>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <div className="flex-1 sm:flex-none sm:w-80 relative">
                    <input
                      type="text"
                      placeholder="Cari transaksi..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-full text-gray-700"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>

                  <button
                    onClick={() => setShowTransactionForm(true)}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Transaksi Baru</span>
                  </button>
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Transaksi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pasien</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          Rp {transaction.totalAmount.toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status === 'COMPLETED' ? 'Selesai' :
                             transaction.status === 'PENDING' ? 'Pending' : 'Dibatalkan'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(transaction.createdAt).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {transaction.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleCompleteTransaction(transaction.id)}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="Selesaikan"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleCancelTransaction(transaction.id)}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Batalkan"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4 p-4">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg mb-1">
                          {transaction.patientName}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">{transaction.mrNumber}</p>
                        <p className="text-sm font-mono text-gray-500">#{transaction.id.slice(-8)}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status === 'COMPLETED' ? 'Selesai' :
                         transaction.status === 'PENDING' ? 'Pending' : 'Dibatalkan'}
                      </span>
                    </div>

                    <div className="mb-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Total:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          Rp {transaction.totalAmount.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Tanggal:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(transaction.createdAt).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Items:</span>
                        <span className="text-sm text-gray-900">{transaction.items.length} obat</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>Detail</span>
                      </button>
                      {transaction.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleCompleteTransaction(transaction.id)}
                            className="flex-1 bg-green-100 text-green-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-green-200 transition-colors flex items-center justify-center space-x-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Selesai</span>
                          </button>
                          <button
                            onClick={() => handleCancelTransaction(transaction.id)}
                            className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-red-200 transition-colors flex items-center justify-center space-x-1"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Batal</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {filteredTransactions.length === 0 && (
                <div className="text-center py-12 px-4">
                  <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchTerm ? "Tidak ada transaksi yang ditemukan" : "Belum ada transaksi"}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-4">
                    {searchTerm
                      ? "Coba gunakan kata kunci yang berbeda untuk pencarian."
                      : "Klik tombol 'Transaksi Baru' untuk membuat transaksi obat."
                    }
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => setShowTransactionForm(true)}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors inline-flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Buat Transaksi Pertama</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Drug Form */}
      <DataObatForm
        isOpen={showDrugForm}
        onClose={() => {
          setShowDrugForm(false);
          setEditingDrug(null);
        }}
        onSave={handleSaveDrug}
        editingDrug={editingDrug}
      />

      {/* Transaction Form */}
      <TransaksiObatForm
        isOpen={showTransactionForm}
        onClose={() => {
          setShowTransactionForm(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        patients={patients}
        drugs={drugData}
        editingTransaction={editingTransaction}
      />
    </div>
  );
};

export default PharmacyDashboard;