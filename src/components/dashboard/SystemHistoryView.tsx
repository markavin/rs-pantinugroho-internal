import React, { useState, useEffect } from 'react';
import {
    History, User, Calendar, Activity, ChevronDown, ChevronUp,
    FileText, Pill, Utensils, FlaskConical, Stethoscope,
    ClipboardList, Heart, Thermometer, TrendingUp, AlertCircle,
    UserCheck, Syringe, Apple, Wind, Droplets
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Patient {
    id: string;
    mrNumber: string;
    name: string;
    birthDate: Date;
    gender: 'MALE' | 'FEMALE';
    insuranceType: string;
    phone?: string;
    address?: string;
    height?: number;
    weight?: number;
    bmi?: number;
    diabetesType?: string;
    lastVisit?: Date;
    status?: string;
    createdAt: Date;
    allergies?: string[];
    medicalHistory?: string;
    smokingStatus?: 'TIDAK_MEROKOK' | 'PEROKOK' | 'MANTAN_PEROKOK';
}

interface SystemHistoryViewProps {
    patients: Patient[];
    selectedPatient: Patient | null;
    onPatientSelect: (patient: Patient | null) => void;
}

type ActivityType = 'all' | 'complaints' | 'vitals' | 'labs' | 'handled' | 'visitations' | 'nutrition' | 'pharmacy' | 'medical-reports' | 'searb';

const SystemHistoryView: React.FC<SystemHistoryViewProps> = ({
    patients,
    selectedPatient,
    onPatientSelect
}) => {
    const [allActivities, setAllActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [activityFilter, setActivityFilter] = useState<ActivityType>('all');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | '3m' | '6m' | 'all'>('all');
    const [expandedDates, setExpandedDates] = useState<{ [key: string]: boolean }>({});
    const [chartFilter, setChartFilter] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        if (selectedPatient) {
            fetchAllSystemHistory(selectedPatient.id);
        }
    }, [selectedPatient]);

    const fetchAllSystemHistory = async (patientId: string) => {
        setLoading(true);
        try {
            console.log('Fetching system history for patient:', patientId);

            const safeFetch = async (url: string): Promise<Response | null> => {
                try {
                    return await fetch(url);
                } catch (error) {
                    console.error(`Failed to fetch ${url}:`, error);
                    return null;
                }
            };

            const [
                complaintsRes,
                vitalsRes,
                labsRes,
                handledRes,
                visitationsRes,
                nutritionRes,
                pharmacyRes,
                medicalReportsRes
            ] = await Promise.all([
                safeFetch(`/api/patient-records?patientId=${patientId}&type=COMPLAINTS`),
                safeFetch(`/api/patient-records?patientId=${patientId}&type=VITAL_SIGNS&includePatient=true`),
                safeFetch(`/api/lab-results?patientId=${patientId}`),
                safeFetch(`/api/handled-patients?patientId=${patientId}`),
                safeFetch(`/api/visitations?patientId=${patientId}`),
                safeFetch(`/api/nutrition-records?patientId=${patientId}`),
                safeFetch(`/api/drug-transactions?patientId=${patientId}`),
                safeFetch(`/api/medical-reports?patientId=${patientId}`)
            ]);

            const safeJson = async (response: Response | null): Promise<any[]> => {
                if (!response || !response.ok) return [];
                try {
                    return await response.json();
                } catch (error) {
                    console.error('JSON parse error:', error);
                    return [];
                }
            };

            const complaints = await safeJson(complaintsRes);
            const vitalsFromRecords = await safeJson(vitalsRes);
            const labs = await safeJson(labsRes);
            const handled = await safeJson(handledRes);
            const visitations = await safeJson(visitationsRes);
            const nutrition = await safeJson(nutritionRes);
            const pharmacy = await safeJson(pharmacyRes);
            const medicalReports = await safeJson(medicalReportsRes);

            console.log('Data fetched:', {
                complaints: complaints.length,
                vitals: vitalsFromRecords.length,
                labs: labs.length,
                handled: handled.length,
                visitations: visitations.length,
                nutrition: nutrition.length,
                pharmacy: pharmacy.length,
                medicalReports: medicalReports.length
            });

            const vitalsWithSearB = vitalsFromRecords
                .filter((v: any) => v.metadata?.searB && v.metadata.searB.percentage)
                .map((v: any) => {
                    const timestamp = v.createdAt ? new Date(v.createdAt) : new Date();
                    return {
                        ...v,
                        activityType: 'searb',
                        timestamp: timestamp,
                        role: 'SEARB',
                        searBData: v.metadata.searB
                    };
                });

            const safeTimestamp = (dateValue: any): Date => {
                if (!dateValue) return new Date();
                try {
                    const date = new Date(dateValue);
                    return isNaN(date.getTime()) ? new Date() : date;
                } catch {
                    return new Date();
                }
            };

            const combined = [
                ...complaints.map((c: any) => ({
                    ...c,
                    activityType: 'complaint',
                    timestamp: safeTimestamp(c.createdAt),
                    role: 'ADMINISTRASI'
                })),
                ...vitalsFromRecords
                    .filter((v: any) => !v.metadata?.searB)
                    .map((v: any) => ({
                        ...v,
                        activityType: 'vital',
                        timestamp: safeTimestamp(v.createdAt),
                        role: v.title?.includes('(Lab)') || v.title?.includes('Laboratorium')
                            ? 'LABORATORIUM'
                            : 'PERAWAT_POLI'
                    })),
                ...labs.map((l: any) => ({
                    ...l,
                    activityType: 'lab',
                    timestamp: safeTimestamp(l.testDate || l.createdAt),
                    role: l.technician?.role || 'LABORATORIUM'
                })),
                ...vitalsWithSearB,
                ...handled.map((h: any) => ({
                    ...h,
                    activityType: 'handled',
                    timestamp: safeTimestamp(h.handledDate || h.createdAt),
                    role: h.handler?.role || 'DOKTER_SPESIALIS'
                })),
                ...visitations.map((v: any) => ({
                    ...v,
                    activityType: 'visitation',
                    timestamp: safeTimestamp(v.visitDate || v.createdAt),
                    role: 'PERAWAT_RUANGAN'
                })),
                ...nutrition.map((n: any) => ({
                    ...n,
                    activityType: 'nutrition',
                    timestamp: safeTimestamp(n.createdAt),
                    role: 'AHLI_GIZI'
                })),
                ...pharmacy.map((p: any) => ({
                    ...p,
                    activityType: 'pharmacy',
                    timestamp: safeTimestamp(p.createdAt),
                    role: 'FARMASI'
                })),
                ...medicalReports.map((m: any) => ({
                    ...m,
                    activityType: 'medical-report',
                    timestamp: safeTimestamp(m.createdAt),
                    role: 'DOKTER_SPESIALIS'
                }))
            ];

            combined.sort((a, b) => {
                try {
                    const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : 0;
                    const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : 0;
                    return timeB - timeA;
                } catch (error) {
                    console.error('Sort error:', error);
                    return 0;
                }
            });

            console.log('Total combined activities:', combined.length);
            setAllActivities(combined);
        } catch (error) {
            console.error('Error fetching system history:', error);
            setAllActivities([]);
        } finally {
            setLoading(false);
        }
    };

    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    const getFilteredActivities = () => {
        let filtered = allActivities;

        if (activityFilter !== 'all') {
            filtered = filtered.filter(a => a.activityType === activityFilter);
        }

        if (roleFilter !== 'all') {
            filtered = filtered.filter(a => {
                if (roleFilter === 'DOKTER') {
                    return a.role === 'DOKTER_SPESIALIS' || a.role === 'DOKTER_POLI';
                }
                if (roleFilter === 'PERAWAT') {
                    return a.role === 'PERAWAT_RUANGAN' || a.role === 'PERAWAT_POLI' || a.role === 'PERAWAT';
                }
                if (roleFilter === 'POLI_LAB') {
                    return a.role === 'PERAWAT_POLI' || a.role === 'LABORATORIUM' ||
                        (a.activityType === 'lab' && a.technician?.role === 'PERAWAT_POLI');
                }
                if (roleFilter === 'SEARB') {
                    return a.activityType === 'searb';
                }
                return a.role === roleFilter;
            });
        }

        if (dateRange.startDate) {
            const startDate = new Date(dateRange.startDate);
            startDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter(a => a.timestamp >= startDate);
        }

        if (dateRange.endDate) {
            const endDate = new Date(dateRange.endDate);
            endDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(a => a.timestamp <= endDate);
        }

        if (!dateRange.startDate && !dateRange.endDate) {
            const now = new Date();
            const ranges = {
                'today': 24 * 60 * 60 * 1000,
                '7d': 7 * 24 * 60 * 60 * 1000,
                '30d': 30 * 24 * 60 * 60 * 1000,
                '3m': 90 * 24 * 60 * 60 * 1000,
                '6m': 180 * 24 * 60 * 60 * 1000,
                'all': Infinity
            };

            const rangeMs = ranges[timeRange];
            filtered = filtered.filter(a => (now.getTime() - a.timestamp.getTime()) <= rangeMs);
        }

        return filtered;
    };

    const prepareVitalSignsChart = () => {
        const filtered = getFilteredActivities();
        const vitalRecords = filtered.filter(r => r.activityType === 'vital');

        return vitalRecords
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
            .map((record, index) => {
                const date = record.timestamp;
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
        const filtered = getFilteredActivities();
        const labRecords = filtered.filter(r => r.activityType === 'lab');

        const groupedByDateTime: { [key: string]: { [testType: string]: number } } = {};

        labRecords.forEach(result => {
            const date = result.timestamp;
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

    const vitalSignsData = roleFilter === 'POLI_LAB' ? prepareVitalSignsChart() : [];
    const labChartData = roleFilter === 'POLI_LAB' ? prepareLabChart() : [];
    
    const uniqueTestTypes = roleFilter === 'POLI_LAB' 
        ? Array.from(new Set(getFilteredActivities().filter(a => a.activityType === 'lab').map(result => result.testType)))
        : [];

    useEffect(() => {
        if (roleFilter === 'POLI_LAB') {
            const initialFilter: { [key: string]: boolean } = {};
            uniqueTestTypes.forEach(type => {
                initialFilter[type] = true;
            });
            setChartFilter(initialFilter);
        }
    }, [roleFilter, allActivities]);

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

    const groupActivitiesByDate = () => {
        const filtered = getFilteredActivities();
        const groups: { [key: string]: any[] } = {};

        filtered.forEach(activity => {
            const dateKey = activity.timestamp.toISOString().split('T')[0];
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(activity);
        });

        return groups;
    };

    const toggleDateExpansion = (dateKey: string) => {
        setExpandedDates(prev => ({
            ...prev,
            [dateKey]: !prev[dateKey]
        }));
    };

    const getRoleBadgeColor = (role: string) => {
        const roleMap: { [key: string]: string } = {
            'DOKTER_SPESIALIS': 'text-blue-700 bg-blue-50 border-blue-200',
            'DOKTER_POLI': 'bg-blue-500 text-white',
            'PERAWAT_RUANGAN': 'text-teal-700 bg-teal-50 border-teal-200',
            'PERAWAT_POLI': 'text-cyan-700 bg-cyan-50 border-cyan-200',
            'PERAWAT': 'bg-green-500 text-white',
            'AHLI_GIZI': 'text-green-700 bg-green-50 border-green-200',
            'FARMASI': 'text-emerald-700 bg-emerald-50 border-emerald-200',
            'LABORATORIUM': 'text-purple-700 bg-purple-50 border-purple-200',
            'ADMINISTRASI': 'text-gray-700 bg-gray-50 border-gray-200'
        };
        return roleMap[role] || 'bg-gray-600 text-white';
    };

    const renderPoliLabView = () => {
        const filtered = getFilteredActivities();
        
        const groupedByDate: {
            [key: string]: {
                complaints: any[];
                vitals: any[];
                labs: any[];
            }
        } = {};

        filtered.forEach(activity => {
            const dateKey = activity.timestamp.toISOString().split('T')[0];
            if (!groupedByDate[dateKey]) {
                groupedByDate[dateKey] = { complaints: [], vitals: [], labs: [] };
            }

            if (activity.activityType === 'complaint') {
                groupedByDate[dateKey].complaints.push(activity);
            } else if (activity.activityType === 'vital') {
                groupedByDate[dateKey].vitals.push(activity);
            } else if (activity.activityType === 'lab') {
                groupedByDate[dateKey].labs.push(activity);
            }
        });

        const renderComplaintsSection = (complaints: any[]) => {
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
                                        {complaint.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {complaint.metadata?.severity && (
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                            complaint.metadata.severity === 'BERAT' ? 'bg-red-100 text-red-800' :
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

        const renderVitalSignsTable = (vitals: any[]) => {
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
                                                    {vital.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${getRoleBadgeColor(vital.role)}`}>
                                                    {vital.role.replace(/_/g, ' ')}
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
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Petugas</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Suhu</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Nadi</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">TD</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">SpO2</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">RR</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {vitals.map(vital => {
                                        const metadata = vital.metadata || {};
                                        return (
                                            <tr key={vital.id} className="hover:bg-gray-50">
                                                <td className="px-3 py-2 text-xs text-gray-900 font-medium">
                                                    {vital.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${getRoleBadgeColor(vital.role)}`}>
                                                        {vital.role.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Thermometer className="h-3 w-3 text-blue-500" />
                                                        <span className="text-xs text-gray-900 font-semibold">
                                                            {vital.temperature || '-'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Heart className="h-3 w-3 text-red-500" />
                                                        <span className="text-xs text-gray-900 font-semibold">
                                                            {vital.heartRate || '-'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Activity className="h-3 w-3 text-purple-500" />
                                                        <span className="text-xs text-gray-900 font-semibold">
                                                            {vital.bloodPressure || '-'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Droplets className="h-3 w-3 text-emerald-500" />
                                                        <span className="text-xs text-gray-900 font-semibold">
                                                            {metadata.oxygenSaturation || '-'}
                                                        </span>
                                                    </div>
                                                </td>
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
                                                    {vital.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
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

        const renderLabResultsTable = (labs: any[]) => {
            if (labs.length === 0) return null;

            const labsByType: { [key: string]: any[] } = {};
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
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Petugas</th>
                                    {testTypes.map(testType => (
                                        <th key={testType} className="px-3 py-2 text-center text-xs font-medium text-gray-700 min-w-[120px]">
                                            {testType}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {Array.from(new Set(labs.map(l => l.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })))).map(time => {
                                    const labsAtTime = labs.filter(l => l.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) === time);
                                    const firstLab = labsAtTime[0];

                                    return (
                                        <tr key={time} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 text-xs text-gray-900 font-medium sticky left-0 bg-white">
                                                {time}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${getRoleBadgeColor(firstLab.role)}`}>
                                                    {firstLab.role.replace(/_/g, ' ')}
                                                </span>
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
                                                            <span className={`text-[10px] font-semibold ${
                                                                lab.status === 'CRITICAL' ? 'text-red-700' :
                                                                lab.status === 'HIGH' ? 'text-orange-700' :
                                                                lab.status === 'LOW' ? 'text-yellow-700' :
                                                                'text-green-700'
                                                            }`}>
                                                                {lab.status === 'CRITICAL' ? 'KRITIS' :
                                                                 lab.status === 'HIGH' ? 'TINGGI' :
                                                                 lab.status === 'LOW' ? 'RENDAH' : 'NORMAL'}
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

        return (
            <div className="space-y-6">
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
                                <Line type="monotone" dataKey="suhu" stroke="#3b82f6" strokeWidth={2} name="Suhu" dot={{ fill: '#3b82f6', r: 4 }} connectNulls />
                                <Line type="monotone" dataKey="nadi" stroke="#ef4444" strokeWidth={2} name="Nadi" dot={{ fill: '#ef4444', r: 4 }} connectNulls />
                                <Line type="monotone" dataKey="tekananDarah" stroke="#8b5cf6" strokeWidth={2} name="TD Sistolik" dot={{ fill: '#8b5cf6', r: 4 }} connectNulls />
                                <Line type="monotone" dataKey="spo2" stroke="#10b981" strokeWidth={2} name="SpO2" dot={{ fill: '#10b981', r: 4 }} connectNulls />
                                <Line type="monotone" dataKey="rr" stroke="#f59e0b" strokeWidth={2} name="RR" dot={{ fill: '#f59e0b', r: 4 }} connectNulls />
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
                            {Object.keys(groupedByDate).length} hari pemeriksaan
                        </span>
                    </div>

                    <div className="p-6">
                        {Object.keys(groupedByDate).length > 0 ? (
                            <div className="space-y-4">
                                {Object.keys(groupedByDate)
                                    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
                                    .map(dateKey => {
                                        const data = groupedByDate[dateKey];
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
                                                                {data.complaints.length} keluhan {data.vitals.length} vital signs {data.labs.length} hasil lab
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
                                    })}
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

    const renderActivitiesTable = (activities: any[]) => {
        const groupedByType: { [key: string]: any[] } = {};

        activities.forEach(activity => {
            if (!groupedByType[activity.activityType]) {
                groupedByType[activity.activityType] = [];
            }
            groupedByType[activity.activityType].push(activity);
        });

        return (
            <div className="space-y-4">
                {Object.entries(groupedByType).map(([type, items]) => (
                    <div key={type} className="bg-white rounded-lg border-2 border-gray-300 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Waktu</th>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Petugas</th>

                                        {type === 'complaint' && (
                                            <>
                                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Keluhan</th>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Tingkat</th>
                                            </>
                                        )}

                                        {type === 'vital' && (
                                            <>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">TD</th>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Nadi</th>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Suhu</th>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">RR</th>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">SpO2</th>
                                            </>
                                        )}

                                        {type === 'lab' && (
                                            <>
                                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Test</th>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Hasil</th>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Normal</th>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Status</th>
                                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Catatan</th>
                                            </>
                                        )}

                                        {type === 'searb' && (
                                            <>
                                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Risiko 10 Tahun</th>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Level</th>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Umur</th>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">TD Sistolik</th>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Kolesterol</th>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Merokok</th>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Diabetes</th>
                                            </>
                                        )}

                                        {type === 'handled' && (
                                            <>
                                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Diagnosis</th>
                                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Treatment Plan</th>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Prioritas</th>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Status</th>
                                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Instruksi Khusus</th>
                                            </>
                                        )}

                                        {type === 'visitation' && (
                                            <>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Shift</th>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">TD</th>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Suhu</th>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Nadi</th>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">RR</th>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">SpO2</th>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">GDS</th>
                                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Obat Diberikan</th>
                                            </>
                                        )}

                                        {type === 'nutrition' && (
                                            <>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Target Kalori</th>
                                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Diet Plan</th>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Kepatuhan</th>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Perubahan BB</th>
                                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Rekomendasi</th>
                                            </>
                                        )}

                                        {type === 'pharmacy' && (
                                            <>
                                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Daftar Obat</th>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Total Item</th>
                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-700">Status</th>
                                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Catatan</th>
                                            </>
                                        )}

                                        {type === 'medical-report' && (
                                            <>
                                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Jenis Laporan</th>
                                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Keluhan Utama</th>
                                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Diagnosis</th>
                                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-700">Dokter</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {items.map((activity, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 text-xs font-bold text-gray-900 whitespace-nowrap">
                                                {activity.timestamp.toLocaleTimeString('id-ID', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${getRoleBadgeColor(activity.role)}`}>
                                                    {activity.role.replace(/_/g, ' ')}
                                                </span>
                                            </td>

                                            {type === 'complaint' && (
                                                <>
                                                    <td className="px-3 py-2 text-sm text-gray-900">{activity.content}</td>
                                                    <td className="px-3 py-2 text-center">
                                                        {activity.metadata?.severity && (
                                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${activity.metadata.severity === 'BERAT' ? 'bg-red-600 text-white' :
                                                                activity.metadata.severity === 'SEDANG' ? 'bg-yellow-600 text-white' :
                                                                    'bg-green-600 text-white'
                                                                }`}>
                                                                {activity.metadata.severity}
                                                            </span>
                                                        )}
                                                    </td>
                                                </>
                                            )}

                                            {type === 'vital' && (
                                                <>
                                                    <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">
                                                        {activity.bloodPressure || '-'}
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">
                                                        {activity.heartRate || '-'}
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">
                                                        {activity.temperature || '-'}
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">
                                                        {activity.metadata?.respiratoryRate || '-'}
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">
                                                        {activity.metadata?.oxygenSaturation || '-'}
                                                    </td>
                                                </>
                                            )}

                                            {type === 'lab' && (
                                                <>
                                                    <td className="px-3 py-2 text-sm font-bold text-gray-900">{activity.testType}</td>
                                                    <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">{activity.value}</td>
                                                    <td className="px-3 py-2 text-center text-xs text-gray-600">{activity.normalRange}</td>
                                                    <td className="px-3 py-2 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${activity.status === 'CRITICAL' ? 'bg-red-600 text-white' :
                                                            activity.status === 'HIGH' ? 'bg-orange-600 text-white' :
                                                                activity.status === 'LOW' ? 'bg-yellow-600 text-white' :
                                                                    'bg-green-600 text-white'
                                                            }`}>
                                                            {activity.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-xs text-gray-900">
                                                        {activity.notes || '-'}
                                                    </td>
                                                </>
                                            )}

                                            {type === 'searb' && (
                                                <>
                                                    <td className="px-3 py-2 text-sm font-bold text-gray-900">
                                                        {activity.searBData?.range || '-'}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${activity.searBData?.level === 'Sangat Tinggi' ? 'bg-red-900 text-white' :
                                                            activity.searBData?.level === 'Tinggi' ? 'bg-red-600 text-white' :
                                                                activity.searBData?.level === 'Sedang' ? 'bg-orange-600 text-white' :
                                                                    activity.searBData?.level === 'Rendah' ? 'bg-yellow-600 text-white' :
                                                                        'bg-green-600 text-white'
                                                            }`}>
                                                            {activity.searBData?.level || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">
                                                        {activity.searBData?.age || '-'} tahun
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">
                                                        {activity.bloodPressure?.split('/')[0] || '-'} mmHg
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">
                                                        {activity.searBData?.cholesterolMmol || '-'} mmol/L
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${activity.searBData?.isSmoker ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                                                            }`}>
                                                            {activity.searBData?.isSmoker ? 'Ya' : 'Tidak'}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${activity.searBData?.hasDiabetes ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                                                            }`}>
                                                            {activity.searBData?.hasDiabetes ? 'Ya' : 'Tidak'}
                                                        </span>
                                                    </td>
                                                </>
                                            )}

                                            {type === 'handled' && (
                                                <>
                                                    <td className="px-3 py-2 text-sm text-gray-900">{activity.diagnosis || '-'}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 max-w-xs">
                                                        {activity.treatmentPlan || '-'}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${activity.priority === 'URGENT' ? 'bg-red-600 text-white' :
                                                            activity.priority === 'HIGH' ? 'bg-orange-600 text-white' :
                                                                activity.priority === 'NORMAL' ? 'bg-green-600 text-white' :
                                                                    'bg-gray-600 text-white'
                                                            }`}>
                                                            {activity.priority}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${activity.status === 'SELESAI' ? 'bg-green-600 text-white' :
                                                            activity.status === 'SEDANG_DITANGANI' ? 'bg-blue-600 text-white' :
                                                                'bg-yellow-600 text-white'
                                                            }`}>
                                                            {activity.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-xs text-gray-900 max-w-xs">
                                                        {activity.specialInstructions || '-'}
                                                    </td>
                                                </>
                                            )}

                                            {type === 'visitation' && (
                                                <>
                                                    <td className="px-3 py-2 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${activity.shift === 'PAGI' ? 'bg-orange-600 text-white' :
                                                            activity.shift === 'SORE' ? 'bg-yellow-600 text-white' :
                                                                'bg-purple-600 text-white'
                                                            }`}>
                                                            {activity.shift}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">
                                                        {activity.bloodPressure || '-'}
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">
                                                        {activity.temperature || '-'}
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">
                                                        {activity.heartRate || '-'}
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">
                                                        {activity.respiratoryRate || '-'}
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">
                                                        {activity.oxygenSaturation || '-'}
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">
                                                        {activity.bloodSugar || '-'}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {activity.medicationsGiven && activity.medicationsGiven.length > 0 ? (
                                                            <ul className="text-xs text-gray-900 space-y-1">
                                                                {activity.medicationsGiven.map((med: string, i: number) => (
                                                                    <li key={i}>{med}</li>
                                                                ))}
                                                            </ul>
                                                        ) : '-'}
                                                    </td>
                                                </>
                                            )}

                                            {type === 'nutrition' && (
                                                <>
                                                    <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">
                                                        {activity.targetCalories} kkal
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900">
                                                        {activity.dietPlan || '-'}
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">
                                                        {activity.complianceScore ? `${activity.complianceScore}%` : '-'}
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">
                                                        {activity.weightChange ? `${activity.weightChange > 0 ? '+' : ''}${activity.weightChange} kg` : '-'}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {activity.recommendations && activity.recommendations.length > 0 ? (
                                                            <ul className="text-xs text-gray-900 space-y-1">
                                                                {activity.recommendations.map((rec: string, i: number) => (
                                                                    <li key={i}>{rec}</li>
                                                                ))}
                                                            </ul>
                                                        ) : '-'}
                                                    </td>
                                                </>
                                            )}

                                            {type === 'pharmacy' && (
                                                <>
                                                    <td className="px-3 py-2">
                                                        {activity.items && activity.items.length > 0 ? (
                                                            <div className="space-y-1">
                                                                {activity.items.map((item: any, i: number) => (
                                                                    <div key={i} className="text-xs text-gray-900">
                                                                        <span className="font-bold">{item.drugName}</span>
                                                                        <span className="text-gray-600 ml-2">x{item.quantity}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : '-'}
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-sm font-bold text-gray-900">
                                                        {activity.items?.length || 0} item
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${activity.status === 'COMPLETED' ? 'bg-green-600 text-white' :
                                                            'bg-yellow-600 text-white'
                                                            }`}>
                                                            {activity.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-xs text-gray-900">
                                                        {activity.notes || '-'}
                                                    </td>
                                                </>
                                            )}

                                            {type === 'medical-report' && (
                                                <>
                                                    <td className="px-3 py-2 text-sm text-gray-900">
                                                        {activity.reportType?.replace(/_/g, ' ')}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900">
                                                        {activity.chiefComplaint || '-'}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900">{activity.diagnosis}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-900">
                                                        {activity.doctor?.name || '-'}
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {type === 'searb' && (
                            <div className="mt-4 bg-linear-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 p-4">
                                <details className="cursor-pointer">
                                    <summary className="font-semibold text-gray-900 text-sm flex items-center gap-2 hover:text-blue-600 transition-colors">
                                        <TrendingUp className="h-4 w-4 text-blue-600" />
                                        Panduan Membaca Chart WHO SEAR B
                                        <span className="text-xs text-gray-500 ml-auto">(klik untuk lihat)</span>
                                    </summary>
                                    <div className="mt-4 space-y-3">
                                        <div className="bg-white rounded-lg border border-blue-200 overflow-hidden">
                                            <img
                                                src="/sear-b-chart.png"
                                                alt="WHO SEAR B Risk Assessment Chart"
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="bg-white rounded-lg border border-blue-200 p-3">
                                            <h4 className="font-semibold text-gray-900 text-sm mb-2">Cara Membaca Chart:</h4>
                                            <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
                                                <li><strong>Pilih Chart yang sesuai:</strong> Chart berbeda untuk pasien dengan/tanpa diabetes</li>
                                                <li><strong>Tentukan Gender:</strong> Kolom kiri untuk laki-laki, kanan untuk perempuan</li>
                                                <li><strong>Cari Usia:</strong> Pilih kelompok usia pasien (40, 50, 60, atau 70 tahun)</li>
                                                <li><strong>Kolesterol (Sumbu X):</strong> Cari nilai kolesterol total dalam mmol/L</li>
                                                <li><strong>Tekanan Darah (Sumbu Y):</strong> Cari nilai tekanan darah sistolik dalam mmHg</li>
                                                <li><strong>Lihat Warna Zona:</strong>
                                                    <span className="inline-flex items-center gap-1 ml-1">
                                                        <span className="inline-block w-3 h-3 bg-green-500 rounded"></span>
                                                        <span className="text-[10px]">&lt;10%</span>
                                                        <span className="inline-block w-3 h-3 bg-yellow-500 rounded ml-2"></span>
                                                        <span className="text-[10px]">10-20%</span>
                                                        <span className="inline-block w-3 h-3 bg-orange-500 rounded ml-2"></span>
                                                        <span className="text-[10px]">20-30%</span>
                                                        <span className="inline-block w-3 h-3 bg-red-500 rounded ml-2"></span>
                                                        <span className="text-[10px]">30-40%</span>
                                                        <span className="inline-block w-3 h-3 bg-red-900 rounded ml-2"></span>
                                                        <span className="text-[10px]">&gt;40%</span>
                                                    </span>
                                                </li>
                                            </ol>
                                        </div>
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                            <div className="flex items-start gap-2">
                                                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                                <div className="text-xs text-amber-900">
                                                    <strong>Catatan Penting:</strong> Risiko kardiovaskular adalah estimasi probabilitas pasien mengalami serangan jantung atau stroke dalam 10 tahun ke depan. Semakin tinggi persentase, semakin tinggi risikonya.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </details>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const activitiesByDate = groupActivitiesByDate();

    if (!selectedPatient) {
        return (
            <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center space-x-3">
                    <History className="h-6 w-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Riwayat Sistem</h3>
                </div>

                <div className="p-6">
                    <div className="text-center py-8">
                        <History className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Pilih Pasien</h4>
                        <p className="text-gray-600 mb-6">Pilih pasien dari daftar untuk melihat riwayat sistem lengkap</p>

                        <div className="max-w-2xl mx-auto">
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Cari nama atau nomor RM..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                                    onChange={(e) => {
                                        const searchValue = e.target.value.toLowerCase();
                                        const filtered = patients.filter(p =>
                                            p.name.toLowerCase().includes(searchValue) ||
                                            p.mrNumber.toLowerCase().includes(searchValue)
                                        );
                                    }}
                                />
                            </div>
                            <div className="grid gap-3 max-h-96 overflow-y-auto pr-2">
                                {patients.map((patient) => (
                                    <button
                                        key={patient.id}
                                        onClick={() => onPatientSelect(patient)}
                                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-green-300 transition-colors text-left"
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
                            {patients.length === 0 && (
                                <p className="text-center text-gray-500 mt-4">Tidak ada pasien yang ditemukan</p>
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
                        </div>
                    </div>
                    <button
                        onClick={() => onPatientSelect(null)}
                        className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
                    >
                        Ganti Pasien
                    </button>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-16 text-sm font-medium text-gray-700">Role:</span>
                        {[
                            { key: 'all', label: 'Semua Role' },
                            { key: 'DOKTER', label: 'Dokter' },
                            { key: 'POLI_LAB', label: 'Poli & Lab' },
                            { key: 'PERAWAT_RUANGAN', label: 'Perawat Ruangan' },
                            { key: 'AHLI_GIZI', label: 'Ahli Gizi' },
                            { key: 'FARMASI', label: 'Farmasi' },
                            { key: 'ADMINISTRASI', label: 'Administrasi' },
                            { key: 'SEARB', label: 'SEAR B Risk' },
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setRoleFilter(key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${roleFilter === key
                                    ? 'bg-green-600 text-white shadow-sm'
                                    : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="w-16 text-sm font-medium text-gray-700">Periode:</span>
                            {[
                                { key: 'all', label: 'Semua' },
                                { key: 'today', label: 'Hari Ini' },
                                { key: '7d', label: '7 Hari' },
                                { key: '30d', label: '30 Hari' },
                                { key: '3m', label: '3 Bulan' },
                                { key: '6m', label: '6 Bulan' }
                            ].map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        if (key === 'today') {
                                            const today = new Date().toISOString().split('T')[0];
                                            setDateRange({ startDate: today, endDate: today });
                                            setTimeRange('today');
                                        } else {
                                            setTimeRange(key as any);
                                            setDateRange({ startDate: '', endDate: '' });
                                        }
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${timeRange === key
                                        ? 'bg-green-600 text-white shadow-sm'
                                        : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap mt-2 sm:mt-0">
                            <span className="text-sm font-medium text-gray-700">Tanggal:</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={dateRange.startDate}
                                    onChange={(e) => {
                                        setDateRange({ ...dateRange, startDate: e.target.value });
                                        setTimeRange('all');
                                    }}
                                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                                <span className="text-gray-500 text-xs">s/d</span>
                                <input
                                    type="date"
                                    value={dateRange.endDate}
                                    onChange={(e) => {
                                        setDateRange({ ...dateRange, endDate: e.target.value });
                                        setTimeRange('all');
                                    }}
                                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />

                                {(dateRange.startDate || dateRange.endDate || timeRange !== 'all') && (
                                    <button
                                        onClick={() => {
                                            setTimeRange('all');
                                            setDateRange({ startDate: '', endDate: '' });
                                        }}
                                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {roleFilter === 'POLI_LAB' ? (
                renderPoliLabView()
            ) : (
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                            <History className="h-5 w-5 text-green-600" />
                            <span>Timeline Aktivitas</span>
                        </h3>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500 font-medium">
                                {getFilteredActivities().length} aktivitas
                            </span>
                            <span className="text-sm text-gray-400">|</span>
                            <span className="text-sm text-gray-500 font-medium">
                                {Object.keys(activitiesByDate).length} hari
                            </span>
                        </div>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                                <p className="text-gray-600">Memuat riwayat...</p>
                            </div>
                        ) : Object.keys(activitiesByDate).length > 0 ? (
                            <div className="space-y-4">
                                {Object.keys(activitiesByDate)
                                    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
                                    .map(dateKey => {
                                        const activities = activitiesByDate[dateKey];
                                        const isExpanded = expandedDates[dateKey];
                                        const dateObj = new Date(dateKey);

                                        return (
                                            <div key={dateKey} className="bg-white rounded-lg border-2 border-gray-300 overflow-hidden">
                                                <button
                                                    onClick={() => toggleDateExpansion(dateKey)}
                                                    className="w-full px-6 py-4 bg-linear-to-r from-blue-50 to-green-50 border-b-2 border-gray-300 flex items-center justify-between hover:from-blue-100 hover:to-green-100 transition-colors"
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
                                                            <p className="text-sm text-gray-700 font-medium">
                                                                {activities.length} aktivitas tercatat
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
                                                        {renderActivitiesTable(activities)}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                    <History className="h-8 w-8 text-gray-400" />
                                </div>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">Tidak ada aktivitas</h4>
                                <p className="text-gray-600 mb-1">
                                    {activityFilter !== 'all' || roleFilter !== 'all'
                                        ? 'Tidak ada aktivitas yang sesuai dengan filter'
                                        : 'Belum ada riwayat aktivitas untuk pasien ini'}
                                </p>
                                {(activityFilter !== 'all' || roleFilter !== 'all') && (
                                    <button
                                        onClick={() => {
                                            setActivityFilter('all');
                                            setRoleFilter('all');
                                        }}
                                        className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium"
                                    >
                                        Reset Filter
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemHistoryView;