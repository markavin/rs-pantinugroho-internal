import React, { useState, useEffect } from 'react';
import { Search, Eye, X, User, Phone, Calendar, Activity, AlertCircle, FileText } from 'lucide-react';

interface Patient {
    id: string;
    mrNumber: string;
    name: string;
    birthDate: Date;
    gender: 'MALE' | 'FEMALE';
    phone?: string;
    diabetesType?: string;
    status: string;
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
    allergies: string[];
    comorbidities: string[];
}

const DaftarPasien = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/patients?activeOnly=true');
            if (response.ok) {
                const data = await response.json();
                setPatients(data.filter((p: Patient) =>
                    p.status === 'RAWAT_INAP'
                ));
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(patient => {
        const searchLower = searchTerm.toLowerCase();
        return (
            patient.name.toLowerCase().includes(searchLower) ||
            patient.mrNumber.toLowerCase().includes(searchLower)
        );
    });

    const getRiskBadge = (riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH') => {
        switch (riskLevel) {
            case 'HIGH':
                return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Tinggi</span>;
            case 'MEDIUM':
                return <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">Sedang</span>;
            default:
                return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Rendah</span>;
        }
    };

    const calculateAge = (birthDate: Date) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">Daftar Pasien Aktif</h3>
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Cari Pasien..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                ) : (
                    <>
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. RM</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Pasien</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risiko</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diagnosis</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredPatients.map((patient) => (
                                        <tr key={patient.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {patient.mrNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                                                    <p className="text-sm text-gray-500">{patient.phone || '-'}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    RAWAT INAP
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getRiskBadge(patient.riskLevel)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-900">{patient.diabetesType || '-'}</p>
                                                {patient.allergies.length > 0 && (
                                                    <p className="text-xs text-red-600 mt-1">Alergi: {patient.allergies.join(', ')}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => setSelectedPatient(patient)}
                                                    className="text-gray-600 hover:text-gray-900 font-medium inline-flex items-center space-x-1"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span>Detail</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="lg:hidden space-y-4 p-4">
                            {filteredPatients.map((patient) => (
                                <div key={patient.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 text-lg">{patient.name}</h4>
                                            <p className="text-sm text-gray-600">{patient.mrNumber}</p>
                                        </div>
                                        {getRiskBadge(patient.riskLevel)}
                                    </div>
                                    <div className="space-y-2 mb-4">
                                        <p className="text-sm"><span className="text-gray-600">Status:</span> <span className="font-medium">RAWAT INAP</span></p>
                                        <p className="text-sm"><span className="text-gray-600">Diagnosis:</span> <span className="font-medium">{patient.diabetesType || '-'}</span></p>
                                        {patient.allergies.length > 0 && (
                                            <p className="text-sm text-red-600 font-medium">Alergi: {patient.allergies.join(', ')}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setSelectedPatient(patient)}
                                        className="w-full bg-green-100 text-green-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-green-200 transition-colors flex items-center justify-center space-x-1"
                                    >
                                        <Eye className="h-4 w-4" />
                                        <span>Lihat Detail</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* IMPROVED DETAIL MODAL */}
            {selectedPatient && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <User className="h-6 w-6 text-green-600" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Detail Pasien</h3>
                                        <p className="text-sm text-gray-600">Informasi lengkap pasien rawat inap</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedPatient(null)} 
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Identitas Section */}
                            <div className="bg-white border border-gray-300 rounded-lg p-4">
                                <div className="flex items-center mb-4">
                                    <User className="h-5 w-5 text-green-600 mr-2" />
                                    <h4 className="font-semibold text-gray-900">Identitas Pasien</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">No. Rekam Medis</label>
                                        <p className="text-base font-semibold text-gray-900 mt-1">{selectedPatient.mrNumber}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Nama Lengkap</label>
                                        <p className="text-base font-semibold text-gray-900 mt-1">{selectedPatient.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Jenis Kelamin</label>
                                        <p className="text-base text-gray-900 mt-1">
                                            {selectedPatient.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Usia</label>
                                        <p className="text-base text-gray-900 mt-1">
                                            {calculateAge(selectedPatient.birthDate)} tahun
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Tanggal Lahir</label>
                                        <p className="text-base text-gray-900 mt-1">
                                            {new Date(selectedPatient.birthDate).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Telepon</label>
                                        <p className="text-base text-gray-900 mt-1 flex items-center">
                                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                            {selectedPatient.phone || '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Status Section */}
                            <div className="bg-white border border-gray-300 rounded-lg p-4">
                                <div className="flex items-center mb-4">
                                    <Activity className="h-5 w-5 text-green-600 mr-2" />
                                    <h4 className="font-semibold text-gray-900">Status Perawatan</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Status Rawat</label>
                                        <div className="mt-1">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                RAWAT INAP
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Tingkat Risiko</label>
                                        <div className="mt-1">
                                            {getRiskBadge(selectedPatient.riskLevel)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Medical Info Section */}
                            <div className="bg-white border border-gray-300 rounded-lg p-4">
                                <div className="flex items-center mb-4">
                                    <FileText className="h-5 w-5 text-green-600 mr-2" />
                                    <h4 className="font-semibold text-gray-900">Informasi Medis</h4>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Diagnosis Diabetes</label>
                                        <p className="text-base text-gray-900 mt-1 font-medium">
                                            {selectedPatient.diabetesType || 'Tidak ada data'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1 text-red-500" />
                                            Alergi
                                        </label>
                                        <div className="mt-2">
                                            {selectedPatient.allergies.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedPatient.allergies.map((allergy, idx) => (
                                                        <span 
                                                            key={idx}
                                                            className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-200"
                                                        >
                                                            {allergy}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-base text-gray-500">Tidak ada alergi yang tercatat</p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Komorbid</label>
                                        <div className="mt-2">
                                            {selectedPatient.comorbidities.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedPatient.comorbidities.map((comorbid, idx) => (
                                                        <span 
                                                            key={idx}
                                                            className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-medium border border-orange-200"
                                                        >
                                                            {comorbid}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-base text-gray-500">Tidak ada komorbid yang tercatat</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setSelectedPatient(null)}
                                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DaftarPasien;