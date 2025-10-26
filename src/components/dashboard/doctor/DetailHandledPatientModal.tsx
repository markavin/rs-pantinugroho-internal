import React, { useState } from 'react';
import { X, ClipboardList, ChevronDown, ChevronUp, Calendar, User, AlertCircle } from 'lucide-react';

interface Patient {
  id: string;
  mrNumber: string;
  name: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE';
}

interface HandledPatient {
  id: string;
  patientId: string;
  handledBy: string;
  handledDate: string;
  diagnosis?: string;
  treatmentPlan?: string;
  notes?: string;
  status: 'ANTRIAN' | 'SEDANG_DITANGANI' | 'KONSULTASI' | 'OBSERVASI' | 'EMERGENCY' | 'STABIL' | 'RUJUK_KELUAR' | 'SELESAI' | 'MENINGGAL';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  nextVisitDate?: string;
  estimatedDuration?: string;
  specialInstructions?: string;
  patient?: Patient;
  handler: {
    name: string;
    role: string;
    employeeId?: string;
  };
}

interface DetailHandledPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string | null;
  patientName?: string;
  patientMRNumber?: string;
  handledHistory: HandledPatient[];
  loading?: boolean;
}

type TimeRangeType = '7d' | '30d' | '3m' | '6m' | 'all';

