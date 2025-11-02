import React, { useState, useEffect } from 'react';
import { Activity, Users, FileText, TrendingUp, Plus, Search, Menu, X, Clock } from 'lucide-react';
import Visitasi from './Visitasi';
import DaftarPasien from './DaftarPasien';
import SystemHistoryView from '../SystemHistoryView';
import { ChevronLeft, ChevronRight, History as HistoryIcon } from 'lucide-react';

interface DashboardStats {
    totalInpatients: number;
    todayVisitations: number;
    vitalSignsRecorded: number;
    medicationsGiven: number;
    educationProvided: number;
    highRiskPatients: number;
}

const NurseDashboard = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'visitations' | 'system-history'>('dashboard');
    const [patients, setPatients] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [visitationCurrentPage, setVisitationCurrentPage] = useState(1);
    const [visitationItemsPerPage, setVisitationItemsPerPage] = useState(10);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [currentShift, setCurrentShift] = useState<'PAGI' | 'SORE' | 'MALAM'>('PAGI');
    const [loading, setLoading] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [stats, setStats] = useState<DashboardStats>({
        totalInpatients: 0,
        todayVisitations: 0,
        vitalSignsRecorded: 0,
        medicationsGiven: 0,
        educationProvided: 0,
        highRiskPatients: 0
    });
    const [visitationTrend, setVisitationTrend] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();
        determineCurrentShift();
    }, []);

    const determineCurrentShift = () => {
        const hour = new Date().getHours();
        if (hour >= 7 && hour < 14) setCurrentShift('PAGI');
        else if (hour >= 14 && hour < 21) setCurrentShift('SORE');
        else setCurrentShift('MALAM');
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const [patientsRes, visitationsRes] = await Promise.all([
                fetch('/api/patients?activeOnly=true'),
                fetch('/api/visitations')
            ]);

            if (patientsRes.ok && visitationsRes.ok) {
                const patientsData = await patientsRes.json();
                const visitationsData = await visitationsRes.json();

                setPatients(patientsData);

                const today = new Date().toDateString();
                const todayVisits = visitationsData.filter((v: any) =>
                    new Date(v.createdAt).toDateString() === today
                );

                // Helper function to check if visit has vital signs
                const hasVitalSigns = (v: any) => {
                    return !!(v.temperature || v.bloodPressure || v.heartRate ||
                        v.respiratoryRate || v.oxygenSaturation || v.bloodSugar);
                };

                setStats({
                    totalInpatients: patientsData.filter((p: any) => p.status === 'RAWAT_INAP').length,
                    todayVisitations: todayVisits.length,
                    vitalSignsRecorded: todayVisits.filter((v: any) => hasVitalSigns(v)).length,
                    medicationsGiven: todayVisits.filter((v: any) =>
                        v.medicationsGiven && v.medicationsGiven.length > 0
                    ).length,
                    educationProvided: todayVisits.filter((v: any) => v.education).length,
                    highRiskPatients: patientsData.filter((p: any) => p.riskLevel === 'HIGH').length
                });

                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    return date.toDateString();
                }).reverse();

                const trendData = last7Days.map(dateStr => {
                    const dayVisits = visitationsData.filter((v: any) =>
                        new Date(v.createdAt).toDateString() === dateStr
                    );
                    return {
                        date: new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                        vital: dayVisits.filter((v: any) => hasVitalSigns(v)).length,
                        medication: dayVisits.filter((v: any) => v.medicationsGiven && v.medicationsGiven.length > 0).length,
                        education: dayVisits.filter((v: any) => v.education).length
                    };
                });

                setVisitationTrend(trendData);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const navigationItems = [
        { key: 'dashboard', label: 'Dashboard', icon: Activity },
        { key: 'patients', label: 'Daftar Pasien', icon: Users },
        { key: 'visitations', label: 'Visitasi', icon: FileText },
        { key: 'system-history', label: 'Riwayat Sistem', icon: HistoryIcon }
    ];

    const handleTabChange = (tab: 'dashboard' | 'patients' | 'visitations') => {
        setActiveTab(tab);
        setIsMobileSidebarOpen(false);
    };

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
                    <h2 className="text-m font-semibold text-gray-900">Menu Perawat</h2>
                    <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
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
                        onClick={fetchDashboardData}
                        className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm border border-emerald-500 text-sm text-gray-600 hover:bg-emerald-300 transition-colors"
                    >
                        <Activity className="h-4 w-4 mr-2 text-emerald-600" />
                        <span>Refresh</span>
                    </button>
                </div>

                <div className="hidden lg:flex items-center justify-end mb-6">
                    <button
                        onClick={fetchDashboardData}
                        className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-emerald-500 text-sm text-gray-600 hover:bg-emerald-300 transition-colors"
                    >
                        <Activity className="h-4 w-4 mr-2 text-emerald-600" />
                        <span>Refresh Data</span>
                    </button>
                </div>

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

                {activeTab === 'dashboard' && (
                    <div className="space-y-8">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-sm border border-blue-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-blue-600">Rawat Inap</p>
                                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalInpatients}</p>
                                            </div>
                                            <div className="bg-blue-100 p-3 rounded-full">
                                                <Users className="h-8 w-8 text-blue-600" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-white to-purple-50 p-6 rounded-xl shadow-sm border border-purple-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-purple-600">Visitasi Hari Ini</p>
                                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.todayVisitations}</p>
                                            </div>
                                            <div className="bg-purple-100 p-3 rounded-full">
                                                <FileText className="h-8 w-8 text-purple-600" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-white to-red-50 p-6 rounded-xl shadow-sm border border-red-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-red-600">Risiko Tinggi</p>
                                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.highRiskPatients}</p>
                                            </div>
                                            <div className="bg-red-100 p-3 rounded-full">
                                                <TrendingUp className="h-8 w-8 text-red-600" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Breakdown Visitasi Hari Ini</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Vital Signs</span>
                                                <span className="text-lg font-bold text-blue-600">{stats.vitalSignsRecorded}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Pemberian Obat</span>
                                                <span className="text-lg font-bold text-green-600">{stats.medicationsGiven}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Edukasi</span>
                                                <span className="text-lg font-bold text-purple-600">{stats.educationProvided}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tren Visitasi 7 Hari Terakhir</h3>
                                        <div className="space-y-3">
                                            {visitationTrend.map((day, idx) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <span className="text-xs text-gray-600 w-16">{day.date}</span>
                                                    <div className="flex-1 flex gap-1">
                                                        <div className="bg-blue-500 h-6 rounded" style={{ width: `${(day.vital / Math.max(...visitationTrend.map(d => d.vital + d.medication + d.education))) * 100}%` }}></div>
                                                        <div className="bg-green-500 h-6 rounded" style={{ width: `${(day.medication / Math.max(...visitationTrend.map(d => d.vital + d.medication + d.education))) * 100}%` }}></div>
                                                        <div className="bg-purple-500 h-6 rounded" style={{ width: `${(day.education / Math.max(...visitationTrend.map(d => d.vital + d.medication + d.education))) * 100}%` }}></div>
                                                    </div>
                                                    <span className="text-xs text-gray-600 w-8">{day.vital + day.medication + day.education}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                                                <span className='text-gray-600'>Vital</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-green-500 rounded"></div>
                                                <span className='text-gray-600'>Obat</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                                                <span className='text-gray-600'>Edukasi</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-sm p-6 border border-green-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Shortcut ke Visitasi</h3>
                                            <p className="text-sm text-gray-600">Tambah visitasi baru dengan cepat</p>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab('visitations')}
                                            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                                        >
                                            <Plus className="h-5 w-5" />
                                            <span>Tambah Visitasi</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'patients' && <DaftarPasien />}
                {activeTab === 'visitations' && <Visitasi currentShift={currentShift} />}

                {activeTab === 'system-history' && (
                    <SystemHistoryView
                        patients={patients}
                        selectedPatient={selectedPatient}
                        onPatientSelect={(patient: any) => setSelectedPatient(patient)}
                    />
                )}
            </div>
        </div>
    );
};

export default NurseDashboard;