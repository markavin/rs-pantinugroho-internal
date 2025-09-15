import React, { useState, useEffect } from 'react';
import { Search, Plus, Calendar, Activity, TrendingUp, AlertCircle, FileText, Thermometer, Heart, Droplets, Weight, Clock, Stethoscope, Clipboard, User, Edit3, Save, X, Users, HeartPulse, Menu } from 'lucide-react';
import {
    mockPatients,
    mockAlerts,
    Patient,
    Alert,
    PatientLog,
    Visitation,
    VitalSigns,
    mockPatientLog
} from '@/data/mockData';

interface DashboardStats {
    totalInpatients: number;
    todayVisitations: number;
    vitalSignsRecorded: number;
    highRiskPatients: number;
}

const NurseDashboard = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [patientLogs, setPatientLogs] = useState<PatientLog[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [selectedLog, setSelectedLog] = useState<PatientLog | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'dashboard' | 'inpatients' | 'visitation' | 'vitals' | 'education'>('dashboard');
    const [showVitalInput, setShowVitalInput] = useState(false);
    const [showVisitationForm, setShowVisitationForm] = useState(false);
    const [currentShift, setCurrentShift] = useState<'pagi' | 'sore'>('pagi');
    const [loading, setLoading] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const [stats, setStats] = useState<DashboardStats>({
        totalInpatients: 0,
        todayVisitations: 0,
        vitalSignsRecorded: 0,
        highRiskPatients: 0
    });

    const [vitalInputs, setVitalInputs] = useState<VitalSigns>({
        temperature: '',
        bloodPressure: '',
        heartRate: '',
        respiratoryRate: '',
        oxygenSaturation: '',
        bloodSugar: '',
        weight: '',
        height: ''
    });

    const [visitationForm, setVisitationForm] = useState({
        complaints: '',
        medications: '',
        labResults: '',
        actions: '',
        complications: '',
        education: '',
        notes: ''
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch patients from API
            const patientsResponse = await fetch('/api/dashboard?type=patients');
            if (patientsResponse.ok) {
                const patientsData = await patientsResponse.json();
                const activePatients = patientsData.filter(p => p.status === 'Aktif');
                setPatients(activePatients);
            } else {
                console.error('Failed to fetch patients:', patientsResponse.status);
                const activePatients = mockPatients.filter(p => p.status === 'Aktif');
                setPatients(activePatients);
            }

            // Fetch patient logs from API
            const logsResponse = await fetch('/api/dashboard?type=patient-logs');
            if (logsResponse.ok) {
                const logsData = await logsResponse.json();
                setPatientLogs(logsData);
            } else {
                console.error('Failed to fetch patient logs:', logsResponse.status);
                setPatientLogs(mockPatientLog);
            }

            // Calculate stats
            const totalInpatients = mockPatientLog.length;
            const todayVisitations = mockPatientLog.reduce((acc, log) =>
                acc + log.visitationHistory.filter(v =>
                    v.date === new Date().toLocaleDateString('id-ID')
                ).length, 0
            );
            const vitalSignsRecorded = mockPatientLog.reduce((acc, log) =>
                acc + log.visitationHistory.filter(v =>
                    v.vitalSigns && Object.values(v.vitalSigns).some(val => val !== '')
                ).length, 0
            );
            const highRiskPatients = mockPatients.filter(p => p.riskLevel === 'HIGH').length;

            setStats({
                totalInpatients,
                todayVisitations,
                vitalSignsRecorded,
                highRiskPatients
            });

        } catch (error) {
            console.error('Error fetching data:', error);
            const activePatients = mockPatients.filter(p => p.status === 'Aktif');
            setPatients(activePatients);
            setPatientLogs(mockPatientLog);

            // Calculate stats with mock data
            const totalInpatients = mockPatientLog.length;
            const todayVisitations = mockPatientLog.reduce((acc, log) =>
                acc + log.visitationHistory.filter(v =>
                    v.date === new Date().toLocaleDateString('id-ID')
                ).length, 0
            );
            const vitalSignsRecorded = mockPatientLog.reduce((acc, log) =>
                acc + log.visitationHistory.filter(v =>
                    v.vitalSigns && Object.values(v.vitalSigns).some(val => val !== '')
                ).length, 0
            );
            const highRiskPatients = mockPatients.filter(p => p.riskLevel === 'HIGH').length;

            setStats({
                totalInpatients,
                todayVisitations,
                vitalSignsRecorded,
                highRiskPatients
            });
        } finally {
            setLoading(false);
        }
    };

    const refreshData = async () => {
        const fetchData = async () => {
            try {
                const patientsResponse = await fetch('/api/dashboard?type=patients');
                if (patientsResponse.ok) {
                    const patientsData = await patientsResponse.json();
                    setPatients(patientsData);
                }

            } catch (error) {
                console.error('Error refreshing data:', error);
            }
        };

        await fetchData();
    };
    const [isRefreshing, setIsRefreshing] = useState(false);

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.mrNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleVitalInput = (field: keyof VitalSigns, value: string) => {
        setVitalInputs(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const saveVitalSigns = () => {
        if (selectedPatient) {
            const newVisitation: Visitation = {
                id: Date.now().toString(),
                patientId: selectedPatient.id,
                date: new Date().toLocaleDateString('id-ID'),
                shift: currentShift,
                complaints: '',
                medications: '',
                labResults: '',
                actions: 'Pemeriksaan tanda vital rutin',
                vitalSigns: vitalInputs,
                complications: '',
                education: '',
                notes: `Vital signs checked at ${new Date().toLocaleTimeString('id-ID')}`
            };

            setPatientLogs(prev => prev.map(log =>
                log.patientId === selectedPatient.id
                    ? { ...log, visitationHistory: [...log.visitationHistory, newVisitation] }
                    : log
            ));

            setVitalInputs({
                temperature: '',
                bloodPressure: '',
                heartRate: '',
                respiratoryRate: '',
                oxygenSaturation: '',
                bloodSugar: '',
                weight: '',
                height: ''
            });
            setShowVitalInput(false);
        }
    };

    const saveVisitation = () => {
        if (selectedPatient) {
            const newVisitation: Visitation = {
                id: Date.now().toString(),
                patientId: selectedPatient.id,
                date: new Date().toLocaleDateString('id-ID'),
                shift: currentShift,
                complaints: visitationForm.complaints,
                medications: visitationForm.medications,
                labResults: visitationForm.labResults,
                actions: visitationForm.actions,
                vitalSigns: vitalInputs,
                complications: visitationForm.complications,
                education: visitationForm.education,
                notes: visitationForm.notes
            };

            setPatientLogs(prev => prev.map(log =>
                log.patientId === selectedPatient.id
                    ? { ...log, visitationHistory: [...log.visitationHistory, newVisitation] }
                    : log
            ));

            setVisitationForm({
                complaints: '',
                medications: '',
                labResults: '',
                actions: '',
                complications: '',
                education: '',
                notes: ''
            });
            setShowVisitationForm(false);
        }
    };

    const getPatientLog = (patientId: string) => {
        return patientLogs.find(log => log.patientId === patientId);
    };

    const handleTabChange = (tab: 'dashboard' | 'inpatients' | 'visitation' | 'vitals' | 'education') => {
        setActiveTab(tab);
        setIsMobileSidebarOpen(false); // Close sidebar when tab is selected
    };

    // Navigation items
    const navigationItems = [
        { key: 'dashboard', label: 'Dashboard', icon: Activity },
        { key: 'inpatients', label: 'Daftar Pasien', icon: User },
        { key: 'visitation', label: 'Log Visitasi', icon: Clipboard },
        { key: 'vitals', label: 'Tanda Vital', icon: HeartPulse },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Sidebar Overlay */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-m font-semibold text-gray-900">Menu Perawat Ruangan</h2>
                    <button
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Sidebar Navigation */}
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
                {/* Mobile Header with Menu Button and Shift Selector */}
                <div className="flex items-center justify-between mb-4 lg:hidden">
                    <button
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        <Menu className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                        onClick={async () => {
                            setIsRefreshing(true);
                            await refreshData();
                            setIsRefreshing(false);
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

                {/* Desktop Header */}
                <div className="hidden lg:flex items-center justify-end mb-6">
                    <div className="flex items-center justify-center md:justify-end space-x-2 md:space-x-3">
                        <button
                            onClick={async () => {
                                setIsRefreshing(true);
                                await refreshData();
                                setIsRefreshing(false);
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
                </div>


                {/* Navigation Tabs - Desktop Only */}
                <div className="bg-white rounded-lg shadow-sm mb-6 hidden lg:block">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-50 px-3 sm:px-6 justify-center overflow-x-auto">
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

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-8">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                                <div className="bg-gradient-to-br from-white to-blue-50 p-4 sm:p-6 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-blue-600">Pasien Rawat Inap</p>
                                            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{stats.totalInpatients}</p>
                                        </div>
                                        <div className="bg-blue-100 p-3 rounded-full">
                                            <User className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-white to-green-50 p-4 sm:p-6 rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-green-600">Visitasi Hari Ini</p>
                                            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{stats.todayVisitations}</p>
                                        </div>
                                        <div className="bg-green-100 p-3 rounded-full">
                                            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-white to-yellow-50 p-4 sm:p-6 rounded-xl shadow-sm border border-yellow-100 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-yellow-600">Vital Signs</p>
                                            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{stats.vitalSignsRecorded}</p>
                                        </div>
                                        <div className="bg-yellow-100 p-3 rounded-full">
                                            <Stethoscope className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-white to-red-50 p-4 sm:p-6 rounded-xl shadow-sm border border-red-100 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-red-600">Perlu Perhatian</p>
                                            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{stats.highRiskPatients}</p>
                                        </div>
                                        <div className="bg-red-100 p-3 rounded-full">
                                            <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recent Activity */}
                        <div className="bg-white rounded-lg shadow-sm">
                            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h3>
                            </div>
                            <div className="p-4 sm:p-6">
                                {loading ? (
                                    <div className="text-center text-gray-500">Memuat data...</div>
                                ) : patientLogs.length > 0 ? (
                                    <div className="space-y-4">
                                        {patientLogs.slice(0, 5).map((log) => {
                                            const patient = patients.find(p => p.id === log.patientId);
                                            if (!patient) return null;

                                            return (
                                                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <User className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{patient.name}</p>
                                                            <p className="text-sm text-gray-500">{patient.mrNumber} • {log.roomNumber}-{log.bedNumber}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-500">Masuk: {log.admissionDate}</p>
                                                        <p className="text-xs text-gray-400">{log.diagnosis}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500 py-8">
                                        Belum ada data pasien
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Inpatients Tab */}
                {activeTab === 'inpatients' && (
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <h3 className="text-lg font-semibold text-gray-900">Daftar Pasien</h3>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            placeholder="Cari pasien..."
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-full md:w-64 text-gray-700"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                    </div>
                                    {/* <button
                                            onClick={() => setShowAddPatient(true)}
                                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Pasien Baru
                                        </button> */}
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {patientLogs.map((log) => {
                                const patient = patients.find(p => p.id === log.patientId);
                                if (!patient) return null;

                                return (
                                    <div key={log.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-4">
                                                    <div className="bg-blue-100 p-2 rounded-lg">
                                                        <User className="h-6 w-6 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                                                        <p className="text-sm text-gray-600">{patient.mrNumber} • {log.roomNumber}-{log.bedNumber}</p>
                                                        <p className="text-xs text-gray-500">Masuk: {log.admissionDate}</p>
                                                    </div>
                                                </div>

                                                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-500">DIAGNOSIS</p>
                                                        <p className="text-sm text-gray-900">{log.diagnosis}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-500">KOMORBID</p>
                                                        <p className="text-sm text-gray-900">{log.comorbidities.join(', ') || '-'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-500">ALERGI</p>
                                                        <p className="text-sm text-red-600">{log.allergies.join(', ') || 'Tidak ada'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <div className="text-right mr-4">
                                                    <p className="text-sm  text-gray-700 font-medium">GDS: {patient.bloodSugar.value}</p>
                                                    <p className={`text-xs px-2 py-1 rounded-full ${patient.riskLevel === 'HIGH' ? 'bg-red-100 text-red-800' :
                                                        patient.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-green-100 text-green-800'
                                                        }`}>
                                                        {patient.riskLevel}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setSelectedPatient(patient);
                                                        setSelectedLog(log);
                                                    }}
                                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                                >
                                                    Detail
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Visitation Tab */}
                {activeTab === 'visitation' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm">
                            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Log Visitasi</h3>
                                {selectedPatient && (
                                    <button
                                        onClick={() => setShowVisitationForm(true)}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span>Tambah Visitasi</span>
                                    </button>
                                )}
                            </div>

                            {!selectedPatient ? (
                                <div className="px-4 sm:px-6 py-12 text-center">
                                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">Pilih pasien dari daftar untuk melihat log visitasi</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {selectedLog?.visitationHistory.map((visit) => (
                                        <div key={visit.id} className="px-4 sm:px-6 py-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{visit.date} - Shift {visit.shift}</h4>
                                                    <p className="text-sm text-gray-600">{visit.notes}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${visit.shift === 'pagi' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                                                    }`}>
                                                    {visit.shift.toUpperCase()}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                {visit.complaints && (
                                                    <div>
                                                        <p className="font-medium text-gray-700">Keluhan:</p>
                                                        <p className="text-gray-600">{visit.complaints}</p>
                                                    </div>
                                                )}
                                                {visit.actions && (
                                                    <div>
                                                        <p className="font-medium text-gray-700">Tindakan:</p>
                                                        <p className="text-gray-600">{visit.actions}</p>
                                                    </div>
                                                )}
                                                {visit.labResults && (
                                                    <div>
                                                        <p className="font-medium text-gray-700">Hasil Lab:</p>
                                                        <p className="text-gray-600">{visit.labResults}</p>
                                                    </div>
                                                )}
                                                {visit.education && (
                                                    <div>
                                                        <p className="font-medium text-gray-700">Edukasi:</p>
                                                        <p className="text-gray-600">{visit.education}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )) || (
                                            <div className="px-4 sm:px-6 py-8 text-center text-gray-500">
                                                Belum ada log visitasi untuk pasien ini
                                            </div>
                                        )}
                                </div>
                            )}
                        </div>

                        {/* Visitation Form Modal */}
                        {showVisitationForm && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900">Tambah Log Visitasi</h3>
                                        <p className="text-sm text-gray-600">{selectedPatient?.name} - {selectedPatient?.mrNumber}</p>
                                    </div>

                                    <div className="px-6 py-4 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Edukasi yang Diberikan</label>
                                            <textarea
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                rows={2}
                                                value={visitationForm.education}
                                                onChange={(e) => setVisitationForm({ ...visitationForm, education: e.target.value })}
                                                placeholder="Edukasi yang diberikan kepada pasien..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Tambahan</label>
                                            <textarea
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                rows={2}
                                                value={visitationForm.notes}
                                                onChange={(e) => setVisitationForm({ ...visitationForm, notes: e.target.value })}
                                                placeholder="Catatan tambahan..."
                                            />
                                        </div>
                                    </div>

                                    <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-4">
                                        <button
                                            onClick={() => setShowVisitationForm(false)}
                                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={saveVisitation}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            Simpan Visitasi
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Vitals Tab */}
                {activeTab === 'vitals' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm">
                            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Pemeriksaan Tanda Vital</h3>
                                {selectedPatient && (
                                    <button
                                        onClick={() => setShowVitalInput(true)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span>Input Vital Signs</span>
                                    </button>
                                )}
                            </div>

                            {!selectedPatient ? (
                                <div className="px-4 sm:px-6 py-12 text-center">
                                    <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">Pilih pasien untuk melakukan pemeriksaan tanda vital</p>
                                </div>
                            ) : (
                                <div className="p-4 sm:p-6">
                                    <div className="mb-6">
                                        <h4 className="font-medium text-gray-900 mb-2">{selectedPatient.name}</h4>
                                        <p className="text-sm text-gray-600">{selectedPatient.mrNumber}</p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-red-50 p-4 rounded-lg text-center">
                                            <Thermometer className="h-8 w-8 text-red-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-red-700">{selectedPatient.vitalSigns.temperature}°C</p>
                                            <p className="text-xs text-red-600">Suhu</p>
                                        </div>

                                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                                            <Heart className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-blue-700">{selectedPatient.vitalSigns.bloodPressure}</p>
                                            <p className="text-xs text-blue-600">Tekanan Darah</p>
                                        </div>

                                        <div className="bg-green-50 p-4 rounded-lg text-center">
                                            <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-green-700">{selectedPatient.vitalSigns.heartRate} bpm</p>
                                            <p className="text-xs text-green-600">Nadi</p>
                                        </div>

                                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                                            <Weight className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-purple-700">{selectedPatient.vitalSigns.weight} kg</p>
                                            <p className="text-xs text-purple-600">Berat Badan</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Vital Signs Input Modal */}
                        {showVitalInput && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900">Input Tanda Vital</h3>
                                        <p className="text-sm text-gray-600">{selectedPatient?.name}</p>
                                    </div>

                                    <div className="px-6 py-4 space-y-4">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Suhu (°C)</label>
                                                <div className="relative">
                                                    <Thermometer className="absolute left-3 top-3 h-4 w-4 text-red-500" />
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                        placeholder="36.5"
                                                        value={vitalInputs.temperature}
                                                        onChange={(e) => handleVitalInput('temperature', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Tekanan Darah</label>
                                                <div className="relative">
                                                    <Heart className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                                                    <input
                                                        type="text"
                                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                        placeholder="120/80"
                                                        value={vitalInputs.bloodPressure}
                                                        onChange={(e) => handleVitalInput('bloodPressure', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Nadi (bpm)</label>
                                                <div className="relative">
                                                    <Activity className="absolute left-3 top-3 h-4 w-4 text-green-500" />
                                                    <input
                                                        type="number"
                                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                        placeholder="75"
                                                        value={vitalInputs.heartRate}
                                                        onChange={(e) => handleVitalInput('heartRate', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Pernapasan</label>
                                                <input
                                                    type="number"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    placeholder="20"
                                                    value={vitalInputs.respiratoryRate}
                                                    onChange={(e) => handleVitalInput('respiratoryRate', e.target.value)}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">SpO2 (%)</label>
                                                <input
                                                    type="number"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    placeholder="98"
                                                    value={vitalInputs.oxygenSaturation}
                                                    onChange={(e) => handleVitalInput('oxygenSaturation', e.target.value)}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">GDS (mg/dL)</label>
                                                <input
                                                    type="number"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    placeholder="120"
                                                    value={vitalInputs.bloodSugar}
                                                    onChange={(e) => handleVitalInput('bloodSugar', e.target.value)}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Berat Badan (kg)</label>
                                                <div className="relative">
                                                    <Weight className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                        placeholder="65"
                                                        value={vitalInputs.weight}
                                                        onChange={(e) => handleVitalInput('weight', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Tinggi Badan (cm)</label>
                                                <input
                                                    type="number"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    placeholder="170"
                                                    value={vitalInputs.height}
                                                    onChange={(e) => handleVitalInput('height', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-4">
                                        <button
                                            onClick={() => setShowVitalInput(false)}
                                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={saveVitalSigns}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Simpan Vital Signs
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Education Tab */}
                {activeTab === 'education' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm">
                            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Edukasi Pasien</h3>
                            </div>

                            {!selectedPatient ? (
                                <div className="px-4 sm:px-6 py-12 text-center">
                                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">Pilih pasien untuk memberikan edukasi</p>
                                </div>
                            ) : (
                                <div className="p-4 sm:p-6">
                                    <div className="mb-6">
                                        <h4 className="font-medium text-gray-900 mb-2">{selectedPatient.name}</h4>
                                        <p className="text-sm text-gray-600">{selectedPatient.mrNumber}</p>
                                        <p className="text-sm text-gray-600">Diagnosis: {selectedLog?.diagnosis}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <h5 className="font-medium text-blue-900 mb-3">Edukasi Diet & Nutrisi</h5>
                                            <ul className="space-y-2 text-sm text-blue-800">
                                                <li className="flex items-start">
                                                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-2"></span>
                                                    Konsumsi makanan rendah gula dan tinggi serat
                                                </li>
                                                <li className="flex items-start">
                                                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-2"></span>
                                                    Makan dalam porsi kecil tapi sering (5-6x sehari)
                                                </li>
                                                <li className="flex items-start">
                                                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-2"></span>
                                                    Hindari makanan manis dan berlemak tinggi
                                                </li>
                                                <li className="flex items-start">
                                                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-2"></span>
                                                    Konsumsi air putih minimal 8 gelas per hari
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <h5 className="font-medium text-green-900 mb-3">Edukasi Pengobatan</h5>
                                            <ul className="space-y-2 text-sm text-green-800">
                                                <li className="flex items-start">
                                                    <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-2"></span>
                                                    Minum obat sesuai jadwal yang ditentukan
                                                </li>
                                                <li className="flex items-start">
                                                    <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-2"></span>
                                                    Jangan menghentikan obat tanpa konsultasi dokter
                                                </li>
                                                <li className="flex items-start">
                                                    <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-2"></span>
                                                    Simpan obat di tempat yang tepat dan kering
                                                </li>
                                                <li className="flex items-start">
                                                    <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-2"></span>
                                                    Periksa tanggal kadaluarsa obat secara rutin
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="bg-purple-50 p-4 rounded-lg">
                                            <h5 className="font-medium text-purple-900 mb-3">Monitoring Mandiri</h5>
                                            <ul className="space-y-2 text-sm text-purple-800">
                                                <li className="flex items-start">
                                                    <span className="inline-block w-2 h-2 bg-purple-600 rounded-full mt-2 mr-2"></span>
                                                    Cek gula darah sesuai jadwal yang ditetapkan
                                                </li>
                                                <li className="flex items-start">
                                                    <span className="inline-block w-2 h-2 bg-purple-600 rounded-full mt-2 mr-2"></span>
                                                    Catat hasil pemeriksaan dalam buku harian
                                                </li>
                                                <li className="flex items-start">
                                                    <span className="inline-block w-2 h-2 bg-purple-600 rounded-full mt-2 mr-2"></span>
                                                    Periksa kaki setiap hari untuk luka atau kelainan
                                                </li>
                                                <li className="flex items-start">
                                                    <span className="inline-block w-2 h-2 bg-purple-600 rounded-full mt-2 mr-2"></span>
                                                    Timbang berat badan secara rutin
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="bg-orange-50 p-4 rounded-lg">
                                            <h5 className="font-medium text-orange-900 mb-3">Aktivitas Fisik</h5>
                                            <ul className="space-y-2 text-sm text-orange-800">
                                                <li className="flex items-start">
                                                    <span className="inline-block w-2 h-2 bg-orange-600 rounded-full mt-2 mr-2"></span>
                                                    Olahraga ringan 30 menit, 3-5x per minggu
                                                </li>
                                                <li className="flex items-start">
                                                    <span className="inline-block w-2 h-2 bg-orange-600 rounded-full mt-2 mr-2"></span>
                                                    Mulai dengan jalan kaki atau senam diabetes
                                                </li>
                                                <li className="flex items-start">
                                                    <span className="inline-block w-2 h-2 bg-orange-600 rounded-full mt-2 mr-2"></span>
                                                    Hindari olahraga berlebihan tanpa konsultasi
                                                </li>
                                                <li className="flex items-start">
                                                    <span className="inline-block w-2 h-2 bg-orange-600 rounded-full mt-2 mr-2"></span>
                                                    Bawa permen untuk antisipasi hipoglikemia
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 bg-red-50 rounded-lg">
                                        <h5 className="font-medium text-red-900 mb-3">Tanda Bahaya - Segera ke RS</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-red-800">
                                            <ul className="space-y-2">
                                                <li className="flex items-start">
                                                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 mr-2" />
                                                    Gula darah {">"} 300 mg/dL atau {"<"} 60 mg/dL
                                                </li>
                                                <li className="flex items-start">
                                                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 mr-2" />
                                                    Mual, muntah, dan lemas berlebihan
                                                </li>
                                            </ul>
                                            <ul className="space-y-2">
                                                <li className="flex items-start">
                                                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 mr-2" />
                                                    Luka yang tidak sembuh-sembuh
                                                </li>
                                                <li className="flex items-start">
                                                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 mr-2" />
                                                    Gangguan penglihatan mendadak
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NurseDashboard;