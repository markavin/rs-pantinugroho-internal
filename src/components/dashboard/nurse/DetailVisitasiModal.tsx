import React, { useState } from 'react';
import { X, Activity, Pill, FileText, Utensils, Calculator, User } from 'lucide-react';

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

    if (!isOpen || !patientId || visitations.length === 0) return null;

    const patientInfo = (visitations[0] as any)?.patient;

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

    const shouldShowSection = (visit: Visitation, section: 'vital' | 'medication' | 'education' | 'diet' | 'energy') => {
        if (filterType === 'all') return true;

        if (section === 'vital') return filterType === 'vital' && hasVitalSigns(visit);
        if (section === 'medication') return filterType === 'medication' && hasMedication(visit);
        if (section === 'education') return filterType === 'education' && hasEducation(visit);
        if (section === 'diet') return filterType === 'diet' && hasDiet(visit);
        if (section === 'energy') return filterType === 'energy' && hasEnergy(visit);

        return false;
    };

    const renderVisitCard = (visit: Visitation) => (
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

            {(filterType === 'all' || filterType === 'vital') && hasVitalSigns(visit) && (
                <div className="mb-3">
                    <p className="text-xs font-medium text-blue-700 mb-2">Vital Signs</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {visit.temperature && (
                            <div className="bg-white p-2 rounded">
                                <span className="text-xs text-gray-600">Suhu:</span>
                                <p className="text-sm font-medium text-gray-900">{visit.temperature} C</p>
                            </div>
                        )}
                        {visit.bloodPressure && (
                            <div className="bg-white p-2 rounded">
                                <span className="text-xs text-gray-600">TD:</span>
                                <p className="text-sm font-medium text-gray-900">{visit.bloodPressure}</p>
                            </div>
                        )}
                        {visit.heartRate && (
                            <div className="bg-white p-2 rounded">
                                <span className="text-xs text-gray-600">Nadi:</span>
                                <p className="text-sm font-medium text-gray-900">{visit.heartRate} bpm</p>
                            </div>
                        )}
                        {visit.bloodSugar && (
                            <div className="bg-white p-2 rounded">
                                <span className="text-xs text-gray-600">GDS:</span>
                                <p className="text-sm font-medium text-gray-900">{visit.bloodSugar} mg/dL</p>
                            </div>
                        )}
                        {visit.oxygenSaturation && (
                            <div className="bg-white p-2 rounded">
                                <span className="text-xs text-gray-600">SpO2:</span>
                                <p className="text-sm font-medium text-gray-900">{visit.oxygenSaturation}%</p>
                            </div>
                        )}
                        {visit.weight && (
                            <div className="bg-white p-2 rounded">
                                <span className="text-xs text-gray-600">BB:</span>
                                <p className="text-sm font-medium text-gray-900">{visit.weight} kg</p>
                            </div>
                        )}
                        {visit.respiratoryRate && (
                            <div className="bg-white p-2 rounded">
                                <span className="text-xs text-gray-600">RR:</span>
                                <p className="text-sm font-medium text-gray-900">{visit.respiratoryRate} x/mnt</p>
                            </div>
                        )}
                        {visit.height && (
                            <div className="bg-white p-2 rounded">
                                <span className="text-xs text-gray-600">TB:</span>
                                <p className="text-sm font-medium text-gray-900">{visit.height} cm</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {(filterType === 'all' || filterType === 'medication') && hasMedication(visit) && (
                <div className="mb-3">
                    <p className="text-xs font-medium text-green-700 mb-2">Obat yang Diberikan</p>
                    <ul className="space-y-1">
                        {visit.medicationsGiven.map((med, idx) => (
                            <li key={idx} className="flex items-center text-sm text-gray-900 bg-white p-2 rounded">
                                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                {med}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {(filterType === 'all' || filterType === 'education') && hasEducation(visit) && (
                <div className="mb-3">
                    <p className="text-xs font-medium text-purple-700 mb-2">Edukasi</p>
                    <div className="bg-white p-3 rounded border border-gray-200">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{visit.education}</p>
                    </div>
                </div>
            )}

            {(filterType === 'all' || filterType === 'diet') && hasDiet(visit) && (
                <div className="mb-3">
                    <p className="text-xs font-medium text-orange-700 mb-2">Diet</p>
                    {visit.dietCompliance !== null && (
                        <div className="bg-white p-3 rounded border border-gray-200 mb-2">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Kepatuhan Diet</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${visit.dietCompliance >= 80 ? 'bg-green-100 text-green-700' :
                                    visit.dietCompliance >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                    {visit.dietCompliance}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${visit.dietCompliance >= 80 ? 'bg-green-500' :
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
                            <p className="text-xs font-medium text-orange-700 mb-1">Masalah/Kendala:</p>
                            <p className="text-sm text-orange-800">{visit.dietIssues}</p>
                        </div>
                    )}
                </div>
            )}

            {(filterType === 'all' || filterType === 'energy') && hasEnergy(visit) && (
                <div className="mb-3">
                    <p className="text-xs font-medium text-indigo-700 mb-2">Perhitungan Energi</p>
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4 mb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-indigo-700 font-medium">Total Kebutuhan Energi</p>
                                <p className="text-2xl font-bold text-indigo-900">{visit.energyRequirement} <span className="text-base">kkal/hari</span></p>
                            </div>
                            <Calculator className="h-8 w-8 text-indigo-400" />
                        </div>
                    </div>
                    {visit.energyCalculationDetail && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                            <p className="text-xs font-medium text-blue-700 mb-2">Detail Perhitungan (PERKENI 2015)</p>
                            <div className="space-y-1 text-sm">
                                {visit.calculatedBBI && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">BBI:</span>
                                        <span className="font-medium text-gray-900">{visit.calculatedBBI} kg</span>
                                    </div>
                                )}
                                {visit.basalMetabolicRate && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">BMR:</span>
                                        <span className="font-medium text-gray-900">{visit.basalMetabolicRate} kkal</span>
                                    </div>
                                )}
                                {visit.activityLevel && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">Aktivitas:</span>
                                        <span className="font-medium capitalize text-gray-900">{visit.activityLevel}</span>
                                    </div>
                                )}
                                {visit.stressLevel && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">Stres:</span>
                                        <span className="font-medium capitalize text-gray-900">{visit.stressLevel.replace('_', ' ')}</span>
                                    </div>
                                )}
                                {visit.nutritionStatus && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">Status Gizi:</span>
                                        <span className="font-medium text-gray-900">{visit.nutritionStatus}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {filterType === 'all' && visit.complications && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-xs font-medium text-red-700 mb-1">Komplikasi:</p>
                    <p className="text-sm text-red-800">{visit.complications}</p>
                </div>
            )}

            {filterType === 'all' && visit.notes && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-xs font-medium text-blue-700 mb-1">Catatan:</p>
                    <p className="text-sm text-blue-800">{visit.notes}</p>
                </div>
            )}

            <div className="text-xs text-gray-500">
                Perawat: {(visit as any).nurse?.name || 'N/A'}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 bg-green-50 mb-2">

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
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3 flex-wrap">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
                        />

                        {selectedDate && (
                            <button
                                onClick={() => setSelectedDate('')}
                                className="text-sm text-green-600 hover:text-green-700 font-medium mr-4"
                            >
                                Reset Tanggal
                            </button>
                        )}

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
                                onClick={() => setFilterType(key as any)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === key
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-green-200'
                                    }`}
                            >
                                {Icon && <Icon className="h-4 w-4" />}
                                {label}
                            </button>
                        ))}

                    </div>

                    <div className="mt-3 text-xs text-gray-500">
                        Menampilkan {filteredVisitations.length} dari {visitations.length} visitasi
                    </div>
                </div>


                <div className="flex-1 overflow-y-auto p-6">
                    {filteredVisitations.length > 0 ? (
                        <div className="space-y-4">
                            {filteredVisitations.map(visit => renderVisitCard(visit))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <p className="font-medium">Tidak ada data visitasi yang sesuai dengan filter</p>
                            <button
                                onClick={() => {
                                    setSelectedDate('');
                                    setFilterType('all');
                                }}
                                className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Reset Semua Filter
                            </button>
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