const DetailHandledPatientModal: React.FC<DetailHandledPatientModalProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  patientMRNumber,
  handledHistory,
  loading = false
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [timeRange, setTimeRange] = useState<TimeRangeType>('all');
  const [expandedDates, setExpandedDates] = useState<{ [key: string]: boolean }>({});

  if (!isOpen || !patientId) return null;

  // Helper functions
  const getHandledStatusColor = (status: string) => {
    switch (status) {
      case 'ANTRIAN': return 'bg-yellow-100 text-yellow-800';
      case 'SEDANG_DITANGANI': return 'bg-blue-100 text-blue-800';
      case 'KONSULTASI': return 'bg-indigo-100 text-indigo-800';
      case 'OBSERVASI': return 'bg-orange-100 text-orange-800';
      case 'EMERGENCY': return 'bg-red-100 text-red-800';
      case 'STABIL': return 'bg-green-100 text-green-800';
      case 'RUJUK_KELUAR': return 'bg-purple-100 text-purple-800';
      case 'SELESAI': return 'bg-gray-100 text-gray-800';
      case 'MENINGGAL': return 'bg-black text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHandledStatusLabel = (status: string) => {
    switch (status) {
      case 'ANTRIAN': return 'Antrian';
      case 'SEDANG_DITANGANI': return 'Sedang Ditangani';
      case 'KONSULTASI': return 'Konsultasi';
      case 'OBSERVASI': return 'Observasi';
      case 'EMERGENCY': return 'Emergency';
      case 'STABIL': return 'Stabil';
      case 'RUJUK_KELUAR': return 'Rujuk Keluar';
      case 'SELESAI': return 'Selesai';
      case 'MENINGGAL': return 'Meninggal';
      default: return status || 'Sedang Ditangani';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'NORMAL': return 'bg-green-100 text-green-800';
      case 'LOW': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter by time range
  const getFilteredByTimeRange = (data: HandledPatient[]) => {
    if (timeRange === 'all') return data;

    const now = new Date();
    const ranges = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '3m': 90 * 24 * 60 * 60 * 1000,
      '6m': 180 * 24 * 60 * 60 * 1000,
      'all': Infinity
    };

    const rangeMs = ranges[timeRange];

    return data.filter(handled => {
      const handledDate = new Date(handled.handledDate);
      return (now.getTime() - handledDate.getTime()) <= rangeMs;
    });
  };

  // Filter by date
  const getFilteredHistory = () => {
    let filtered = handledHistory;

    // Filter by specific date
    if (selectedDate) {
      filtered = filtered.filter(h => {
        const handledDate = new Date(h.handledDate).toISOString().split('T')[0];
        return handledDate === selectedDate;
      });
    }

    // Filter by time range
    filtered = getFilteredByTimeRange(filtered);

    return filtered;
  };

  const filteredHistory = getFilteredHistory();

  // Group by date
  const groupHistoryByDate = () => {
    const groups: { [key: string]: HandledPatient[] } = {};

    filteredHistory.forEach(handled => {
      const dateKey = new Date(handled.handledDate).toISOString().split('T')[0];
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(handled);
    });

    // Sort within each day by time
    Object.keys(groups).forEach(dateKey => {
      groups[dateKey].sort((a, b) =>
        new Date(a.handledDate).getTime() - new Date(b.handledDate).getTime()
      );
    });

    return groups;
  };

  const historyByDate = groupHistoryByDate();

  // Toggle date expansion
  const toggleDateExpansion = (dateKey: string) => {
    setExpandedDates(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey]
    }));
  };

  // Render daily group
  const renderDailyGroup = (dateKey: string, records: HandledPatient[]) => {
    const isExpanded = expandedDates[dateKey];
    const dateObj = new Date(dateKey);

    return (
      <div key={dateKey} className="bg-white rounded-lg border border-green-200 overflow-hidden">
        {/* Date Header */}
        <button
          onClick={() => toggleDateExpansion(dateKey)}
          className="w-full px-6 py-4 bg-gradient-to-r from-green-50 to-indigo-50 border-b border-green-200 flex items-center justify-between hover:from-green-100 hover:to-indigo-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-green-600" />
            <div className="text-left">
              <h3 className="text-base font-bold text-gray-900">
                {dateObj.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </h3>
              <p className="text-sm text-gray-600">
                {records.length} kali ditangani
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-600" />
          )}
        </button>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Waktu</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Status</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Prioritas</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Ditangani Oleh</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Diagnosis</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Rencana Pengobatan</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Instruksi Khusus</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {records.map((handled, idx) => (
                    <tr key={idx} className="hover:bg-green-50">
                      <td className="px-3 py-3 text-xs text-gray-900 font-medium whitespace-nowrap">
                        {new Date(handled.handledDate).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getHandledStatusColor(handled.status)}`}>
                          {getHandledStatusLabel(handled.status)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(handled.priority)}`}>
                          {handled.priority}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-900">
                        <div>
                          <p className="font-semibold">{handled.handler?.name || 'Unknown'}</p>
                          <p className="text-gray-600 text-[10px]">{handled.handler?.role || 'Unknown'}</p>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-900">
                        {handled.diagnosis ? (
                          <div className="max-w-xs">
                            <p className="line-clamp-2">{handled.diagnosis}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-900">
                        {handled.treatmentPlan ? (
                          <div className="max-w-xs">
                            <p className="line-clamp-3">{handled.treatmentPlan}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-900">
                        {handled.specialInstructions ? (
                          <div className="max-w-xs">
                            <p className="line-clamp-3 whitespace-pre-line">{handled.specialInstructions}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-900">
                        {handled.notes ? (
                          <div className="max-w-xs">
                            <p className="line-clamp-2">{handled.notes}</p>
                            {handled.notes.toLowerCase().includes('pulang paksa') && (
                              <span className="inline-flex items-center gap-1 mt-1 text-red-600 font-medium">
                                <AlertCircle className="h-3 w-3" />
                                Pulang Paksa
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Additional Info - Next Visit if exists */}
            {records.some(h => h.nextVisitDate) && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Kunjungan Berikutnya
                </h5>
                <div className="space-y-2">
                  {records.filter(h => h.nextVisitDate).map((handled, idx) => (
                    <div key={idx} className="text-sm text-blue-800">
                      <span className="font-medium">
                        {new Date(handled.handledDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}:
                      </span>
                      {' '}
                      {new Date(handled.nextVisitDate!).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                      {handled.estimatedDuration && ` (${handled.estimatedDuration})`}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ClipboardList className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">Riwayat Penanganan Pasien</h3>
                {patientName && patientMRNumber && (
                  <p className="text-sm text-gray-600">{patientName} - {patientMRNumber}</p>
                )}
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Filter Tanggal */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Filter Tanggal:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
              />
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate('')}
                  className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Info Total */}
            <div className="text-sm text-gray-600">
              Total: <span className="font-semibold text-green-600">{filteredHistory.length}</span> penanganan
              {Object.keys(historyByDate).length > 0 && (
                <> di <span className="font-semibold text-green-600">{Object.keys(historyByDate).length}</span> hari</>
              )}
            </div>
          </div>

          {/* Filter Rentang Waktu */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Rentang Waktu:</span>
            {[
              { key: '7d', label: '7 Hari' },
              { key: '30d', label: '30 Hari' },
              { key: '3m', label: '3 Bulan' },
              { key: '6m', label: '6 Bulan' },
              { key: 'all', label: 'Semua' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTimeRange(key as TimeRangeType)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  timeRange === key
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-green-50 border border-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat riwayat penanganan...</p>
            </div>
          ) : filteredHistory.length > 0 ? (
            <div className="space-y-4">
              {Object.keys(historyByDate)
                .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
                .map(dateKey => renderDailyGroup(dateKey, historyByDate[dateKey]))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <ClipboardList className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="font-medium text-lg mb-2">Tidak ada riwayat penanganan</p>
              <p className="text-sm">
                {selectedDate
                  ? 'Tidak ada penanganan pada rentang waktu yang dipilih'
                  : 'Pasien belum pernah ditangani'}
              </p>
              {(selectedDate || timeRange !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedDate('');
                    setTimeRange('all');
                  }}
                  className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                >
                  Lihat Semua Riwayat
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailHandledPatientModal;