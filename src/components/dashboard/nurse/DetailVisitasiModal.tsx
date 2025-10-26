import React, { useState } from 'react';
import { X, Activity, Pill, FileText, Utensils, Calculator, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Visitation {
    id: string;
    patientId: string;
    nurseId: string;
    shift: 'PAGI' | 'SORE' | 'MALAM';
    temperature?: number | null;
    bloodPressure?: string | null;
    heartRate?: number | null;
    respiratoryRate?: number | null;
    oxygenSaturation?: number | null;
    bloodSugar?: number | null;
    weight?: number | null;
    height?: number | null;
    medicationsGiven: string[];
    education?: string | null;
    complications?: string | null;
    notes?: string | null;
    dietCompliance?: number | null;
    dietIssues?: string | null;
    energyRequirement?: number | null;
    calculatedBMI?: number | null;
    calculatedBBI?: number | null;
    basalMetabolicRate?: number | null;
    activityLevel?: string | null;
    stressLevel?: string | null;
    stressFactor?: number | null;
    nutritionStatus?: string | null;
    energyCalculationDetail?: any;
    createdAt: Date | string;
    patient?: {
        id: string;
        name: string;
        mrNumber: string;
    };
    nurse?: {
        id: string;
        name: string;
    };
}

interface DetailVisitasiModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: string | null;
    visitations: Visitation[];
}

type FilterType = 'all' | 'vital' | 'medication' | 'education' | 'diet' | 'energy';

