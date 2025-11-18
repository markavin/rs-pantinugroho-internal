import React, { useState, useEffect, useMemo } from 'react';
import { History, FlaskConical, User, Calendar, TrendingUp, Filter, ChevronDown, ChevronUp, Activity, Heart, FileText, AlertCircle, Thermometer, Wind, Droplets } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Patient {
  id: string;
  mrNumber: string;
  name: string;
  birthDate: Date;
  gender: 'MALE' | 'FEMALE';
  phone?: string;
  height?: number;
  weight?: number;
  bmi?: number;
  diabetesType?: string;
  insuranceType: string;
  lastVisit?: Date;
  status?: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  allergies?: string[];
  smokingStatus?: 'TIDAK_MEROKOK' | 'PEROKOK' | 'MANTAN_PEROKOK';
  medicalHistory?: string;
  createdAt: Date;
}

interface LabResult {
  id: string;
  patientId: string;
  testType: string;
  value: string;
  normalRange: string;
  testDate: Date;
  status: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL';
  notes?: string;
}

interface PatientRecord {
  id: string;
  patientId: string;
  patient?: Patient;
  recordType: string;
  title: string;
  content: string;
  metadata?: any;
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  createdAt: Date;
}

interface LabHistoryViewProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onPatientSelect: (patient: Patient | null) => void;
}

type FilterType = 'all' | 'vital' | 'lab' | 'complaints';

