import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Filter, Edit, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import TambahVisitasiForm from './TambahVisitasiForm';
import DetailVisitasiModal from './DetailVisitasiModal';
import { Patient, Visitation } from '@prisma/client';

// Type untuk Visitation dengan relations
type VisitationWithRelations = Visitation & {
    patient: {
        id: string;
        name: string;
        mrNumber: string;
    };
    nurse: {
        id: string;
        name: string;
    };
};

interface VisitasiProps {
    currentShift: 'PAGI' | 'SORE' | 'MALAM';
}

const Visitasi: React.FC<VisitasiProps> = ({ currentShift }) => {
    const [visitations, setVisitations] = useState<VisitationWithRelations[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'vital' | 'medication' | 'education'>('all');
    const [filterDate, setFilterDate] = useState<'today' | 'all'>('today');
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedPatientForDetail, setSelectedPatientForDetail] = useState<string | null>(null);
    const [editingVisitation, setEditingVisitation] = useState<Visitation | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [visitationsRes, patientsRes] = await Promise.all([
                fetch('/api/visitations'),
                fetch('/api/patients?activeOnly=true')
            ]);

            if (visitationsRes.ok && patientsRes.ok) {
                const visitationsData = await visitationsRes.json();
                const patientsData = await patientsRes.json();

                setVisitations(visitationsData);
                setPatients(patientsData.filter((p: Patient) =>
                    p.status === 'RAWAT_INAP'
                ));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveVisitation = async () => {
        await fetchData();
        setShowAddForm(false);
        setEditingVisitation(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Yakin ingin menghapus visitasi ini?')) return;

        try {
            const response = await fetch(`/api/visitations?id=${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Visitasi berhasil dihapus');
                fetchData();
            } else {
                throw new Error('Failed to delete');
            }
        } catch (error) {
            console.error('Error deleting visitation:', error);
            alert('Gagal menghapus visitasi');
        }
    };

    const filteredVisitations = visitations.filter(visit => {
        if (!visit.patient) return false;

        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            visit.patient.name.toLowerCase().includes(searchLower) ||
            visit.patient.mrNumber.toLowerCase().includes(searchLower);

        const hasVitalSigns = visit.temperature || visit.bloodPressure ||
            visit.heartRate || visit.respiratoryRate ||
            visit.oxygenSaturation || visit.bloodSugar;

        const matchesType =
            filterType === 'all' ||
            (filterType === 'vital' && hasVitalSigns) ||
            (filterType === 'medication' && visit.medicationsGiven && visit.medicationsGiven.length > 0) ||
            (filterType === 'education' && visit.education);

        const today = new Date().toDateString();
        const matchesDate =
            filterDate === 'all' ||
            (filterDate === 'today' && new Date(visit.createdAt).toDateString() === today);

        return matchesSearch && matchesType && matchesDate;
    });

    const totalPages = Math.ceil(filteredVisitations.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedVisitations = filteredVisitations.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (value: number) => {
        setItemsPerPage(value);
        setCurrentPage(1);
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, itemsPerPage]);

    // Get visitations for selected patient
    const selectedPatientVisitations = selectedPatientForDetail
        ? visitations.filter(v => v.patientId === selectedPatientForDetail)
        : [];

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <h3 className="text-lg font-semibold text-gray-900">Daftar Visitasi</h3>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1 sm:flex-initial">
                                <input
                                    type="text"
                                    placeholder="Cari Pasien..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 w-full sm:w-64 text-gray-900"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            </div>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium whitespace-nowrap"
                            >
                                <Plus className="h-5 w-5" />
                                <span>Tambah Visitasi</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-4">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Filter:</span>
                        </div>
                        <select
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value as 'today' | 'all')}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 text-gray-900"
                        >
                            <option value="today">Hari Ini</option>
                            <option value="all">Semua</option>
                        </select>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 text-gray-900"
                        >
                            <option value="all">Semua Jenis</option>
                            <option value="vital">Vital Signs</option>
                            <option value="medication">Pemberian Obat</option>
                            <option value="education">Edukasi</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pasien</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis Visitasi</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Perawat</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedVisitations.map((visit) => {
                                        const hasVitalSigns = visit.temperature || visit.bloodPressure ||
                                            visit.heartRate || visit.bloodSugar;

                                        return (
                                            <tr key={visit.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(visit.createdAt).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                    <br />
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(visit.createdAt).toLocaleTimeString('id-ID', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{visit.patient.name}</p>
                                                        <p className="text-sm text-gray-500">{visit.patient.mrNumber}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {hasVitalSigns && (
                                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">Vital</span>
                                                        )}
                                                        {visit.medicationsGiven && visit.medicationsGiven.length > 0 && (
                                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Obat</span>
                                                        )}
                                                        {visit.education && (
                                                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">Edukasi</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {visit.nurse.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${visit.shift === 'PAGI' ? 'bg-orange-100 text-orange-800' :
                                                        visit.shift === 'SORE' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-purple-100 text-purple-800'
                                                        }`}>
                                                        {visit.shift}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setSelectedPatientForDetail(visit.patientId)}
                                                            className="text-gray-600 hover:text-gray-900 font-medium inline-flex items-center space-x-1"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            <span>Detail</span>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditingVisitation(visit);
                                                                setShowAddForm(true);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-900 font-medium inline-flex items-center space-x-1"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                            <span>Edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(visit.id)}
                                                            className="text-red-600 hover:text-red-900 font-medium inline-flex items-center space-x-1"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span>Delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {filteredVisitations.length > 0 && (
                                <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-700">Tampilkan</span>
                                        <select
                                            value={itemsPerPage}
                                            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                                            className="px-3 py-1 border border-gray-400 rounded-lg text-sm focus:ring-2 focus:ring-green-500 text-gray-700"
                                        >
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </select>
                                        <span className="text-sm text-gray-700">dari {filteredVisitations.length} pasien</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <ChevronLeft className="h-5 w-5 text-gray-600" />
                                        </button>
                                        <div className="flex gap-1">
                                            {getPageNumbers().map((page, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                                                    disabled={page === '...'}
                                                    className={`px-3 py-1 rounded-lg text-sm font-medium ${page === currentPage ? 'bg-green-600 text-white' :
                                                        page === '...' ? 'cursor-default text-gray-400' :
                                                            'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <ChevronRight className="h-5 w-5 text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden space-y-4 p-4">
                            {paginatedVisitations.map((visit) => {
                                const hasVitalSigns = visit.temperature || visit.bloodPressure ||
                                    visit.heartRate || visit.bloodSugar;

                                return (
                                    <div key={visit.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">{visit.patient.name}</h4>
                                                <p className="text-sm text-gray-600">{visit.patient.mrNumber}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(visit.createdAt).toLocaleString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${visit.shift === 'PAGI' ? 'bg-orange-100 text-orange-800' :
                                                visit.shift === 'SORE' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-purple-100 text-purple-800'
                                                }`}>
                                                {visit.shift}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {hasVitalSigns && (
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">Vital</span>
                                            )}
                                            {visit.medicationsGiven && visit.medicationsGiven.length > 0 && (
                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Obat</span>
                                            )}
                                            {visit.education && (
                                                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">Edukasi</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mb-3">Perawat: {visit.nurse.name}</p>
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={() => setSelectedPatientForDetail(visit.patientId)}
                                                className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                                            >
                                                <Eye className="h-4 w-4" />
                                                <span>Detail</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingVisitation(visit);
                                                    setShowAddForm(true);
                                                }}
                                                className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors flex items-center justify-center space-x-1"
                                            >
                                                <Edit className="h-4 w-4" />
                                                <span>Edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(visit.id)}
                                                className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-red-200 transition-colors flex items-center justify-center space-x-1"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span>Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredVisitations.length > 0 && (
                                <div className="lg:hidden px-4 pb-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-700">Tampilkan</span>
                                            <select
                                                value={itemsPerPage}
                                                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                                                className="px-2 py-1 border border-gray-400 rounded-lg text-xs text-gray-700"
                                            >
                                                <option value={10}>10</option>
                                                <option value={25}>25</option>
                                                <option value={50}>50</option>
                                                <option value={100}>100</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                <ChevronLeft className="h-4 w-4 text-gray-600" />
                                            </button>
                                            <span className="text-xs text-gray-700 px-2">{currentPage}/{totalPages}</span>
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                <ChevronRight className="h-4 w-4 text-gray-600" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {filteredVisitations.length === 0 && (
                            <div className="text-center py-12 px-4">
                                <p className="text-gray-500">Tidak ada data visitasi</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            <TambahVisitasiForm
                isOpen={showAddForm}
                onClose={() => {
                    setShowAddForm(false);
                    setEditingVisitation(null);
                }}
                onSave={handleSaveVisitation}
                patients={patients}
                currentShift={currentShift}
                editData={editingVisitation}
            />

            <DetailVisitasiModal
                isOpen={!!selectedPatientForDetail}
                onClose={() => setSelectedPatientForDetail(null)}
                patientId={selectedPatientForDetail}
                visitations={selectedPatientVisitations}
            />
        </div>
    );
};

export default Visitasi;