const DetailVisitasiModal: React.FC<DetailVisitasiModalProps> = ({
    isOpen,
    onClose,
    patientId,
    visitations
}) => {
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '3m' | '6m' | 'all'>('30d');
    const [expandedDates, setExpandedDates] = useState<{ [key: string]: boolean }>({});
    const [vitalChartFilter, setVitalChartFilter] = useState<{
        suhu: boolean;
        nadi: boolean;
        tekananDarah: boolean;
        spo2: boolean;
        gds: boolean;
        rr: boolean;
    }>({
        suhu: true,
        nadi: true,
        tekananDarah: true,
        spo2: true,
        gds: true,
        rr: true,
    });

    if (!isOpen || !patientId || visitations.length === 0) return null;

    const patientInfo = visitations[0]?.patient;

    // Helper functions
    const hasVitalSigns = (visit: Visitation) => {
        return !!(visit.temperature || visit.bloodPressure || visit.heartRate ||
            visit.respiratoryRate || visit.oxygenSaturation || visit.bloodSugar);
    };

    const hasMedication = (visit: Visitation) => {
        return !!(visit.medicationsGiven && visit.medicationsGiven.length > 0);
    };

    const hasEducation = (visit: Visitation) => {
        return !!visit.education;
    };

    const hasDiet = (visit: Visitation) => {
        return !!(visit.dietCompliance !== null || visit.dietIssues);
    };

    const hasEnergy = (visit: Visitation) => {
        return !!visit.energyRequirement;
    };

    // Filter visitations by date and type
    const getFilteredVisitations = () => {
        let filtered = visitations;

        if (selectedDate) {
            filtered = filtered.filter(v => {
                const visitDate = new Date(v.createdAt).toISOString().split('T')[0];
                return visitDate === selectedDate;
            });
        }

        if (filterType === 'vital') {
            filtered = filtered.filter(v => hasVitalSigns(v));
        } else if (filterType === 'medication') {
            filtered = filtered.filter(v => hasMedication(v));
        } else if (filterType === 'education') {
            filtered = filtered.filter(v => hasEducation(v));
        } else if (filterType === 'diet') {
            filtered = filtered.filter(v => hasDiet(v));
        } else if (filterType === 'energy') {
            filtered = filtered.filter(v => hasEnergy(v));
        }

        return filtered;
    };

    const filteredVisitations = getFilteredVisitations();

    // Group visitations by date
    const groupVisitationsByDate = () => {
        const groups: { [key: string]: Visitation[] } = {};

        filteredVisitations.forEach(visit => {
            const dateKey = new Date(visit.createdAt).toISOString().split('T')[0];
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(visit);
        });

        // Sort visits within each day by time
        Object.keys(groups).forEach(dateKey => {
            groups[dateKey].sort((a, b) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
        });

        return groups;
    };

    const visitationsByDate = groupVisitationsByDate();

    // Filter data by time range for charts
    const getFilteredDataByTimeRange = (data: Visitation[]) => {
        const now = new Date();
        const ranges = {
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000,
            '3m': 90 * 24 * 60 * 60 * 1000,
            '6m': 180 * 24 * 60 * 60 * 1000,
            'all': Infinity
        };

        const rangeMs = ranges[timeRange];

        return data.filter(visit => {
            const visitDate = new Date(visit.createdAt);
            return (now.getTime() - visitDate.getTime()) <= rangeMs;
        });
    };

    // Prepare chart data for vital signs
    const prepareVitalSignsChart = () => {
        const dataWithVitals = visitations.filter(v => hasVitalSigns(v));
        const filteredByTime = getFilteredDataByTimeRange(dataWithVitals);

        return filteredByTime
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map((visit, index) => {
                const date = new Date(visit.createdAt);
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
                    suhu: visit.temperature ?? null,
                    nadi: visit.heartRate ?? null,
                    tekananDarah: visit.bloodPressure ? parseInt(visit.bloodPressure.split('/')[0]) : null,
                    tekananDarahFull: visit.bloodPressure ?? null,
                    spo2: visit.oxygenSaturation ?? null,
                    gds: visit.bloodSugar ?? null,
                    rr: visit.respiratoryRate ?? null,
                };
            });
    };

    // Prepare chart data for energy
    const prepareEnergyChart = () => {
        const dataWithEnergy = visitations.filter(v => hasEnergy(v));
        const filteredByTime = getFilteredDataByTimeRange(dataWithEnergy);

        return filteredByTime
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map(visit => ({
                date: new Date(visit.createdAt).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: '2-digit',
                    year: timeRange === '3m' || timeRange === '6m' || timeRange === 'all' ? '2-digit' : undefined
                }),
                fullDate: new Date(visit.createdAt).toLocaleDateString('id-ID'),
                energi: visit.energyRequirement || null,
                bmr: visit.basalMetabolicRate || null,
            }));
    };

    // Prepare chart data for diet compliance
    const prepareDietChart = () => {
        const dataWithDiet = visitations.filter(v => hasDiet(v) && v.dietCompliance !== null);
        const filteredByTime = getFilteredDataByTimeRange(dataWithDiet);

        return filteredByTime
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map(visit => ({
                date: new Date(visit.createdAt).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: '2-digit',
                    year: timeRange === '3m' || timeRange === '6m' || timeRange === 'all' ? '2-digit' : undefined
                }),
                fullDate: new Date(visit.createdAt).toLocaleDateString('id-ID'),
                kepatuhan: visit.dietCompliance || null,
            }));
    };

    const vitalSignsData = prepareVitalSignsChart();
    const energyData = prepareEnergyChart();
    const dietData = prepareDietChart();

    // Toggle date expansion
    const toggleDateExpansion = (dateKey: string) => {
        setExpandedDates(prev => ({
            ...prev,
            [dateKey]: !prev[dateKey]
        }));
    };

    // Render comparison table for vital signs
    const renderVitalSignsTable = (visits: Visitation[]) => {
        const visitsWithVitals = visits.filter(v => hasVitalSigns(v));
        if (visitsWithVitals.length === 0) return null;

        return (
            <div className="bg-white rounded-lg border border-blue-200 overflow-hidden mb-4">
                <div className="bg-blue-50 px-4 py-2 bor	der-b border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Perbandingan Vital Signs
                    </h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Waktu</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Shift</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Suhu (°C)</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Nadi (bpm)</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">TD</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">SpO2 (%)</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">GDS (mg/dL)</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">RR (x/mnt)</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Perawat</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {visitsWithVitals.map(visit => (
                                <tr key={visit.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 text-xs text-gray-900">
                                        {new Date(visit.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-3 py-2">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${visit.shift === 'PAGI' ? 'bg-orange-100 text-orange-800' :
                                            visit.shift === 'SORE' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-purple-100 text-purple-800'
                                            }`}>
                                            {visit.shift}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-center text-xs text-gray-900 font-medium">
                                        {visit.temperature || '-'}
                                    </td>
                                    <td className="px-3 py-2 text-center text-xs text-gray-900 font-medium">
                                        {visit.heartRate || '-'}
                                    </td>
                                    <td className="px-3 py-2 text-center text-xs text-gray-900 font-medium">
                                        {visit.bloodPressure || '-'}
                                    </td>
                                    <td className="px-3 py-2 text-center text-xs text-gray-900 font-medium">
                                        {visit.oxygenSaturation || '-'}
                                    </td>
                                    <td className="px-3 py-2 text-center text-xs text-gray-900 font-medium">
                                        {visit.bloodSugar || '-'}
                                    </td>
                                    <td className="px-3 py-2 text-center text-xs text-gray-900 font-medium">
                                        {visit.respiratoryRate || '-'}
                                    </td>
                                    <td className="px-3 py-2 text-xs text-gray-600">
                                        {visit.nurse?.name || 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // Render comparison table for medications
    const renderMedicationsTable = (visits: Visitation[]) => {
        const visitsWithMeds = visits.filter(v => hasMedication(v));
        if (visitsWithMeds.length === 0) return null;

        return (
            <div className="bg-white rounded-lg border border-green-200 overflow-hidden mb-4">
                <div className="bg-green-50 px-4 py-2 border-b border-green-200">
                    <h4 className="text-sm font-semibold text-green-900 flex items-center gap-2">
                        <Pill className="h-4 w-4" />
                        Obat yang Diberikan
                    </h4>
                </div>
                <div className="p-4 space-y-3">
                    {visitsWithMeds.map(visit => (
                        <div key={visit.id} className="border-l-4 border-green-500 pl-3">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-gray-900">
                                    {new Date(visit.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${visit.shift === 'PAGI' ? 'bg-orange-100 text-orange-800' :
                                    visit.shift === 'SORE' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-purple-100 text-purple-800'
                                    }`}>
                                    {visit.shift}
                                </span>
                            </div>
                            <ul className="space-y-1">
                                {visit.medicationsGiven.map((med, idx) => (
                                    <li key={idx} className="flex items-center text-sm text-gray-900">
                                        <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                                        {med}
                                    </li>
                                ))}
                            </ul>
                            <p className="text-xs text-gray-500 mt-1">Perawat: {visit.nurse?.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Render comparison for education
    const renderEducationSection = (visits: Visitation[]) => {
        const visitsWithEducation = visits.filter(v => hasEducation(v));
        if (visitsWithEducation.length === 0) return null;

        return (
            <div className="bg-white rounded-lg border border-purple-200 overflow-hidden mb-4">
                <div className="bg-purple-50 px-4 py-2 border-b border-purple-200">
                    <h4 className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Edukasi yang Diberikan
                    </h4>
                </div>
                <div className="p-4 space-y-3">
                    {visitsWithEducation.map(visit => (
                        <div key={visit.id} className="border-l-4 border-purple-500 pl-3">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-gray-900">
                                    {new Date(visit.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${visit.shift === 'PAGI' ? 'bg-orange-100 text-orange-800' :
                                    visit.shift === 'SORE' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-purple-100 text-purple-800'
                                    }`}>
                                    {visit.shift}
                                </span>
                            </div>
                            <p className="text-sm text-gray-900 whitespace-pre-wrap">{visit.education}</p>
                            <p className="text-xs text-gray-500 mt-1">Perawat: {visit.nurse?.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Render comparison table for diet
    const renderDietTable = (visits: Visitation[]) => {
        const visitsWithDiet = visits.filter(v => hasDiet(v));
        if (visitsWithDiet.length === 0) return null;

        return (
            <div className="bg-white rounded-lg border border-orange-200 overflow-hidden mb-4">
                <div className="bg-orange-50 px-4 py-2 border-b border-orange-200">
                    <h4 className="text-sm font-semibold text-orange-900 flex items-center gap-2">
                        <Utensils className="h-4 w-4" />
                        Monitoring Diet
                    </h4>
                </div>
                <div className="p-4 space-y-3">
                    {visitsWithDiet.map(visit => (
                        <div key={visit.id} className="border-l-4 border-orange-500 pl-3">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-900">
                                        {new Date(visit.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${visit.shift === 'PAGI' ? 'bg-orange-100 text-orange-800' :
                                        visit.shift === 'SORE' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-purple-100 text-purple-800'
                                        }`}>
                                        {visit.shift}
                                    </span>
                                </div>
                                {visit.dietCompliance !== null && (
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${visit.dietCompliance >= 80 ? 'bg-green-100 text-green-700' :
                                        visit.dietCompliance >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {visit.dietCompliance}%
                                    </span>
                                )}
                            </div>
                            {visit.dietCompliance !== null && (
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                    <div
                                        className={`h-2 rounded-full ${visit.dietCompliance >= 80 ? 'bg-green-500' :
                                            visit.dietCompliance >= 60 ? 'bg-yellow-500' :
                                                'bg-red-500'
                                            }`}
                                        style={{ width: `${visit.dietCompliance}%` }}
                                    ></div>
                                </div>
                            )}
                            {visit.dietIssues && (
                                <p className="text-sm text-gray-900 mt-2">
                                    <span className="font-medium">Kendala:</span> {visit.dietIssues}
                                </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Perawat: {visit.nurse?.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Render comparison table for energy
    const renderEnergyTable = (visits: Visitation[]) => {
        const visitsWithEnergy = visits.filter(v => hasEnergy(v));
        if (visitsWithEnergy.length === 0) return null;

        return (
            <div className="bg-white rounded-lg border border-indigo-200 overflow-hidden mb-4">
                <div className="bg-indigo-50 px-4 py-2 border-b border-indigo-200">
                    <h4 className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Perhitungan Energi
                    </h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Waktu</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Shift</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">Total Energi (kkal)</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">BMR (kkal)</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">BBI (kg)</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Aktivitas</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">Status Gizi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {visitsWithEnergy.map(visit => (
                                <tr key={visit.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 text-xs text-gray-900">
                                        {new Date(visit.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-3 py-2">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${visit.shift === 'PAGI' ? 'bg-orange-100 text-orange-800' :
                                            visit.shift === 'SORE' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-purple-100 text-purple-800'
                                            }`}>
                                            {visit.shift}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-center text-sm text-indigo-900 font-bold">
                                        {visit.energyRequirement}
                                    </td>
                                    <td className="px-3 py-2 text-center text-xs text-gray-900 font-medium">
                                        {visit.basalMetabolicRate || '-'}
                                    </td>
                                    <td className="px-3 py-2 text-center text-xs text-gray-900 font-medium">
                                        {visit.calculatedBBI || '-'}
                                    </td>
                                    <td className="px-3 py-2 text-xs text-gray-900 capitalize">
                                        {visit.activityLevel || '-'}
                                    </td>
                                    <td className="px-3 py-2 text-xs text-gray-900">
                                        {visit.nutritionStatus || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // Toggle vital chart filter
    const toggleVitalChartFilter = (key: keyof typeof vitalChartFilter) => {
        setVitalChartFilter(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Toggle all vital signs
    const toggleAllVitalSigns = () => {
        const allActive = Object.values(vitalChartFilter).every(v => v);
        const newState = !allActive;
        setVitalChartFilter({
            suhu: newState,
            nadi: newState,
            tekananDarah: newState,
            spo2: newState,
            gds: newState,
            rr: newState,
        });
    };

    // Render chart based on filter type
    const renderChart = () => {
        if (filterType === 'vital' && vitalSignsData.length > 0) {
            return (
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            <h4 className="text-sm font-semibold text-gray-900">
                                Tren Vital Signs - {
                                    timeRange === '7d' ? '7 Hari Terakhir' :
                                        timeRange === '30d' ? '30 Hari Terakhir' :
                                            timeRange === '3m' ? '3 Bulan Terakhir' :
                                                timeRange === '6m' ? '6 Bulan Terakhir' :
                                                    'Semua Data'
                                }
                            </h4>
                        </div>
                        <span className="text-xs text-gray-500">{vitalSignsData.length} titik data</span>
                    </div>

                    {/* Filter Kategori Vital Signs */}
                    <div className="mb-4 flex flex-wrap gap-2">
                        <button
                            onClick={toggleAllVitalSigns}
                            className="px-3 py-1 rounded-lg text-xs font-medium transition-colors bg-gray-600 text-white hover:bg-gray-700"
                        >
                            {Object.values(vitalChartFilter).every(v => v) ? 'Sembunyikan Semua' : 'Tampilkan Semua'}
                        </button>
                        <button
                            onClick={() => toggleVitalChartFilter('suhu')}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${vitalChartFilter.suhu
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                                }`}
                        >
                            Suhu
                        </button>
                        <button
                            onClick={() => toggleVitalChartFilter('nadi')}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${vitalChartFilter.nadi
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                                }`}
                        >
                            Nadi
                        </button>
                        <button
                            onClick={() => toggleVitalChartFilter('tekananDarah')}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${vitalChartFilter.tekananDarah
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                                }`}
                        >
                            Tekanan Darah
                        </button>
                        <button
                            onClick={() => toggleVitalChartFilter('spo2')}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${vitalChartFilter.spo2
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                                }`}
                        >
                            SpO2
                        </button>
                        <button
                            onClick={() => toggleVitalChartFilter('gds')}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${vitalChartFilter.gds
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                                }`}
                        >
                            GDS
                        </button>
                        <button
                            onClick={() => toggleVitalChartFilter('rr')}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${vitalChartFilter.rr
                                ? 'bg-pink-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                                }`}
                        >
                            RR
                        </button>
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
                                contentStyle={{ fontSize: '12px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}
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

                            {vitalChartFilter.suhu && (
                                <Line
                                    type="monotone"
                                    dataKey="suhu"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    name="Suhu (°C)"
                                    dot={{ fill: '#3b82f6', r: 4 }}
                                    connectNulls
                                />
                            )}
                            {vitalChartFilter.nadi && (
                                <Line
                                    type="monotone"
                                    dataKey="nadi"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    name="Nadi (bpm)"
                                    dot={{ fill: '#ef4444', r: 4 }}
                                    connectNulls
                                />
                            )}
                            {vitalChartFilter.tekananDarah && (
                                <Line
                                    type="monotone"
                                    dataKey="tekananDarah"
                                    stroke="#8b5cf6"
                                    strokeWidth={2}
                                    name="TD Sistolik"
                                    dot={{ fill: '#8b5cf6', r: 4 }}
                                    connectNulls
                                />
                            )}
                            {vitalChartFilter.spo2 && (
                                <Line
                                    type="monotone"
                                    dataKey="spo2"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    name="SpO2 (%)"
                                    dot={{ fill: '#10b981', r: 4 }}
                                    connectNulls
                                />
                            )}
                            {vitalChartFilter.gds && (
                                <Line
                                    type="monotone"
                                    dataKey="gds"
                                    stroke="#f59e0b"
                                    strokeWidth={2}
                                    name="GDS (mg/dL)"
                                    dot={{ fill: '#f59e0b', r: 4 }}
                                    connectNulls
                                />
                            )}
                            {vitalChartFilter.rr && (
                                <Line
                                    type="monotone"
                                    dataKey="rr"
                                    stroke="#ec4899"
                                    strokeWidth={2}
                                    name="RR (x/mnt)"
                                    dot={{ fill: '#ec4899', r: 4 }}
                                    connectNulls
                                />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            );
        }

        if (filterType === 'energy' && energyData.length > 0) {
            return (
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-indigo-600" />
                            <h4 className="text-sm font-semibold text-gray-900">
                                Tren Kebutuhan Energi - {
                                    timeRange === '7d' ? '7 Hari Terakhir' :
                                        timeRange === '30d' ? '30 Hari Terakhir' :
                                            timeRange === '3m' ? '3 Bulan Terakhir' :
                                                timeRange === '6m' ? '6 Bulan Terakhir' :
                                                    'Semua Data'
                                }
                            </h4>
                        </div>
                        <span className="text-xs text-gray-500">{energyData.length} titik data</span>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={energyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#6b7280" />
                            <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" />
                            <Tooltip
                                contentStyle={{ fontSize: '12px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}
                                labelStyle={{ fontWeight: 'bold' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} iconType="line" />
                            <Line type="monotone" dataKey="energi" stroke="#6366f1" strokeWidth={2} name="Total Energi (kkal)" dot={{ fill: '#6366f1', r: 4 }} connectNulls />
                            <Line type="monotone" dataKey="bmr" stroke="#8b5cf6" strokeWidth={2} name="BMR (kkal)" dot={{ fill: '#8b5cf6', r: 4 }} connectNulls />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            );
        }

        if (filterType === 'diet' && dietData.length > 0) {
            return (
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-orange-600" />
                            <h4 className="text-sm font-semibold text-gray-900">
                                Tren Kepatuhan Diet - {
                                    timeRange === '7d' ? '7 Hari Terakhir' :
                                        timeRange === '30d' ? '30 Hari Terakhir' :
                                            timeRange === '3m' ? '3 Bulan Terakhir' :
                                                timeRange === '6m' ? '6 Bulan Terakhir' :
                                                    'Semua Data'
                                }
                            </h4>
                        </div>
                        <span className="text-xs text-gray-500">{dietData.length} titik data</span>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={dietData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#6b7280" />
                            <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" domain={[0, 100]} />
                            <Tooltip
                                contentStyle={{ fontSize: '12px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}
                                labelStyle={{ fontWeight: 'bold' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} iconType="line" />
                            <Line type="monotone" dataKey="kepatuhan" stroke="#f59e0b" strokeWidth={2} name="Kepatuhan (%)" dot={{ fill: '#f59e0b', r: 4 }} connectNulls />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            );
        }

        return null;
    };

    // Render daily group
    const renderDailyGroup = (dateKey: string, visits: Visitation[]) => {
        const isExpanded = expandedDates[dateKey];
        const dateObj = new Date(dateKey);

        return (
            <div key={dateKey} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Date Header */}
                <button
                    onClick={() => toggleDateExpansion(dateKey)}
                    className="w-full px-6 py-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200 flex items-center justify-between hover:from-green-100 hover:to-blue-100 transition-colors"
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
                                {visits.length} visitasi • {visits.map(v => v.shift).join(', ')}
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
                        {/* Render based on filter type */}
                        {filterType === 'all' && (
                            <>
                                {renderVitalSignsTable(visits)}
                                {renderMedicationsTable(visits)}
                                {renderEducationSection(visits)}
                                {renderDietTable(visits)}
                                {renderEnergyTable(visits)}

                                {/* Additional info sections */}
                                {visits.some(v => v.complications) && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                        <h4 className="text-sm font-semibold text-red-900 mb-2">Komplikasi</h4>
                                        {visits.filter(v => v.complications).map(visit => (
                                            <div key={visit.id} className="mb-2 last:mb-0">
                                                <p className="text-xs text-gray-600 mb-1">
                                                    {new Date(visit.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {visit.shift}
                                                </p>
                                                <p className="text-sm text-red-800">{visit.complications}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {visits.some(v => v.notes) && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h4 className="text-sm font-semibold text-blue-900 mb-2">Catatan</h4>
                                        {visits.filter(v => v.notes).map(visit => (
                                            <div key={visit.id} className="mb-2 last:mb-0">
                                                <p className="text-xs text-gray-600 mb-1">
                                                    {new Date(visit.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {visit.shift}
                                                </p>
                                                <p className="text-sm text-blue-800">{visit.notes}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {filterType === 'vital' && renderVitalSignsTable(visits)}
                        {filterType === 'medication' && renderMedicationsTable(visits)}
                        {filterType === 'education' && renderEducationSection(visits)}
                        {filterType === 'diet' && renderDietTable(visits)}
                        {filterType === 'energy' && renderEnergyTable(visits)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* 🧱 HEADER */}
                <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <FileText className="h-6 w-6 text-green-600" />
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Riwayat Visitasi</h3>
                                {patientInfo && (
                                    <p className="text-sm text-gray-600">{patientInfo.name} - {patientInfo.mrNumber}</p>
                                )}
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* ⚙️ FILTER BAR */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        {/* 🗓 Filter Tanggal */}
                        <div className="flex items-center gap-3">
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

                        {/* 🧩 Filter Kategori */}
                        <div className="flex flex-wrap items-center gap-2">
                            {[
                                { key: 'all', label: 'Semua' },
                                { key: 'vital', label: 'Vital Signs', icon: Activity },
                                { key: 'medication', label: 'Obat', icon: Pill },
                                { key: 'education', label: 'Edukasi', icon: FileText },
                                { key: 'diet', label: 'Diet', icon: Utensils },
                                { key: 'energy', label: 'Energi', icon: Calculator },
                            ].map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => setFilterType(key as FilterType)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === key
                                        ? 'bg-green-600 text-white shadow-sm'
                                        : 'bg-white text-gray-700 hover:bg-green-50 border border-gray-200'
                                        }`}
                                >
                                    {Icon && <Icon className="h-4 w-4" />}
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 📊 Filter Rentang Waktu (untuk grafik) */}
                    {(filterType === 'vital' || filterType === 'energy' || filterType === 'diet') && (
                        <div className="flex items-center gap-2 mt-4 flex-wrap">
                            <span className="text-sm font-medium text-gray-700">Rentang Waktu Grafik:</span>
                            {[
                                { key: '7d', label: '7 Hari' },
                                { key: '30d', label: '30 Hari' },
                                { key: '3m', label: '3 Bulan' },
                                { key: '6m', label: '6 Bulan' },
                                { key: 'all', label: 'Semua' },
                            ].map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => setTimeRange(key as any)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${timeRange === key
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ℹ️ Info Text */}
                    <div className="mt-3 text-xs text-gray-500">
                        Menampilkan {filteredVisitations.length} visitasi di {Object.keys(visitationsByDate).length} hari
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* 📈 GRAFIK (Global - muncul di atas semua data) */}
                    {(filterType === 'vital' || filterType === 'energy' || filterType === 'diet') && renderChart()}

                    {/* 📋 DAFTAR VISITASI GROUPED BY DATE */}
                    {filteredVisitations.length > 0 ? (
                        <div className="space-y-4">
                            {Object.keys(visitationsByDate)
                                .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
                                .map(dateKey => renderDailyGroup(dateKey, visitationsByDate[dateKey]))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <p className="font-medium">Tidak ada data visitasi yang sesuai dengan filter</p>
                            <button
                                onClick={() => {
                                    setSelectedDate('');
                                    setFilterType('all');
                                }}
                                className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                            >
                                Reset Semua Filter
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetailVisitasiModal;