'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Bell, AlertCircle, X, Check, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Alert {
  id: string;
  type: 'INFO';
  message: string;
  patientId?: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isRead: boolean;
  createdAt: string;
  patient?: {
    name: string;
    mrNumber: string;
  };
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'UNREAD' | 'INFO'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    if (session?.user?.role) {
      fetchAlerts();
    }
  }, [session]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const userRole = session?.user?.role || 'SUPER_ADMIN';
      const params = new URLSearchParams({
        role: userRole,
        unreadOnly: 'false'
      });

      const response = await fetch(`/api/alerts?${params.toString()}`);
      if (response.ok) {
        const data = await response.json() as Alert[];
        const uniqueData = Array.from(new Map(data.map((item: Alert) => [item.id, item])).values());
        setAlerts(uniqueData);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAlertAsRead = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });

      if (response.ok) {
        setAlerts(alerts.map(a => a.id === alertId ? { ...a, isRead: true } : a));
      }
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadAlerts = alerts.filter(a => !a.isRead);
      await Promise.all(
        unreadAlerts.map(alert =>
          fetch(`/api/alerts/${alert.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isRead: true }),
          })
        )
      );
      setAlerts(alerts.map(a => ({ ...a, isRead: true })));
    } catch (error) {
      console.error('Error marking all alerts as read:', error);
    }
  };

  const deleteAlert = async (alertId: string) => {
    if (!confirm('Hapus notifikasi ini?')) return;
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setAlerts(alerts.filter(a => a.id !== alertId));
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.patient?.mrNumber.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'ALL') return matchesSearch;
    if (filterType === 'UNREAD') return !alert.isRead && matchesSearch;
    return alert.type === filterType && matchesSearch;
  });

  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAlerts = filteredAlerts.slice(startIndex, startIndex + itemsPerPage);
  const unreadCount = alerts.filter(a => !a.isRead).length;

  const getAlertColor = (type: string) => {
    switch (type) {
      default: return 'bg-blue-100 border-blue-200 text-blue-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-700';
      case 'HIGH': return 'bg-orange-100 text-orange-700';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, itemsPerPage]);

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Bell className="h-6 w-6 sm:h-7 sm:w-7 text-green-600" />
                  Notifikasi
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua notifikasi sudah dibaca'}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => router.back()}
                  className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Kembali
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Check className="h-4 w-4" />
                    Tandai Semua Dibaca
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari notifikasi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700 text-sm"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                {[
                  { key: 'ALL', label: 'Semua', color: 'green' },
                  { key: 'UNREAD', label: 'Belum Dibaca', color: 'green' },
                  { key: 'INFO', label: 'Info', color: 'blue' }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setFilterType(filter.key as any)}
                    className={`px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap transition-colors text-sm ${
                      filterType === filter.key
                        ? `bg-${filter.color}-600 text-white`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-3 text-gray-600 text-sm">Memuat notifikasi...</span>
              </div>
            ) : paginatedAlerts.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 text-sm">
                  {searchTerm || filterType !== 'ALL' ? 'Tidak ada notifikasi yang cocok' : 'Belum ada notifikasi'}
                </p>
              </div>
            ) : (
              paginatedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${!alert.isRead ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`p-2 rounded-lg ${getAlertColor(alert.type)} flex-shrink-0`}>
                      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getAlertColor(alert.type)}`}>
                          {alert.type}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                          {alert.priority}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          {alert.category.replace(/_/g, ' ')}
                        </span>
                        {!alert.isRead && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                            Belum Dibaca
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-900 mb-2 whitespace-pre-wrap">
                        {alert.message}
                      </p>

                      {alert.patient && (
                        <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-2">
                          <p className="text-xs font-medium text-gray-700 mb-1">Informasi Pasien:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Nama:</span>
                              <span className="ml-2 font-medium text-gray-900">{alert.patient.name}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">No. RM:</span>
                              <span className="ml-2 font-medium text-gray-900">{alert.patient.mrNumber}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-gray-500">
                        {new Date(alert.createdAt).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {!alert.isRead && (
                        <button
                          onClick={() => markAlertAsRead(alert.id)}
                          className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          title="Tandai Dibaca"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-700">Tampilkan</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-3 py-1 border border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-700"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-gray-700">dari {filteredAlerts.length}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <div className="flex gap-1">
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' && setCurrentPage(page)}
                      disabled={page === '...'}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        page === currentPage
                          ? 'bg-green-600 text-white'
                          : page === '...'
                          ? 'cursor-default text-gray-400'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}