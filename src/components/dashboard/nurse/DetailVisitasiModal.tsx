import React, { useState } from 'react';
import { X, Activity, Pill, FileText, Utensils } from 'lucide-react';
import { Visitation } from './types';

interface DetailVisitasiModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: string | null;
    visitations: Visitation[];
}

const DetailVisitasiModal: React.FC<DetailVisitasiModalProps> = ({
    isOpen,
    onClose,
    patientId,
    visitations
}) => {
    const [activeTab, setActiveTab] = useState<'vital' | 'medication' | 'education' | 'diet'>('vital');

    if (!isOpen || !patientId || visitations.length === 0) return null;

    const patientInfo = visitations[0]?.patient;
    const vitalVisits = visitations.filter(v => v.vitalSigns && Object.keys(v.vitalSigns).length > 0);
    const medicationVisits = visitations.filter(v => v.medicationsGiven && v.medicationsGiven.length > 0);
    const educationVisits = visitations.filter(v => v.education);
    const dietVisits = visitations.filter(v => v.dietCompliance !== null || v.dietIssues);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Riwayat Visitasi</h3>
                            {patientInfo && (
                                <p className="text-sm text-gray-600">{patientInfo.name} - {patientInfo.mrNumber}</p>
                            )}
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex gap-2 mt-4 flex-wrap">
                        <button
                            onClick={() => setActiveTab('vital')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'vital'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Activity className="h-4 w-4" />
                            <span>Vital Signs</span>
                            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-white/20">
                                {vitalVisits.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('medication')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'medication'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Pill className="h-4 w-4" />
                            <span>Obat</span>
                            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-white/20">
                                {medicationVisits.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('education')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'education'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <FileText className="h-4 w-4" />
                            <span>Edukasi</span>
                            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-white/20">
                                {educationVisits.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('diet')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'diet'
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Utensils className="h-4 w-4" />
                            <span>Diet</span>
                            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-white/20">
                                {dietVisits.length}
                            </span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'vital' && (
                        <div className="space-y-4">
                            {vitalVisits.length > 0 ? (
                                vitalVisits.map((visit) => (
                                    <div key={visit.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {new Date(visit.createdAt).toLocaleDateString('id-ID', {
                                                        weekday: 'long',
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                                <span className="text-sm text-gray-600 ml-2">
                                                    {new Date(visit.createdAt).toLocaleTimeString('id-ID', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${visit.shift === 'PAGI' ? 'bg-orange-100 text-orange-800' :
                                                visit.shift === 'SORE' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-purple-100 text-purple-800'
                                                }`}>
                                                Shift {visit.shift}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                            {visit.vitalSigns.temperature && (
                                                <div className="bg-white p-2 rounded">
                                                    <span className="text-gray-600">Suhu:</span>
                                                    <p className="font-medium text-gray-900">{visit.vitalSigns.temperature} C</p>
                                                </div>
                                            )}
                                            {visit.vitalSigns.bloodPressure && (
                                                <div className="bg-white p-2 rounded">
                                                    <span className="text-gray-600">TD:</span>
                                                    <p className="font-medium text-gray-900">{visit.vitalSigns.bloodPressure}</p>
                                                </div>
                                            )}
                                            {visit.vitalSigns.heartRate && (
                                                <div className="bg-white p-2 rounded">
                                                    <span className="text-gray-600">Nadi:</span>
                                                    <p className="font-medium text-gray-900">{visit.vitalSigns.heartRate} bpm</p>
                                                </div>
                                            )}
                                            {visit.vitalSigns.bloodSugar && (
                                                <div className="bg-white p-2 rounded">
                                                    <span className="text-gray-600">GDS:</span>
                                                    <p className="font-medium text-gray-900">{visit.vitalSigns.bloodSugar} mg/dL</p>
                                                </div>
                                            )}
                                            {visit.vitalSigns.oxygenSaturation && (
                                                <div className="bg-white p-2 rounded">
                                                    <span className="text-gray-600">SpO2:</span>
                                                    <p className="font-medium text-gray-900">{visit.vitalSigns.oxygenSaturation}%</p>
                                                </div>
                                            )}
                                            {visit.vitalSigns.weight && (
                                                <div className="bg-white p-2 rounded">
                                                    <span className="text-gray-600">BB:</span>
                                                    <p className="font-medium text-gray-900">{visit.vitalSigns.weight} kg</p>
                                                </div>
                                            )}
                                        </div>
                                        {visit.complications && (
                                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                                                <p className="text-xs font-medium text-red-700 mb-1">Komplikasi:</p>
                                                <p className="text-sm text-red-800">{visit.complications}</p>
                                            </div>
                                        )}
                                        {visit.notes && (
                                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                                                <p className="text-xs font-medium text-blue-700 mb-1">Catatan:</p>
                                                <p className="text-sm text-blue-800">{visit.notes}</p>
                                            </div>
                                        )}
                                        <div className="mt-3 text-xs text-gray-500">
                                            Perawat: {visit.nurse.name}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Belum ada riwayat vital signs</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'medication' && (
                        <div className="space-y-4">
                            {medicationVisits.length > 0 ? (
                                medicationVisits.map((visit) => (
                                    <div key={visit.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {new Date(visit.createdAt).toLocaleDateString('id-ID', {
                                                        weekday: 'long',
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                                <span className="text-sm text-gray-600 ml-2">
                                                    {new Date(visit.createdAt).toLocaleTimeString('id-ID', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${visit.shift === 'PAGI' ? 'bg-orange-100 text-orange-800' :
                                                visit.shift === 'SORE' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-purple-100 text-purple-800'
                                                }`}>
                                                Shift {visit.shift}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-700">Obat yang diberikan:</p>
                                            <ul className="space-y-1">
                                                {visit.medicationsGiven.map((med, idx) => (
                                                    <li key={idx} className="flex items-center text-sm text-gray-900 bg-white p-2 rounded">
                                                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                        {med}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        {visit.notes && (
                                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                                                <p className="text-xs font-medium text-blue-700 mb-1">Catatan:</p>
                                                <p className="text-sm text-blue-800">{visit.notes}</p>
                                            </div>
                                        )}
                                        <div className="mt-3 text-xs text-gray-500">
                                            Perawat: {visit.nurse.name}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Pill className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Belum ada riwayat pemberian obat</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'education' && (
                        <div className="space-y-4">
                            {educationVisits.length > 0 ? (
                                educationVisits.map((visit) => (
                                    <div key={visit.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {new Date(visit.createdAt).toLocaleDateString('id-ID', {
                                                        weekday: 'long',
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                                <span className="text-sm text-gray-600 ml-2">
                                                    {new Date(visit.createdAt).toLocaleTimeString('id-ID', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${visit.shift === 'PAGI' ? 'bg-orange-100 text-orange-800' :
                                                visit.shift === 'SORE' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-purple-100 text-purple-800'
                                                }`}>
                                                Shift {visit.shift}
                                            </span>
                                        </div>
                                        <div className="bg-white p-3 rounded border border-gray-200">
                                            <p className="text-sm text-gray-900 whitespace-pre-wrap">{visit.education}</p>
                                        </div>
                                        {visit.notes && (
                                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                                                <p className="text-xs font-medium text-blue-700 mb-1">Catatan:</p>
                                                <p className="text-sm text-blue-800">{visit.notes}</p>
                                            </div>
                                        )}
                                        <div className="mt-3 text-xs text-gray-500">
                                            Perawat: {visit.nurse.name}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Belum ada riwayat edukasi</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'diet' && (
                        <div className="space-y-4">
                            {dietVisits.length > 0 ? (
                                dietVisits.map((visit) => (
                                    <div key={visit.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {new Date(visit.createdAt).toLocaleDateString('id-ID', {
                                                        weekday: 'long',
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                                <span className="text-sm text-gray-600 ml-2">
                                                    {new Date(visit.createdAt).toLocaleTimeString('id-ID', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${visit.shift === 'PAGI' ? 'bg-orange-100 text-orange-800' :
                                                visit.shift === 'SORE' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-purple-100 text-purple-800'
                                                }`}>
                                                Shift {visit.shift}
                                            </span>
                                        </div>
                                        
                                        {visit.dietCompliance !== null && (
                                            <div className="bg-white p-3 rounded border border-gray-200 mb-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Kepatuhan Diet</span>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                                        visit.dietCompliance >= 80 ? 'bg-green-100 text-green-700' :
                                                        visit.dietCompliance >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        {visit.dietCompliance}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className={`h-2 rounded-full ${
                                                            visit.dietCompliance >= 80 ? 'bg-green-500' :
                                                            visit.dietCompliance >= 60 ? 'bg-yellow-500' :
                                                            'bg-red-500'
                                                        }`}
                                                        style={{ width: `${visit.dietCompliance}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}

                                        {visit.dietIssues && (
                                            <div className="bg-orange-50 p-3 rounded border border-orange-200">
                                                <p className="text-xs font-medium text-orange-700 mb-1">Masalah/Kendala Diet:</p>
                                                <p className="text-sm text-orange-800">{visit.dietIssues}</p>
                                            </div>
                                        )}

                                        {visit.notes && (
                                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                                                <p className="text-xs font-medium text-blue-700 mb-1">Catatan:</p>
                                                <p className="text-sm text-blue-800">{visit.notes}</p>
                                            </div>
                                        )}

                                        <div className="mt-3 text-xs text-gray-500">
                                            Perawat: {visit.nurse.name}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Utensils className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Belum ada riwayat monitoring diet</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetailVisitasiModal;