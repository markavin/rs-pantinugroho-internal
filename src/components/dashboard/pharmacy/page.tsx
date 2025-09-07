// src/components/dashboard/pharmacy/page.tsx

import React, { useState, useEffect } from 'react';
import { Search, Plus, Pill, AlertTriangle, Users, FileText, Activity, TrendingDown, Clock, AlertCircle, CheckCircle, XCircle, Edit, Trash2, Eye, Save, X, History, TestTube } from 'lucide-react';
import {
    mockPatients,
    mockAlerts,
    dashboardStats,
    Patient,
    Alert,
    Medication
} from '@/data/mockData';

interface DrugData {
    id: string;
    name: string;
    category: string;
    dosageForm: string;
    strength: string;
    manufacturer: string;
    stock: number;
    expiryDate: string;
    interactions: string[];
    contraindications: string[];
    sideEffects: string[];
    indications: string[];
}

interface PatientComplaint {
    id: string;
    patientId: string;
    date: string;
    complaint: string;
    severity: 'MILD' | 'MODERATE' | 'SEVERE';
    status: 'ACTIVE' | 'RESOLVED';
}

interface LabResult {
    id: string;
    patientId: string;
    testType: string;
    value: string;
    normalRange: string;
    date: string;
    status: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL';
}

interface PharmacyNote {
    id: string;
    patientId: string;
    date: string;
    note: string;
    pharmacist: string;
    category: 'MEDICATION' | 'COUNSELING' | 'MONITORING' | 'ADVERSE_REACTION';
}

const PharmacyDashboard = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [activeTab, setActiveTab] = useState<'patients' | 'drugs' | 'complaints' | 'lab-results' | 'notes'>('patients');
    const [showDrugForm, setShowDrugForm] = useState(false);
    const [editingDrug, setEditingDrug] = useState<DrugData | null>(null);
    const [activeFilter, setActiveFilter] = useState<'all' | 'allergies' | 'interactions' | 'high-risk'>('all');

    // Mock data
    const [drugData, setDrugData] = useState<DrugData[]>([
        {
            id: '1',
            name: 'Metformin 500mg',
            category: 'Antidiabetes',
            dosageForm: 'Tablet',
            strength: '500mg',
            manufacturer: 'Dexa Medica',
            stock: 500,
            expiryDate: '2025-12-31',
            interactions: ['Glimepiride', 'Insulin'],
            contraindications: ['Gagal ginjal berat', 'Ketoasidosis diabetik'],
            sideEffects: ['Mual', 'Diare', 'Nyeri perut'],
            indications: ['Diabetes melitus tipe 2']
        },
        {
            id: '2',
            name: 'Glimepiride 2mg',
            category: 'Antidiabetes',
            dosageForm: 'Tablet',
            strength: '2mg',
            manufacturer: 'Novartis',
            stock: 300,
            expiryDate: '2025-08-15',
            interactions: ['Metformin', 'Aspirin'],
            contraindications: ['Diabetes tipe 1', 'Kehamilan'],
            sideEffects: ['Hipoglikemia', 'Pusing', 'Mual'],
            indications: ['Diabetes melitus tipe 2']
        }
    ]);

    const [complaints, setComplaints] = useState<PatientComplaint[]>([
        {
            id: '1',
            patientId: '1',
            date: '2024-08-20',
            complaint: 'Mual setelah minum obat metformin',
            severity: 'MODERATE',
            status: 'ACTIVE'
        },
        {
            id: '2',
            patientId: '2',
            date: '2024-08-18',
            complaint: 'Pusing saat berdiri',
            severity: 'MILD',
            status: 'RESOLVED'
        }
    ]);

    const [labResults, setLabResults] = useState<LabResult[]>([
        {
            id: '1',
            patientId: '1',
            testType: 'HbA1c',
            value: '8.5%',
            normalRange: '<7%',
            date: '2024-08-15',
            status: 'HIGH'
        },
        {
            id: '2',
            patientId: '1',
            testType: 'Kreatinin',
            value: '1.2 mg/dL',
            normalRange: '0.6-1.3 mg/dL',
            date: '2024-08-15',
            status: 'NORMAL'
        }
    ]);

    const [pharmacyNotes, setPharmacyNotes] = useState<PharmacyNote[]>([
        {
            id: '1',
            patientId: '1',
            date: '2024-08-20',
            note: 'Pasien mengalami mual setelah minum metformin. Disarankan minum setelah makan.',
            pharmacist: 'Apt. Sarah',
            category: 'MEDICATION'
        },
        {
            id: '2',
            patientId: '2',
            date: '2024-08-18',
            note: 'Edukasi tentang tanda-tanda hipoglikemia dan cara mengatasinya.',
            pharmacist: 'Apt. Ahmad',
            category: 'COUNSELING'
        }
    ]);

    const [newDrug, setNewDrug] = useState<Partial<DrugData>>({
        name: '',
        category: '',
        dosageForm: '',
        strength: '',
        manufacturer: '',
        stock: 0,
        expiryDate: '',
        interactions: [],
        contraindications: [],
        sideEffects: [],
        indications: []
    });

    useEffect(() => {
        setPatients(mockPatients);
        setAlerts(mockAlerts.filter(alert => alert.category === 'medication'));
    }, []);

    const handleSaveDrug = () => {
        if (editingDrug) {
            setDrugData(prev => prev.map(drug => drug.id === editingDrug.id ? { ...editingDrug } : drug));
            setEditingDrug(null);
        } else {
            const drug: DrugData = {
                id: Date.now().toString(),
                name: newDrug.name || '',
                category: newDrug.category || '',
                dosageForm: newDrug.dosageForm || '',
                strength: newDrug.strength || '',
                manufacturer: newDrug.manufacturer || '',
                stock: newDrug.stock || 0,
                expiryDate: newDrug.expiryDate || '',
                interactions: newDrug.interactions || [],
                contraindications: newDrug.contraindications || [],
                sideEffects: newDrug.sideEffects || [],
                indications: newDrug.indications || []
            };
            setDrugData(prev => [...prev, drug]);
            setNewDrug({});
        }
        setShowDrugForm(false);
    };

    const handleDeleteDrug = (id: string) => {
        setDrugData(prev => prev.filter(drug => drug.id !== id));
    };

    const filteredPatients = patients.filter(patient => {
        const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.mrNumber.toLowerCase().includes(searchTerm.toLowerCase());

        switch (activeFilter) {
            case 'allergies':
                return matchesSearch && patient.allergies && patient.allergies.length > 0;
            case 'interactions':
                return matchesSearch && patient.medications && patient.medications.length > 1;
            case 'high-risk':
                return matchesSearch && patient.riskLevel === 'HIGH';
            default:
                return matchesSearch;
        }
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Farmasi</h1>
                    <p className="text-gray-600">Manajemen obat dan asuhan kefarmasian terintegrasi</p>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 px-6">
                            {[
                                { key: 'patients', label: 'Pasien', icon: Users },
                                { key: 'drugs', label: 'Data Obat', icon: Pill },
                                { key: 'complaints', label: 'Keluhan', icon: AlertCircle },
                                { key: 'lab-results', label: 'Hasil Lab', icon: TestTube },
                                { key: 'notes', label: 'Catatan Asuhan', icon: FileText }
                            ].map(tab => {
                                const IconComponent = tab.icon;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key as any)}
                                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.key
                                                ? 'border-emerald-500 text-emerald-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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

                {/* Patients Tab */}
                {activeTab === 'patients' && (
                    <div className="space-y-6">
                        {/* Search and Filter */}
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Cari pasien..."
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-full"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                </div>

                                <div className="flex gap-2">
                                    {[
                                        { key: 'all', label: 'Semua' },
                                        { key: 'allergies', label: 'Ada Alergi' },
                                        { key: 'interactions', label: 'Interaksi Obat' },
                                        { key: 'high-risk', label: 'Risiko Tinggi' }
                                    ].map(filter => (
                                        <button
                                            key={filter.key}
                                            onClick={() => setActiveFilter(filter.key as any)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === filter.key
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {filter.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Patient List */}
                        <div className="bg-white rounded-lg shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Daftar Pasien</h3>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {filteredPatients.map((patient) => (
                                    <div key={patient.id} className="px-6 py-4 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{patient.name}</p>
                                                        <p className="text-sm text-gray-600">{patient.mrNumber} • {patient.age} tahun • {patient.gender}</p>
                                                    </div>
                                                    {patient.allergies && patient.allergies.length > 0 && (
                                                        <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                                                            ALERGI
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-600">GDS: </span>
                                                        <span className={`font-medium ${patient.bloodSugar.value > 140 ? 'text-red-600' : 'text-green-600'}`}>
                                                            {patient.bloodSugar.value} mg/dL
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Obat Aktif: </span>
                                                        <span className="font-medium">{patient.medications?.length || 0}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Keluhan: </span>
                                                        <span className="font-medium">
                                                            {complaints.filter(c => c.patientId === patient.id && c.status === 'ACTIVE').length}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Risiko: </span>
                                                        <span className={`font-medium ${patient.riskLevel === 'HIGH' ? 'text-red-600' :
                                                                patient.riskLevel === 'MEDIUM' ? 'text-orange-600' : 'text-green-600'
                                                            }`}>
                                                            {patient.riskLevel}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setSelectedPatient(patient)}
                                                className="text-emerald-600 hover:text-emerald-900 text-sm font-medium"
                                            >
                                                Lihat Detail
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Drugs Tab */}
                {activeTab === 'drugs' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Manajemen Data Obat</h3>
                                <button
                                    onClick={() => setShowDrugForm(true)}
                                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Tambah Obat</span>
                                </button>
                            </div>

                            <div className="overflow-x-auto">
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
                                        {drugData.map((drug) => (
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
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{drug.expiryDate}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                                    <button
                                                        onClick={() => setEditingDrug(drug)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteDrug(drug.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Complaints Tab */}
                {activeTab === 'complaints' && (
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Keluhan Pasien</h3>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {complaints.map((complaint) => {
                                const patient = patients.find(p => p.id === complaint.patientId);
                                return (
                                    <div key={complaint.id} className="px-6 py-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <p className="font-medium text-gray-900">{patient?.name}</p>
                                                    <p className="text-sm text-gray-500">{patient?.mrNumber}</p>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${complaint.severity === 'SEVERE' ? 'bg-red-100 text-red-800' :
                                                            complaint.severity === 'MODERATE' ? 'bg-orange-100 text-orange-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {complaint.severity}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 mb-2">{complaint.complaint}</p>
                                                <p className="text-sm text-gray-500">{complaint.date}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${complaint.status === 'ACTIVE' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                {complaint.status}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Lab Results Tab */}
                {activeTab === 'lab-results' && (
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Hasil Laboratorium</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pasien</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hasil</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Normal Range</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {labResults.map((result) => {
                                        const patient = patients.find(p => p.id === result.patientId);
                                        return (
                                            <tr key={result.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{patient?.name}</p>
                                                        <p className="text-sm text-gray-500">{patient?.mrNumber}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.testType}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.value}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.normalRange}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.date}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${result.status === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                                            result.status === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                                                result.status === 'LOW' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-green-100 text-green-800'
                                                        }`}>
                                                        {result.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Pharmacy Notes Tab */}
                {activeTab === 'notes' && (
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Catatan Asuhan Kefarmasian</h3>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {pharmacyNotes.map((note) => {
                                const patient = patients.find(p => p.id === note.patientId);
                                return (
                                    <div key={note.id} className="px-6 py-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-medium text-gray-900">{patient?.name}</p>
                                                <p className="text-sm text-gray-500">{patient?.mrNumber} • {note.date}</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${note.category === 'MEDICATION' ? 'bg-blue-100 text-blue-800' :
                                                        note.category === 'COUNSELING' ? 'bg-green-100 text-green-800' :
                                                            note.category === 'MONITORING' ? 'bg-purple-100 text-purple-800' :
                                                                'bg-red-100 text-red-800'
                                                    }`}>
                                                    {note.category}
                                                </span>
                                                <p className="text-sm text-gray-500">{note.pharmacist}</p>
                                            </div>
                                        </div>
                                        <p className="text-gray-700">{note.note}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Drug Form Modal */}
                {(showDrugForm || editingDrug) && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-90vh overflow-y-auto">
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {editingDrug ? 'Edit Obat' : 'Tambah Obat Baru'}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowDrugForm(false);
                                        setEditingDrug(null);
                                        setNewDrug({});
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="px-6 py-4">
                                <form onSubmit={(e) => { e.preventDefault(); handleSaveDrug(); }}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Obat</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                                value={editingDrug?.name || newDrug.name || ''}
                                                onChange={(e) => editingDrug ?
                                                    setEditingDrug({ ...editingDrug, name: e.target.value }) :
                                                    setNewDrug({ ...newDrug, name: e.target.value })
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                                            <select
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                                value={editingDrug?.category || newDrug.category || ''}
                                                onChange={(e) => editingDrug ?
                                                    setEditingDrug({ ...editingDrug, category: e.target.value }) :
                                                    setNewDrug({ ...newDrug, category: e.target.value })
                                                }
                                            >
                                                <option value="">Pilih kategori</option>
                                                <option value="Antidiabetes">Antidiabetes</option>
                                                <option value="Antihipertensi">Antihipertensi</option>
                                                <option value="Analgesik">Analgesik</option>
                                                <option value="Antibiotik">Antibiotik</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Bentuk Sediaan</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                                value={editingDrug?.dosageForm || newDrug.dosageForm || ''}
                                                onChange={(e) => editingDrug ?
                                                    setEditingDrug({ ...editingDrug, dosageForm: e.target.value }) :
                                                    setNewDrug({ ...newDrug, dosageForm: e.target.value })
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Kekuatan</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                                value={editingDrug?.strength || newDrug.strength || ''}
                                                onChange={(e) => editingDrug ?
                                                    setEditingDrug({ ...editingDrug, strength: e.target.value }) :
                                                    setNewDrug({ ...newDrug, strength: e.target.value })
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Produsen</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                                value={editingDrug?.manufacturer || newDrug.manufacturer || ''}
                                                onChange={(e) => editingDrug ?
                                                    setEditingDrug({ ...editingDrug, manufacturer: e.target.value }) :
                                                    setNewDrug({ ...newDrug, manufacturer: e.target.value })
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Stok</label>
                                            <input
                                                type="number"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                                value={editingDrug?.stock || newDrug.stock || ''}
                                                onChange={(e) => editingDrug ?
                                                    setEditingDrug({ ...editingDrug, stock: parseInt(e.target.value) }) :
                                                    setNewDrug({ ...newDrug, stock: parseInt(e.target.value) })
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Kedaluwarsa</label>
                                            <input
                                                type="date"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                                value={editingDrug?.expiryDate || newDrug.expiryDate || ''}
                                                onChange={(e) => editingDrug ?
                                                    setEditingDrug({ ...editingDrug, expiryDate: e.target.value }) :
                                                    setNewDrug({ ...newDrug, expiryDate: e.target.value })
                                                }
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Indikasi</label>
                                            <textarea
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                                rows={2}
                                                placeholder="Pisahkan dengan koma"
                                                value={editingDrug?.indications.join(', ') || newDrug.indications?.join(', ') || ''}
                                                onChange={(e) => {
                                                    const indications = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                                                    editingDrug ?
                                                        setEditingDrug({ ...editingDrug, indications }) :
                                                        setNewDrug({ ...newDrug, indications });
                                                }}
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Kontraindikasi</label>
                                            <textarea
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                                rows={2}
                                                placeholder="Pisahkan dengan koma"
                                                value={editingDrug?.contraindications.join(', ') || newDrug.contraindications?.join(', ') || ''}
                                                onChange={(e) => {
                                                    const contraindications = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                                                    editingDrug ?
                                                        setEditingDrug({ ...editingDrug, contraindications }) :
                                                        setNewDrug({ ...newDrug, contraindications });
                                                }}
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Efek Samping</label>
                                            <textarea
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                                rows={2}
                                                placeholder="Pisahkan dengan koma"
                                                value={editingDrug?.sideEffects.join(', ') || newDrug.sideEffects?.join(', ') || ''}
                                                onChange={(e) => {
                                                    const sideEffects = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                                                    editingDrug ?
                                                        setEditingDrug({ ...editingDrug, sideEffects }) :
                                                        setNewDrug({ ...newDrug, sideEffects });
                                                }}
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Interaksi Obat</label>
                                            <textarea
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                                rows={2}
                                                placeholder="Pisahkan dengan koma"
                                                value={editingDrug?.interactions.join(', ') || newDrug.interactions?.join(', ') || ''}
                                                onChange={(e) => {
                                                    const interactions = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                                                    editingDrug ?
                                                        setEditingDrug({ ...editingDrug, interactions }) :
                                                        setNewDrug({ ...newDrug, interactions });
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6 flex space-x-3">
                                        <button
                                            type="submit"
                                            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                                        >
                                            <Save className="h-4 w-4" />
                                            <span>Simpan</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowDrugForm(false);
                                                setEditingDrug(null);
                                                setNewDrug({});
                                            }}
                                            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Patient Detail Modal */}
                {selectedPatient && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-90vh overflow-y-auto">
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Asuhan Kefarmasian - {selectedPatient.name}
                                </h3>
                                <button
                                    onClick={() => setSelectedPatient(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="px-6 py-4 space-y-6">
                                {/* Patient Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">No. RM</p>
                                        <p className="text-gray-900">{selectedPatient.mrNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Umur/Gender</p>
                                        <p className="text-gray-900">{selectedPatient.age} tahun / {selectedPatient.gender}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Tipe Diabetes</p>
                                        <p className="text-gray-900">{selectedPatient.diabetesType}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Level Risiko</p>
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${selectedPatient.riskLevel === 'HIGH' ? 'bg-red-100 text-red-800' :
                                                selectedPatient.riskLevel === 'MEDIUM' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-green-100 text-green-800'
                                            }`}>
                                            {selectedPatient.riskLevel}
                                        </span>
                                    </div>
                                </div>

                                {/* Allergies Alert */}
                                {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex items-center mb-2">
                                            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                                            <h4 className="font-semibold text-red-800">PERINGATAN ALERGI</h4>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedPatient.allergies.map((allergy, index) => (
                                                <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                                                    {allergy}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Medications */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-900 flex items-center">
                                            <Pill className="h-5 w-5 mr-2" />
                                            Riwayat Obat
                                        </h4>
                                        <div className="space-y-3 max-h-64 overflow-y-auto">
                                            {selectedPatient.medications && selectedPatient.medications.length > 0 ? (
                                                selectedPatient.medications.map((medication) => (
                                                    <div key={medication.id} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <p className="font-medium text-gray-900">{medication.name}</p>
                                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">AKTIF</span>
                                                        </div>
                                                        <div className="text-sm text-gray-600 space-y-1">
                                                            <p>Dosis: {medication.dosage} - {medication.frequency}</p>
                                                            <p>Mulai: {medication.startDate}</p>
                                                            {medication.endDate && <p>Selesai: {medication.endDate}</p>}
                                                        </div>

                                                        {medication.interactions && medication.interactions.length > 0 && (
                                                            <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                                                                <p className="text-xs font-medium text-orange-800">Potensi Interaksi:</p>
                                                                <p className="text-xs text-orange-700">{medication.interactions.join(', ')}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 text-center py-4">Belum ada riwayat obat</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Complaints */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-900 flex items-center">
                                            <AlertCircle className="h-5 w-5 mr-2" />
                                            Keluhan Terkini
                                        </h4>
                                        <div className="space-y-3 max-h-64 overflow-y-auto">
                                            {complaints.filter(c => c.patientId === selectedPatient.id).map((complaint) => (
                                                <div key={complaint.id} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${complaint.severity === 'SEVERE' ? 'bg-red-100 text-red-800' :
                                                                complaint.severity === 'MODERATE' ? 'bg-orange-100 text-orange-800' :
                                                                    'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {complaint.severity}
                                                        </span>
                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${complaint.status === 'ACTIVE' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                            }`}>
                                                            {complaint.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-700 mb-1">{complaint.complaint}</p>
                                                    <p className="text-xs text-gray-500">{complaint.date}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Lab Results */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-900 flex items-center">
                                            <TestTube className="h-5 w-5 mr-2" />
                                            Hasil Lab Terbaru
                                        </h4>
                                        <div className="space-y-3 max-h-64 overflow-y-auto">
                                            {labResults.filter(r => r.patientId === selectedPatient.id).map((result) => (
                                                <div key={result.id} className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className="font-medium text-gray-900">{result.testType}</p>
                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${result.status === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                                                result.status === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                                                    result.status === 'LOW' ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-green-100 text-green-800'
                                                            }`}>
                                                            {result.status}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-600 space-y-1">
                                                        <p>Hasil: <span className="font-medium">{result.value}</span></p>
                                                        <p>Normal: {result.normalRange}</p>
                                                        <p>Tanggal: {result.date}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Pharmacy Notes */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-900 flex items-center">
                                            <FileText className="h-5 w-5 mr-2" />
                                            Catatan Asuhan Kefarmasian
                                        </h4>
                                        <div className="space-y-3 max-h-64 overflow-y-auto">
                                            {pharmacyNotes.filter(n => n.patientId === selectedPatient.id).map((note) => (
                                                <div key={note.id} className="bg-green-50 p-3 rounded-lg border border-green-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${note.category === 'MEDICATION' ? 'bg-blue-100 text-blue-800' :
                                                                note.category === 'COUNSELING' ? 'bg-green-100 text-green-800' :
                                                                    note.category === 'MONITORING' ? 'bg-purple-100 text-purple-800' :
                                                                        'bg-red-100 text-red-800'
                                                            }`}>
                                                            {note.category}
                                                        </span>
                                                        <p className="text-xs text-gray-500">{note.pharmacist}</p>
                                                    </div>
                                                    <p className="text-sm text-gray-700 mb-1">{note.note}</p>
                                                    <p className="text-xs text-gray-500">{note.date}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Clinical Summary */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-gray-900 mb-3">Kondisi Klinis Saat Ini</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div className="text-center">
                                            <p className={`text-2xl font-bold ${selectedPatient.bloodSugar.value > 140 ? 'text-red-600' : 'text-green-600'}`}>
                                                {selectedPatient.bloodSugar.value}
                                            </p>
                                            <p className="text-gray-600">GDS (mg/dL)</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-blue-600">{selectedPatient.vitalSigns.bloodPressure}</p>
                                            <p className="text-gray-600">Tekanan Darah</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-purple-600">{selectedPatient.bmi}</p>
                                            <p className="text-gray-600">BMI</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-orange-600">{selectedPatient.vitalSigns.weight}</p>
                                            <p className="text-gray-600">Berat (kg)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PharmacyDashboard;