const LabHistoryView: React.FC<LabHistoryViewProps> = ({
  patients,
  selectedPatient,
  onPatientSelect
}) => {
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [patientRecords, setPatientRecords] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '3m' | '6m' | 'all'>('all');
  const [expandedDates, setExpandedDates] = useState<{ [key: string]: boolean }>({});
  const [chartFilter, setChartFilter] = useState<{ [key: string]: boolean }>({});
  const [lastFetch, setLastFetch] = useState<Date>(new Date());

  useEffect(() => {
    if (selectedPatient) {
      fetchAllHistory(selectedPatient.id);
    }
  }, [selectedPatient]);

  const fetchAllHistory = async (patientId: string) => {
    setLoading(true);
    try {
      const [labResponse, recordsResponse] = await Promise.all([
        fetch(`/api/lab-results?patientId=${patientId}&_t=${Date.now()}`),
        fetch(`/api/patient-records?patientId=${patientId}&_t=${Date.now()}&includePatient=true`)
      ]);

      if (labResponse.ok) {
        const labData = await labResponse.json();
        console.log('Fetched lab results:', labData.length);
        setLabResults(labData);
      }

      if (recordsResponse.ok) {
        const recordsData = await recordsResponse.json();
        console.log('Fetched patient records:', recordsData.length);
        setPatientRecords(recordsData);
      }

      setLastFetch(new Date());
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (selectedPatient) {
      console.log('Manual refresh triggered');
      fetchAllHistory(selectedPatient.id);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL': return 'text-red-700 bg-red-50 border-red-200';
      case 'HIGH': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'LOW': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'NORMAL': return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadge = (status: string) => {
    const labels = {
      'CRITICAL': 'KRITIS',
      'HIGH': 'TINGGI',
      'LOW': 'RENDAH',
      'NORMAL': 'NORMAL'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getFilteredDataByTimeRange = (data: any[]) => {
    const now = new Date();
    const ranges = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '3m': 90 * 24 * 60 * 60 * 1000,
      '6m': 180 * 24 * 60 * 60 * 1000,
      'all': Infinity
    };

    const rangeMs = ranges[timeRange];

    return data.filter(item => {
      const itemDate = new Date(item.testDate || item.createdAt);
      return (now.getTime() - itemDate.getTime()) <= rangeMs;
    });
  };

  const groupDataByDate = () => {
    const groups: {
      [key: string]: {
        complaints: PatientRecord[];
        vitals: PatientRecord[];
        labs: LabResult[];
      }
    } = {};

    patientRecords.forEach(record => {
      const dateKey = new Date(record.createdAt).toISOString().split('T')[0];
      if (!groups[dateKey]) {
        groups[dateKey] = { complaints: [], vitals: [], labs: [] };
      }

      if (record.recordType === 'COMPLAINTS') {
        groups[dateKey].complaints.push(record);
      } else if (record.recordType === 'VITAL_SIGNS') {
        groups[dateKey].vitals.push(record);
      }
    });

    labResults.forEach(result => {
      const dateKey = new Date(result.testDate).toISOString().split('T')[0];
      if (!groups[dateKey]) {
        groups[dateKey] = { complaints: [], vitals: [], labs: [] };
      }
      groups[dateKey].labs.push(result);
    });

    return groups;
  };


  const prepareVitalSignsChart = () => {
    const vitalRecords = patientRecords.filter(r => r.recordType === 'VITAL_SIGNS');
    const filteredByTime = getFilteredDataByTimeRange(vitalRecords);

    return filteredByTime
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((record, index) => {
        const date = new Date(record.createdAt);
        const metadata = record.metadata || {};

        return {
          index: index,
          date: date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: timeRange === '3m' || timeRange === '6m' || timeRange === 'all' ? '2-digit' : undefined
          }),
          time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          fullDateTime: `${date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })} ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
          suhu: record.temperature || null,
          nadi: record.heartRate || null,
          tekananDarah: record.bloodPressure ? parseInt(record.bloodPressure.split('/')[0]) : null,
          tekananDarahFull: record.bloodPressure || null,
          spo2: metadata.oxygenSaturation || null,
          rr: metadata.respiratoryRate || null,
        };
      });
  };

  const prepareLabChart = () => {
    const filteredByTime = getFilteredDataByTimeRange(labResults);

    const groupedByDateTime: { [key: string]: { [testType: string]: number } } = {};

    filteredByTime.forEach(result => {
      const date = new Date(result.testDate);
      // Group by date + hour + minute (round to nearest 5 minutes to group similar times)
      const roundedMinutes = Math.floor(date.getMinutes() / 5) * 5;
      const dateTimeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}:${String(roundedMinutes).padStart(2, '0')}`;

      if (!groupedByDateTime[dateTimeKey]) {
        groupedByDateTime[dateTimeKey] = {};
      }
      const numValue = parseFloat(result.value);
      if (!isNaN(numValue)) {
        groupedByDateTime[dateTimeKey][result.testType] = numValue;
      }
    });

    return Object.keys(groupedByDateTime)
      .sort()
      .map(dateTimeKey => {
        const [datePart, timePart] = dateTimeKey.split('_');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute] = timePart.split(':').map(Number);
        const date = new Date(year, month - 1, day, hour, minute);

        return {
          date: date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            year: timeRange === '3m' || timeRange === '6m' || timeRange === 'all' ? '2-digit' : undefined
          }),
          fullDateTime: `${date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })} ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
          ...groupedByDateTime[dateTimeKey]
        };
      });
  };

  const vitalSignsData = prepareVitalSignsChart();
  const labChartData = prepareLabChart();

  const uniqueTestTypes = Array.from(new Set(labResults.map(result => result.testType)));

  useEffect(() => {
    const initialFilter: { [key: string]: boolean } = {};
    uniqueTestTypes.forEach(type => {
      initialFilter[type] = true;
    });
    setChartFilter(initialFilter);
  }, [labResults]);

  const dataByDate = React.useMemo(() => groupDataByDate(), [patientRecords, labResults]);

  const toggleDateExpansion = (dateKey: string) => {
    setExpandedDates(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey]
    }));
  };

  const toggleChartFilter = (key: string) => {
    setChartFilter(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleAllChartFilters = () => {
    const allActive = Object.values(chartFilter).every(v => v);
    const newState = !allActive;
    const newFilter: { [key: string]: boolean } = {};
    Object.keys(chartFilter).forEach(key => {
      newFilter[key] = newState;
    });
    setChartFilter(newFilter);
  };

  const getLineColor = (index: number) => {
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
      '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
    ];
    return colors[index % colors.length];
  };

  const renderComplaintsSection = (complaints: PatientRecord[]) => {
    if (complaints.length === 0) return null;

    return (

      <div className="bg-white rounded-lg border border-green-200 overflow-hidden mb-4">
        <div className="bg-green-50 px-4 py-2 border-b border-green-200">
          <h4 className="text-sm font-semibold text-green-900 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Keluhan Pasien
          </h4>
        </div>
        <div className="p-4 space-y-3">
          {complaints.map(complaint => (
            <div key={complaint.id} className="border-l-4 border-green-500 pl-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-gray-900">
                  {formatTime(complaint.createdAt)}
                </span>
                {complaint.metadata?.severity && (
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${complaint.metadata.severity === 'BERAT' ? 'bg-red-100 text-red-800' :
                    complaint.metadata.severity === 'SEDANG' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                    {complaint.metadata.severity}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{complaint.content}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderVitalSignsTable = (vitals: PatientRecord[]) => {
    if (vitals.length === 0) return null;

    return (
      <>

        {vitals.length > 0 && (
          <div className="bg-white rounded-lg border border-green-200 overflow-hidden mb-4">
            <div className="bg-green-50 px-4 py-2 border-b border-green-200">
              <h4 className="text-sm font-semibold text-green-900 flex items-center gap-2">
                <User className="h-4 w-4" />
                Data Medis Pasien
              </h4>
            </div>
            <div className="p-4">
              {vitals.map(vital => {
                const metadata = vital.metadata || {};
                const patient = vital.patient || selectedPatient;

                return (
                  <div key={vital.id} className="mb-3 last:mb-0 border-b border-gray-200 pb-3 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600">
                        {formatTime(vital.createdAt)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Tinggi:</span>
                        <span className="font-semibold text-gray-900 ml-2">
                          {patient?.height ? `${patient.height} cm` : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Berat:</span>
                        <span className="font-semibold text-gray-900 ml-2">
                          {patient?.weight ? `${patient.weight} kg` : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">BMI:</span>
                        <span className="font-semibold text-gray-900 ml-2">
                          {patient?.bmi || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Merokok:</span>
                        <span className="font-semibold text-gray-900 ml-2">
                          {patient?.smokingStatus === 'PEROKOK' ? 'Ya' :
                            patient?.smokingStatus === 'MANTAN_PEROKOK' ? 'Mantan' : 'Tidak'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Diabetes:</span>
                        <span className="font-semibold text-gray-900 ml-2">
                          {patient?.diabetesType || 'Tidak ada'}
                        </span>
                      </div>
                      <div className="md:col-span-3">
                        <span className="text-gray-600">Alergi:</span>
                        <span className="font-semibold text-gray-900 ml-2">
                          {patient?.allergies && patient.allergies.length > 0
                            ? patient.allergies.join(', ')
                            : 'Tidak ada'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg border border-green-200 overflow-hidden mb-4">
          <div className="bg-green-50 px-4 py-2 border-b border-green-200">
            <h4 className="text-sm font-semibold text-green-900 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Tanda Vital
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Waktu</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Suhu (°C)</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Nadi (bpm)</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">TD (mmHg)</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">SpO2 (%)</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">RR (x/mnt)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vitals.map(vital => {
                  const metadata = vital.metadata || {};
                  return (
                    <tr key={vital.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-xs text-gray-900 font-medium">
                        {formatTime(vital.createdAt)}
                      </td>

                      {/* Suhu */}
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Thermometer className="h-3 w-3 text-blue-500" />
                          <span className="text-xs text-gray-900 font-semibold">
                            {vital.temperature || '-'}
                          </span>
                        </div>
                      </td>

                      {/* Nadi */}
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Heart className="h-3 w-3 text-red-500" />
                          <span className="text-xs text-gray-900 font-semibold">
                            {vital.heartRate || '-'}
                          </span>
                        </div>
                      </td>

                      {/* TD Sistolik */}
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Activity className="h-3 w-3 text-purple-500" />
                          <span className="text-xs text-gray-900 font-semibold">
                            {vital.bloodPressure || '-'}
                          </span>
                        </div>
                      </td>

                      {/* SpO2 */}
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Droplets className="h-3 w-3 text-emerald-500" />
                          <span className="text-xs text-gray-900 font-semibold">
                            {metadata.oxygenSaturation || '-'}
                          </span>
                        </div>
                      </td>

                      {/* Respiratory Rate */}
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Wind className="h-3 w-3 text-pink-500" />
                          <span className="text-xs text-gray-900 font-semibold">
                            {metadata.respiratoryRate || '-'}
                          </span>
                        </div>
                      </td>
                    </tr>

                  );
                })}
              </tbody>
            </table>
          </div>
        </div>


        {vitals.some(v => v.metadata?.searB) && (
          <div className="bg-white rounded-lg border border-green-200 overflow-hidden mb-4">
            <div className="bg-green-50 px-4 py-2 border-b border-green-200">
              <h4 className="text-sm font-semibold text-green-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Prediksi Risiko Kardiovaskular (SEAR B WHO)
              </h4>
            </div>
            <div className="p-4">
              {vitals.filter(v => v.metadata?.searB).map(vital => {
                const searB = vital.metadata.searB;
                const getColorClass = () => {
                  if (searB.level === 'Sangat Rendah') return 'bg-green-100 text-green-800 border-green-300';
                  if (searB.level === 'Rendah') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
                  if (searB.level === 'Sedang') return 'bg-orange-100 text-orange-800 border-orange-300';
                  if (searB.level === 'Tinggi') return 'bg-red-100 text-red-800 border-red-300';
                  return 'bg-red-900 text-white border-red-900';
                };

                return (
                  <div key={vital.id} className="mb-3 last:mb-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600">
                        {formatTime(vital.createdAt)}
                      </span>
                    </div>
                    <div className={`rounded-lg border-2 p-3 ${getColorClass()}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium mb-1">Risiko 10 Tahun</p>
                          <p className="text-2xl font-bold">{searB.range}</p>
                          <p className="text-sm font-semibold mt-1">{searB.level}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 opacity-50" />
                      </div>
                      <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="opacity-75">Umur:</span>
                            <span className="font-semibold ml-1">{searB.age} tahun</span>
                          </div>
                          <div>
                            <span className="opacity-75">Kolesterol:</span>
                            <span className="font-semibold ml-1">{searB.cholesterolMmol} mmol/L</span>
                          </div>
                          <div>
                            <span className="opacity-75">Merokok:</span>
                            <span className="font-semibold ml-1">{searB.isSmoker ? 'Ya' : 'Tidak'}</span>
                          </div>
                          <div>
                            <span className="opacity-75">Diabetes:</span>
                            <span className="font-semibold ml-1">{searB.hasDiabetes ? 'Ya' : 'Tidak'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </>
    );
  };

  const renderLabResultsTable = (labs: LabResult[]) => {
    if (labs.length === 0) return null;

    const labsByType: { [key: string]: LabResult[] } = {};
    labs.forEach(lab => {
      if (!labsByType[lab.testType]) {
        labsByType[lab.testType] = [];
      }
      labsByType[lab.testType].push(lab);
    });

    const testTypes = Object.keys(labsByType);

    return (
      <div className="bg-white rounded-lg border border-green-200 overflow-hidden mb-4">
        <div className="bg-green-50 px-4 py-2 border-b border-green-200">
          <h4 className="text-sm font-semibold text-green-900 flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            Hasil Laboratorium ({labs.length} tes)
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 sticky left-0 bg-gray-50 z-10">Waktu</th>
                {testTypes.map(testType => (
                  <th key={testType} className="px-3 py-2 text-center text-xs font-medium text-gray-700 min-w-[120px]">
                    {testType}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.from(new Set(labs.map(l => formatTime(l.testDate)))).map(time => {
                const labsAtTime = labs.filter(l => formatTime(l.testDate) === time);

                return (
                  <tr key={time} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-xs text-gray-900 font-medium sticky left-0 bg-white">
                      {time}
                    </td>
                    {testTypes.map(testType => {
                      const lab = labsAtTime.find(l => l.testType === testType);

                      if (!lab) {
                        return (
                          <td key={testType} className="px-3 py-2 text-center text-xs text-gray-400">
                            -
                          </td>
                        );
                      }

                      let cellClass = 'px-3 py-2 text-center';
                      if (lab.status === 'CRITICAL') {
                        cellClass += ' bg-red-50';
                      } else if (lab.status === 'HIGH') {
                        cellClass += ' bg-orange-50';
                      } else if (lab.status === 'LOW') {
                        cellClass += ' bg-yellow-50';
                      } else if (lab.status === 'NORMAL') {
                        cellClass += ' bg-green-50';
                      }

                      return (
                        <td key={testType} className={cellClass}>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-bold text-gray-900">
                              {lab.value}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              Normal: {lab.normalRange}
                            </span>
                            <span className={`text-[10px] font-semibold ${lab.status === 'CRITICAL' ? 'text-red-700' :
                              lab.status === 'HIGH' ? 'text-orange-700' :
                                lab.status === 'LOW' ? 'text-yellow-700' :
                                  'text-green-700'
                              }`}>
                              {getStatusBadge(lab.status)}
                            </span>
                            {lab.notes && (
                              <span className="text-[10px] text-gray-600 italic" title={lab.notes}>
                                {lab.notes.substring(0, 15)}{lab.notes.length > 15 ? '...' : ''}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDailyGroup = (dateKey: string, data: {
    complaints: PatientRecord[];
    vitals: PatientRecord[];
    labs: LabResult[];
  }) => {
    const isExpanded = expandedDates[dateKey];
    const dateObj = new Date(dateKey);
    const totalItems = data.complaints.length + data.vitals.length + data.labs.length;

    if (totalItems === 0) return null;

    return (
      <div key={dateKey} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleDateExpansion(dateKey)}
          className="w-full px-6 py-4 bg-linear-to-r from-blue-50 to-green-50 border-b border-gray-200 flex items-center justify-between hover:from-blue-100 hover:to-green-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="text-left">
              <h3 className="text-lg font-bold text-gray-900">
                {dateObj.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </h3>
              <p className="text-sm text-gray-600">
              {data.complaints.length} Info Media • {data.vitals.length} vital signs • {data.labs.length} hasil lab
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
            {renderComplaintsSection(data.complaints)}
            {renderVitalSignsTable(data.vitals)}
            {renderLabResultsTable(data.labs)}
          </div>
        )}
      </div>
    );
  };


  if (!selectedPatient) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center space-x-3">
          <History className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Riwayat Pemeriksaan</h3>
        </div>

        <div className="p-6">
          <div className="text-center py-8">
            <FlaskConical className="h-16 w-12 mx-auto text-green-600 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Pilih Pasien</h4>
            <p className="text-gray-600 mb-6">Pilih pasien dari daftar untuk melihat riwayat pemeriksaan</p>

            <div className="max-w-md mx-auto">
              <div className="grid gap-3">
                {patients.slice(0, 5).map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => onPatientSelect(patient)}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{patient.name}</p>
                        <p className="text-sm text-gray-600">RM: {patient.mrNumber}</p>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {patient.insuranceType}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {patients.length > 5 && (
                <p className="text-sm text-gray-500 mt-4">
                  Dan {patients.length - 5} pasien lainnya...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{selectedPatient.name}</h2>
              <p className="text-gray-600">RM: {selectedPatient.mrNumber} | {selectedPatient.insuranceType}</p>
              <p className="text-xs text-gray-500 mt-1">
                Terakhir diperbarui: {lastFetch.toLocaleTimeString('id-ID')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-300 hover:bg-blue-50 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Activity className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm">{loading ? 'Memuat...' : 'Refresh'}</span>
            </button>
            <button
              onClick={() => onPatientSelect(null)}
              className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Ganti Pasien
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Rentang Waktu:</span>
          {[
            { key: 'all', label: 'Semua' },
            { key: '7d', label: '7 Hari' },
            { key: '30d', label: '30 Hari' },
            { key: '3m', label: '3 Bulan' },
            { key: '6m', label: '6 Bulan' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTimeRange(key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${timeRange === key
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-green-100 border border-gray-200'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {vitalSignsData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h4 className="text-sm font-semibold text-gray-900">
                Tren Tanda Vital
              </h4>
            </div>
            <span className="text-xs text-gray-500">{vitalSignsData.length} titik data</span>
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={vitalSignsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="index"
                tick={{ fontSize: 11 }}
                stroke="#6b7280"
                tickFormatter={(value) => vitalSignsData[value]?.date || ''}
              />
              <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  fontSize: '12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  color: '#111827',
                }}
                labelStyle={{
                  color: '#111827',
                  fontWeight: 400,
                }}
                labelFormatter={(label) => {
                  const data = vitalSignsData[label];
                  return data ? data.fullDateTime : label;
                }}
                formatter={(value: any, name: string) => {
                  if (value === null) return ['-', name];
                  return [value, name];
                }}
              />

              <Legend wrapperStyle={{ fontSize: '12px' }} iconType="line" />
              <Line type="monotone" dataKey="suhu" stroke="#3b82f6" strokeWidth={2} name="Suhu (°C)" dot={{ fill: '#3b82f6', r: 4 }} connectNulls />
              <Line type="monotone" dataKey="nadi" stroke="#ef4444" strokeWidth={2} name="Nadi (bpm)" dot={{ fill: '#ef4444', r: 4 }} connectNulls />
              <Line type="monotone" dataKey="tekananDarah" stroke="#8b5cf6" strokeWidth={2} name="TD Sistolik" dot={{ fill: '#8b5cf6', r: 4 }} connectNulls />
              <Line type="monotone" dataKey="spo2" stroke="#10b981" strokeWidth={2} name="SpO2 (%)" dot={{ fill: '#10b981', r: 4 }} connectNulls />
              <Line type="monotone" dataKey="rr" stroke="#f59e0b" strokeWidth={2} name="Respiratory Rate (x/mnt)" dot={{ fill: '#f59e0b', r: 4 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {labChartData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h4 className="text-sm font-semibold text-gray-900">
                Tren Hasil Lab
              </h4>
            </div>
            <span className="text-xs text-gray-500">{labChartData.length} titik data</span>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={toggleAllChartFilters}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-colors bg-gray-600 text-white hover:bg-gray-700"
            >
              {Object.values(chartFilter).every(v => v) ? 'Sembunyikan Semua' : 'Tampilkan Semua'}
            </button>
            {uniqueTestTypes.map((testType, index) => (
              <button
                key={testType}
                onClick={() => toggleChartFilter(testType)}
                className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                style={{
                  backgroundColor: chartFilter[testType] ? getLineColor(index) : '#e5e7eb',
                  color: chartFilter[testType] ? '#ffffff' : '#6b7280'
                }}
              >
                {testType}
              </button>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={labChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#6b7280" />
              <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  fontSize: '12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  color: '#111827',
                }}
                labelStyle={{
                  color: '#111827',
                  fontWeight: 400,
                }}
                labelFormatter={(label) => {
                  const data = vitalSignsData[label];
                  return data ? data.fullDateTime : label;
                }}
                formatter={(value: any, name: string) => {
                  if (value === null) return ['-', name];
                  return [value, name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} iconType="line" />
              {uniqueTestTypes.map((testType, index) => (
                chartFilter[testType] && (
                  <Line
                    key={testType}
                    type="monotone"
                    dataKey={testType}
                    stroke={getLineColor(index)}
                    strokeWidth={2}
                    name={testType}
                    dot={{ fill: getLineColor(index), r: 4 }}
                    connectNulls
                  />
                )
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <History className="h-5 w-5 text-green-600" />
            <span>Riwayat Pemeriksaan Lengkap</span>
          </h3>
          <span className="text-sm text-gray-500">
            {Object.keys(dataByDate).length} hari pemeriksaan
          </span>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : Object.keys(dataByDate).length > 0 ? (
            <div className="space-y-4">
              {Object.keys(dataByDate)
                .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
                .map(dateKey => renderDailyGroup(dateKey, dataByDate[dateKey]))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FlaskConical className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Belum ada riwayat pemeriksaan</p>
              <p>Pasien ini belum memiliki riwayat pemeriksaan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabHistoryView;