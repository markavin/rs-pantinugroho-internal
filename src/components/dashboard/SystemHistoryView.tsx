import React, { useState, useEffect } from 'react';
import {
    History, User, Calendar, Activity, ChevronDown, ChevronUp,
    FileText, Pill, Utensils, FlaskConical, Stethoscope,
    ClipboardList, Heart, Thermometer, TrendingUp, AlertCircle,
    UserCheck, Syringe, Apple
} from 'lucide-react';

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

type ActivityType = 'all' | 'complaints' | 'vitals' | 'labs' | 'handled' | 'visitations' | 'nutrition' | 'pharmacy' | 'medical-reports';

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

    useEffect(() => {
        if (selectedPatient) {
            fetchAllSystemHistory(selectedPatient.id);
        }
    }, [selectedPatient]);

    const fetchAllSystemHistory = async (patientId: string) => {
        setLoading(true);
        try {
            console.log('Fetching system history for patient:', patientId);

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
                fetch(`/api/patient-records?patientId=${patientId}&type=COMPLAINTS`).catch(() => null),
                fetch(`/api/patient-records?patientId=${patientId}&type=VITAL_SIGNS`).catch(() => null),
                fetch(`/api/lab-results?patientId=${patientId}`).catch(() => null),
                fetch(`/api/handled-patients?patientId=${patientId}`).catch(() => null),
                fetch(`/api/visitations?patientId=${patientId}`).catch(() => null),
                fetch(`/api/nutrition-records?patientId=${patientId}`).catch(() => null),
                fetch(`/api/drug-transactions?patientId=${patientId}`).catch(() => null),
                fetch(`/api/medical-reports?patientId=${patientId}`).catch(() => null)
            ]);

            const complaints = complaintsRes?.ok ? await complaintsRes.json() : [];
            const vitalsFromRecords = vitalsRes?.ok ? await vitalsRes.json() : [];
            const labs = labsRes?.ok ? await labsRes.json() : [];
            const handled = handledRes?.ok ? await handledRes.json() : [];
            const visitations = visitationsRes?.ok ? await visitationsRes.json() : [];
            const nutrition = nutritionRes?.ok ? await nutritionRes.json() : [];
            const pharmacy = pharmacyRes?.ok ? await pharmacyRes.json() : [];
            const medicalReports = medicalReportsRes?.ok ? await medicalReportsRes.json() : [];

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

            const combined = [
                ...complaints.map((c: any) => ({
                    ...c,
                    activityType: 'complaint',
                    timestamp: new Date(c.createdAt),
                    role: 'ADMINISTRASI'
                })),
                ...vitalsFromRecords.map((v: any) => ({
                    ...v,
                    activityType: 'vital',
                    timestamp: new Date(v.createdAt),
                    role: 'PERAWAT_POLI'
                })),
                ...labs.map((l: any) => ({
                    ...l,
                    activityType: 'lab',
                    timestamp: new Date(l.testDate || l.createdAt),
                    role: 'PERAWAT_POLI'
                })),
                ...handled.map((h: any) => ({
                    ...h,
                    activityType: 'handled',
                    timestamp: new Date(h.handledDate),
                    role: h.handler?.role || 'DOKTER_SPESIALIS'
                })),
                ...visitations.map((v: any) => ({
                    ...v,
                    activityType: 'visitation',
                    timestamp: new Date(v.createdAt),
                    role: 'PERAWAT_RUANGAN'
                })),
                ...nutrition.map((n: any) => ({
                    ...n,
                    activityType: 'nutrition',
                    timestamp: new Date(n.createdAt),
                    role: 'AHLI_GIZI'
                })),
                ...pharmacy.map((p: any) => ({
                    ...p,
                    activityType: 'pharmacy',
                    timestamp: new Date(p.createdAt),
                    role: 'FARMASI'
                })),
                ...medicalReports.map((m: any) => ({
                    ...m,
                    activityType: 'medical-report',
                    timestamp: new Date(m.createdAt),
                    role: 'DOKTER_SPESIALIS'
                }))
            ];

            combined.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

            console.log('Total combined activities:', combined.length);

            setAllActivities(combined);
        } catch (error) {
            console.error('Error fetching system history:', error);
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
            'ADMINISTRASI': 'text-gray-700 bg-gray-50 border-gray-200'
        };
        return roleMap[role] || 'bg-gray-600 text-white';
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
                                        // Update filtered list in state if needed
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

                    {/* Baris Role */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-16 text-sm font-medium text-gray-700">Role:</span>
                        {[
                            { key: 'all', label: 'Semua Role' },
                            { key: 'DOKTER', label: 'Dokter' },
                            { key: 'PERAWAT_POLI', label: 'Perawat Poli' },
                            { key: 'PERAWAT_RUANGAN', label: 'Perawat Ruangan' },
                            { key: 'AHLI_GIZI', label: 'Ahli Gizi' },
                            { key: 'FARMASI', label: 'Farmasi' },
                            { key: 'ADMINISTRASI', label: 'Administrasi' },
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

                        {/* Periode */}
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

                        {/* Tanggal */}
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

                                {/* 🔁 Reset semua filter */}
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
                                                className="w-full px-6 py-4 bg-gradient-to-r from-blue-50 to-green-50 border-b-2 border-gray-300 flex items-center justify-between hover:from-blue-100 hover:to-green-100 transition-colors"
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
        </div>
    );
};

export default SystemHistoryView;