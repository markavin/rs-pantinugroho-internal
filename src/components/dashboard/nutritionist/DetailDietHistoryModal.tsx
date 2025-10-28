import React, { useState, useEffect } from 'react';
import { X, Utensils, ChevronDown, ChevronUp, Calendar, User, TrendingUp, AlertCircle, ChefHat, Edit3, Scale } from 'lucide-react';

interface NutritionRecord {
  id: string;
  patientId: string;
  nutritionistId: string;
  targetCalories: number;
  dietPlan: string;
  complianceScore: number | null;
  weightChange: number | null;
  mealDistribution: any;
  recommendations: string[];
  createdAt: string;
  nutritionist: {
    name: string;
  };
}

interface Visitation {
  id: string;
  patientId: string;
  nurseId: string;
  shift: 'PAGI' | 'SORE' | 'MALAM';
  dietCompliance?: number | null;
  dietIssues?: string | null;
  createdAt: string;
  nurse?: {
    name: string;
  };
}

interface Patient {
  id: string;
  mrNumber: string;
  name: string;
}

interface DetailDietHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  visitations: Visitation[];
  loading?: boolean;
}

type TimeRangeType = '7d' | '30d' | '3m' | 'all';
type FilterType = 'all' | 'nutrition' | 'monitoring';

const DetailDietHistoryModal: React.FC<DetailDietHistoryModalProps> = ({
  isOpen,
  onClose,
  patient,
  visitations,
  loading = false
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [timeRange, setTimeRange] = useState<TimeRangeType>('30d');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [expandedDates, setExpandedDates] = useState<{ [key: string]: boolean }>({});
  const [nutritionRecords, setNutritionRecords] = useState<NutritionRecord[]>([]);
  const [loadingNutrition, setLoadingNutrition] = useState(false);

  useEffect(() => {
    if (isOpen && patient) {
      fetchNutritionRecords();
    }
  }, [isOpen, patient]);

  const fetchNutritionRecords = async () => {
    if (!patient) return;
    
    setLoadingNutrition(true);
    try {
      const response = await fetch(`/api/nutrition-records?patientId=${patient.id}`);
      if (response.ok) {
        const data = await response.json();
        setNutritionRecords(data);
      }
    } catch (error) {
      console.error('Error fetching nutrition records:', error);
    } finally {
      setLoadingNutrition(false);
    }
  };

  if (!isOpen || !patient) return null;

  const getFilteredByTimeRange = (date: string) => {
    if (timeRange === 'all') return true;

    const now = new Date();
    const itemDate = new Date(date);
    const ranges = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '3m': 90 * 24 * 60 * 60 * 1000,
      'all': Infinity
    };

    const rangeMs = ranges[timeRange];
    return (now.getTime() - itemDate.getTime()) <= rangeMs;
  };

  const getFilteredData = () => {
    let allData: any[] = [];

    if (filterType === 'all' || filterType === 'nutrition') {
      const nutritionData = nutritionRecords.map(record => ({
        type: 'nutrition',
        date: record.createdAt,
        data: record
      }));
      allData = [...allData, ...nutritionData];
    }

    if (filterType === 'all' || filterType === 'monitoring') {
      const monitoringData = visitations
        .filter(v => v.dietCompliance !== null || v.dietIssues)
        .map(visit => ({
          type: 'monitoring',
          date: visit.createdAt,
          data: visit
        }));
      allData = [...allData, ...monitoringData];
    }

    if (selectedDate) {
      allData = allData.filter(item => {
        const itemDate = new Date(item.date).toISOString().split('T')[0];
        return itemDate === selectedDate;
      });
    }

    allData = allData.filter(item => getFilteredByTimeRange(item.date));

    return allData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const groupByDate = (data: any[]) => {
    const groups: { [key: string]: any[] } = {};

    data.forEach(item => {
      const dateKey = new Date(item.date).toISOString().split('T')[0];
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });

    Object.keys(groups).forEach(dateKey => {
      groups[dateKey].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    });

    return groups;
  };

  const filteredData = getFilteredData();
  const groupedData = groupByDate(filteredData);

  const calculateStats = () => {
    const monitoringData = visitations.filter(v => v.dietCompliance !== null);
    if (monitoringData.length === 0) return null;

    const avg = Math.round(
      monitoringData.reduce((sum, v) => sum + (v.dietCompliance || 0), 0) / monitoringData.length
    );
    const max = Math.max(...monitoringData.map(v => v.dietCompliance || 0));
    const min = Math.min(...monitoringData.map(v => v.dietCompliance || 0));
    const issuesCount = visitations.filter(v => v.dietIssues).length;

    return { avg, max, min, issuesCount, totalRecords: nutritionRecords.length, totalMonitoring: monitoringData.length };
  };

  const stats = calculateStats();

  const toggleDateExpansion = (dateKey: string) => {
    setExpandedDates(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey]
    }));
  };

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 80) return 'text-green-700 bg-green-100';
    if (compliance >= 50) return 'text-yellow-700 bg-yellow-100';
    return 'text-red-700 bg-red-100';
  };

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case 'PAGI': return 'bg-orange-100 text-orange-800';
      case 'SORE': return 'bg-yellow-100 text-yellow-800';
      case 'MALAM': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderNutritionRecord = (record: NutritionRecord) => {
    return (
      <div className="border border-blue-300 bg-blue-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <ChefHat className="h-5 w-5 text-blue-600" />
            <div>
              <span className="text-sm font-bold text-blue-900">Rencana Diet & Menu</span>
              <p className="text-xs text-blue-700">
                {new Date(record.createdAt).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })} oleh {record.nutritionist?.name || 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-white border border-blue-200 rounded p-3">
            <p className="text-xs text-blue-600 mb-1">Jenis Diet</p>
            <p className="text-sm font-semibold text-gray-900">{record.dietPlan || '-'}</p>
          </div>

          <div className="bg-white border border-blue-200 rounded p-3">
            <p className="text-xs text-blue-600 mb-1">Target Kalori</p>
            <p className="text-sm font-semibold text-gray-900">{record.targetCalories} kkal/hari</p>
          </div>

          {record.complianceScore !== null && (
            <div className="bg-white border border-blue-200 rounded p-3">
              <p className="text-xs text-blue-600 mb-1">Skor Kepatuhan</p>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getComplianceColor(record.complianceScore)}`}>
                  {record.complianceScore}%
                </span>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${record.complianceScore >= 80 ? 'bg-green-500' :
                        record.complianceScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${record.complianceScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {record.weightChange !== null && (
            <div className="bg-white border border-blue-200 rounded p-3">
              <p className="text-xs text-blue-600 mb-1">Perubahan Berat Badan</p>
              <p className={`text-sm font-semibold ${record.weightChange > 0 ? 'text-red-600' :
                record.weightChange < 0 ? 'text-green-600' : 'text-gray-600'
              }`}>
                {record.weightChange > 0 ? '+' : ''}{record.weightChange.toFixed(1)} kg
              </p>
            </div>
          )}

          {record.mealDistribution && (
            <div className="bg-white border border-blue-200 rounded p-3">
              <p className="text-xs text-blue-600 mb-2 font-semibold">Menu Makanan</p>
              <div className="space-y-2 text-xs">
                {Object.entries(record.mealDistribution).map(([mealTime, items]: [string, any]) => {
                  if (!Array.isArray(items) || items.length === 0) return null;
                  
                  const mealLabels: any = {
                    breakfast: 'Sarapan',
                    morningSnack: 'Snack Pagi',
                    lunch: 'Makan Siang',
                    afternoonSnack: 'Snack Sore',
                    dinner: 'Makan Malam'
                  };

                  const totalCalories = items.reduce((sum, item) => sum + (item.calories || 0), 0);

                  return (
                    <div key={mealTime} className="bg-gray-50 rounded p-2">
                      <p className="font-semibold text-gray-800 mb-1">
                        {mealLabels[mealTime]} ({totalCalories} kkal)
                      </p>
                      <ul className="list-disc list-inside text-gray-700 space-y-0.5">
                        {items.map((item: any, idx: number) => (
                          <li key={idx}>
                            {item.name} - {item.portion} ({item.calories} kkal)
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {record.recommendations && record.recommendations.length > 0 && (
            <div className="bg-white border border-blue-200 rounded p-3">
              <p className="text-xs text-blue-600 mb-2 font-semibold">Rekomendasi & Catatan</p>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {record.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMonitoring = (visit: Visitation) => {
    return (
      <div className="border border-green-300 bg-green-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getShiftColor(visit.shift)}`}>
              {visit.shift}
            </span>
            <span className="text-sm font-medium text-gray-900">
              {new Date(visit.createdAt).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <span className="text-xs text-gray-600">
              oleh {visit.nurse?.name || 'Unknown'}
            </span>
          </div>
          {visit.dietCompliance !== null && (
            <span className={`px-4 py-1 rounded-full text-sm font-bold ${getComplianceColor(visit.dietCompliance)}`}>
              {visit.dietCompliance}%
            </span>
          )}
        </div>

        {visit.dietCompliance !== null && (
          <div className="mb-3">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${visit.dietCompliance >= 80 ? 'bg-green-500' :
                  visit.dietCompliance >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${visit.dietCompliance}%` }}
              ></div>
            </div>
          </div>
        )}

        {visit.dietIssues && (
          <div className="mt-3 p-3 bg-white border border-orange-300 rounded">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-800 mb-1">
                  Masalah yang Dilaporkan:
                </p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {visit.dietIssues}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDailyGroup = (dateKey: string, items: any[]) => {
    const isExpanded = expandedDates[dateKey];
    const dateObj = new Date(dateKey);

    const nutritionItems = items.filter(item => item.type === 'nutrition');
    const monitoringItems = items.filter(item => item.type === 'monitoring');

    const avgCompliance = monitoringItems.length > 0
      ? Math.round(
          monitoringItems
            .filter(item => item.data.dietCompliance !== null)
            .reduce((sum, item) => sum + (item.data.dietCompliance || 0), 0) /
          Math.max(monitoringItems.filter(item => item.data.dietCompliance !== null).length, 1)
        )
      : null;

    return (
      <div key={dateKey} className="bg-white rounded-lg border border-green-200 overflow-hidden">
        <button
          onClick={() => toggleDateExpansion(dateKey)}
          className="w-full px-6 py-4 bg-green-50 border-b border-gray-200 flex items-center justify-between hover:bg-green-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-green-500" />
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
                {nutritionItems.length} rencana diet • {monitoringItems.length} monitoring
                {avgCompliance !== null && ` • Rata-rata kepatuhan: ${avgCompliance}%`}
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-600" />
          )}
        </button>

        {isExpanded && (
          <div className="p-6">
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx}>
                  {item.type === 'nutrition' ? renderNutritionRecord(item.data) : renderMonitoring(item.data)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Utensils className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Riwayat Lengkap Diet & Monitoring
                </h3>
                <p className="text-sm text-gray-600">
                  {patient.name} - {patient.mrNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {stats && (
                <div className="flex items-center gap-3">
                  <button className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-2 text-left hover:shadow-md transition-all">
                    <p className="text-xs text-gray-600 mb-0.5">Rencana Diet</p>
                    <p className="text-sm font-semibold text-blue-600 text-center">{stats.totalRecords}x</p>
                  </button>

                  <button className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-2 text-left hover:shadow-md transition-all">
                    <p className="text-xs text-gray-600 mb-0.5">Monitoring</p>
                    <p className="text-sm font-semibold text-green-600 text-center">{stats.totalMonitoring}x</p>
                  </button>

                  <button className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-2 text-left hover:shadow-md transition-all">
                    <p className="text-xs text-gray-600 mb-0.5">Rata-rata</p>
                    <p className={`text-sm font-semibold text-center ${stats.avg >= 80 ? 'text-green-600' :
                      stats.avg >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {stats.avg}%
                    </p>
                  </button>

                  <button className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-2 text-left hover:shadow-md transition-all">
                    <p className="text-xs text-gray-600 mb-0.5">Masalah</p>
                    <p className="text-sm font-semibold text-orange-600 text-center">{stats.issuesCount}x</p>
                  </button>
                </div>
              )}

              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              
              <div className="flex items-center gap-2">
                {[
                  { key: 'all', label: 'Semua' },
                  { key: 'nutrition', label: 'Rencana Diet' },
                  { key: 'monitoring', label: 'Monitoring' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilterType(key as FilterType)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterType === key
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
              />
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate('')}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Rentang:</span>
              {[
                { key: '7d', label: '7 Hari' },
                { key: '30d', label: '30 Hari' },
                { key: '3m', label: '3 Bulan' },
                { key: 'all', label: 'Semua' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTimeRange(key as TimeRangeType)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${timeRange === key
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-orange-50 border border-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
              <div className="text-sm text-gray-600 ml-4">
                Total: <span className="font-bold text-green-500">{filteredData.length}</span> data
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading || loadingNutrition ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat riwayat...</p>
            </div>
          ) : filteredData.length > 0 ? (
            <div className="space-y-4">
              {Object.keys(groupedData)
                .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
                .map(dateKey => renderDailyGroup(dateKey, groupedData[dateKey]))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Utensils className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="font-medium text-lg mb-2">Tidak ada riwayat ditemukan</p>
              <p className="text-sm">
                {selectedDate || timeRange !== 'all'
                  ? 'Tidak ada data pada rentang waktu yang dipilih'
                  : 'Belum ada riwayat diet dan monitoring'}
              </p>
              {(selectedDate || timeRange !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedDate('');
                    setTimeRange('all');
                  }}
                  className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Lihat Semua Riwayat
                </button>
              )}
            </div>
          )}
        </div>

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

export default DetailDietHistoryModal;