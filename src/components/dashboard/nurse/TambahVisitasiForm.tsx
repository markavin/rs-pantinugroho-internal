import React, { useState, useEffect } from 'react';
import { X, Save, User, Activity, Pill, FileText, BookOpen, AlertTriangle, ChevronDown, Clock, Utensils } from 'lucide-react';
import { Patient, Visitation } from './types';
import DietComplianceChecker from './DietComplianceChecker';

interface TambahVisitasiFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    patients: Patient[];
    currentShift: 'PAGI' | 'SORE' | 'MALAM';
    editData?: Visitation | null;
}

const TambahVisitasiForm: React.FC<TambahVisitasiFormProps> = ({
    isOpen,
    onClose,
    onSave,
    patients,
    currentShift,
    editData
}) => {
    const [selectedPatient, setSelectedPatient] = useState('');
    const [visitationType, setVisitationType] = useState<'vital' | 'medication' | 'education'>('vital');
    const [vitalSigns, setVitalSigns] = useState({
        temperature: '',
        bloodPressure: '',
        heartRate: '',
        respiratoryRate: '',
        oxygenSaturation: '',
        bloodSugar: '',
        weight: '',
        height: ''
    });
    const [medications, setMedications] = useState<string[]>(['']);
    const [education, setEducation] = useState('');
    const [complications, setComplications] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [dietCompliance, setDietCompliance] = useState('');
    const [dietIssues, setDietIssues] = useState('')
        ;
    useEffect(() => {
        if (editData && isOpen) {
            setSelectedPatient(editData.patientId);

            const hasVitals = editData.vitalSigns && Object.keys(editData.vitalSigns).length > 0;
            const hasMeds = editData.medicationsGiven && editData.medicationsGiven.length > 0;
            const hasEdu = !!editData.education;

            if (hasVitals) {
                setVisitationType('vital');
                setVitalSigns({
                    temperature: editData.vitalSigns.temperature || '',
                    bloodPressure: editData.vitalSigns.bloodPressure || '',
                    heartRate: editData.vitalSigns.heartRate || '',
                    respiratoryRate: editData.vitalSigns.respiratoryRate || '',
                    oxygenSaturation: editData.vitalSigns.oxygenSaturation || '',
                    bloodSugar: editData.vitalSigns.bloodSugar || '',
                    weight: editData.vitalSigns.weight || '',
                    height: editData.vitalSigns.height || ''
                });
            }

            if (hasMeds) {
                if (!hasVitals) setVisitationType('medication');
                setMedications(editData.medicationsGiven.length > 0 ? editData.medicationsGiven : ['']);
            }

            if (hasEdu) {
                if (!hasVitals && !hasMeds) setVisitationType('education');
                setEducation(editData.education || '');
            }

            setComplications(editData.complications || '');
            setNotes(editData.notes || '');
            setDietCompliance(editData.dietCompliance?.toString() || '');
            setDietIssues(editData.dietIssues || '');
        } else if (!isOpen) {
            resetForm();
        }
    }, [editData, isOpen]);


    const handleSave = async () => {
        const newErrors: Record<string, string> = {};

        if (!selectedPatient) {
            newErrors.patient = 'Pasien harus dipilih';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            const sanitizedVitalSigns: any = {};
            Object.entries(vitalSigns).forEach(([key, value]) => {
                if (value && value.toString().trim() !== '') {
                    const trimmedValue = value.toString().trim();
                    if (key === 'temperature' || key === 'weight') {
                        sanitizedVitalSigns[key] = parseFloat(trimmedValue);
                    } else if (key === 'heartRate' || key === 'respiratoryRate' || key === 'oxygenSaturation' || key === 'bloodSugar' || key === 'height') {
                        sanitizedVitalSigns[key] = parseInt(trimmedValue);
                    } else {
                        sanitizedVitalSigns[key] = trimmedValue;
                    }
                }
            });

            const filteredMedications = medications.filter(m => m && m.trim() !== '');

            const payload: any = {
                patientId: selectedPatient,
                shift: currentShift,
                vitalSigns: sanitizedVitalSigns,
                medicationsGiven: filteredMedications,
                education: education?.trim() || null,
                complications: complications?.trim() || null,
                notes: notes?.trim() || null,
                dietCompliance: dietCompliance?.trim() ? parseInt(dietCompliance) : null,
                dietIssues: dietIssues?.trim() || null
            };

            console.log('=== PAYLOAD DETAIL ===');
            console.log('patientId:', payload.patientId);
            console.log('shift:', payload.shift);
            console.log('vitalSigns:', payload.vitalSigns);
            console.log('medicationsGiven:', payload.medicationsGiven);
            console.log('Full payload:', JSON.stringify(payload, null, 2));

            const url = editData ? `/api/visitations?id=${editData.id}` : '/api/visitations';
            const method = editData ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            let responseData;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                throw new Error('Server returned non-JSON response');
            }

            console.log('Response status:', response.status);
            console.log('Response data:', responseData);

            if (!response.ok) {
                throw new Error(responseData.error || responseData.details || `Server error: ${response.status}`);
            }

            alert(editData ? 'Visitasi berhasil diupdate' : 'Visitasi berhasil disimpan');
            resetForm();
            onSave();
        } catch (error) {
            console.error('=== ERROR DETAIL ===');
            console.error('Error type:', error instanceof Error ? 'Error' : typeof error);
            console.error('Error message:', error instanceof Error ? error.message : error);
            console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
            alert(`Gagal menyimpan visitasi: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setSelectedPatient('');
        setVisitationType('vital');
        setVitalSigns({
            temperature: '',
            bloodPressure: '',
            heartRate: '',
            respiratoryRate: '',
            oxygenSaturation: '',
            bloodSugar: '',
            weight: '',
            height: ''
        });
        setMedications(['']);
        setEducation('');
        setComplications('');
        setNotes('');
        setDietCompliance('');
        setDietIssues('');
        setErrors({});
    };

    const getShiftBadge = (shift: string) => {
        switch (shift) {
            case 'PAGI':
                return <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">PAGI</span>;
            case 'SORE':
                return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">SORE</span>;
            default:
                return <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">MALAM</span>;
        }
    };

    if (!isOpen) return null;

    const selectedPatientData = patients.find(p => p.id === selectedPatient);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Activity className="h-6 w-6 text-green-600" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {editData ? 'Edit Visitasi' : 'Tambah Visitasi Baru'}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">Shift: </span>
                                    {getShiftBadge(currentShift)}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="text-gray-400 hover:text-gray-600 p-1 disabled:opacity-50"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="space-y-6">
                        <div className="bg-white border border-gray-300 rounded-lg p-4">
                            <div className="flex items-center mb-3">
                                <User className="h-5 w-5 text-green-600 mr-2" />
                                <h4 className="font-medium text-gray-900">Pilih Pasien</h4>
                                <span className="text-red-500 ml-1">*</span>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pasien Rawat Inap
                                    </label>
                                    <div className="relative">
                                        <select
                                            className={`w-full px-4 py-3 pr-10 text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none text-gray-900 font-medium ${errors.patient ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            value={selectedPatient}
                                            onChange={(e) => {
                                                setSelectedPatient(e.target.value);
                                                const newErrors = { ...errors };
                                                delete newErrors.patient;
                                                setErrors(newErrors);
                                            }}
                                            disabled={isSubmitting || !!editData}
                                        >
                                            <option value="">-- Pilih Pasien --</option>
                                            {patients.map(patient => (
                                                <option key={patient.id} value={patient.id}>
                                                    {patient.name} - {patient.mrNumber}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-700 pointer-events-none" />
                                    </div>
                                    {errors.patient && (
                                        <p className="mt-1 text-sm text-red-600">{errors.patient}</p>
                                    )}
                                </div>

                                {selectedPatientData && (
                                    <div className="bg-white rounded-lg p-3 border shadow-sm">
                                        <h5 className="font-medium text-gray-900 mb-2">Detail Pasien</h5>
                                        <table className="text-sm w-full">
                                            <tbody className="align-top">
                                                <tr>
                                                    <td className="text-gray-600 pr-4">Nama</td>
                                                    <td className="px-1">:</td>
                                                    <td className="font-semibold text-gray-900">{selectedPatientData.name}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-gray-600 pr-4">No. RM</td>
                                                    <td className="px-1">:</td>
                                                    <td className="font-semibold text-gray-900">{selectedPatientData.mrNumber}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white border border-gray-300 rounded-lg p-4">
                            <div className="flex items-center mb-3">
                                <FileText className="h-5 w-5 text-green-600 mr-2" />
                                <h4 className="font-medium text-gray-900">Jenis Visitasi</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setVisitationType('vital')}
                                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${visitationType === 'vital'
                                        ? 'bg-green-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <Activity className="h-5 w-5" />
                                    <span>Vital Signs</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setVisitationType('medication')}
                                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${visitationType === 'medication'
                                        ? 'bg-green-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <Pill className="h-5 w-5" />
                                    <span>Pemberian Obat</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setVisitationType('education')}
                                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${visitationType === 'education'
                                        ? 'bg-green-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <BookOpen className="h-5 w-5" />
                                    <span>Edukasi</span>
                                </button>
                            </div>
                        </div>

                        {visitationType === 'vital' && (
                            <div className="bg-white border border-gray-300 rounded-lg p-4">
                                <div className="flex items-center mb-4">
                                    <Activity className="h-5 w-5 text-blue-600 mr-2" />
                                    <h4 className="font-medium text-gray-900">Data Vital Signs</h4>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Suhu (°C)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base text-gray-700"
                                            placeholder="36.5"
                                            value={vitalSigns.temperature}
                                            onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tekanan Darah
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base text-gray-700"
                                            placeholder="120/80"
                                            value={vitalSigns.bloodPressure}
                                            onChange={(e) => setVitalSigns({ ...vitalSigns, bloodPressure: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nadi (bpm)
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base text-gray-700"
                                            placeholder="75"
                                            value={vitalSigns.heartRate}
                                            onChange={(e) => setVitalSigns({ ...vitalSigns, heartRate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Pernapasan (x/mnt)
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base text-gray-700"
                                            placeholder="20"
                                            value={vitalSigns.respiratoryRate}
                                            onChange={(e) => setVitalSigns({ ...vitalSigns, respiratoryRate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            SpO2 (%)
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base text-gray-700"
                                            placeholder="98"
                                            value={vitalSigns.oxygenSaturation}
                                            onChange={(e) => setVitalSigns({ ...vitalSigns, oxygenSaturation: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            GDS (mg/dL)
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base text-gray-700"
                                            placeholder="120"
                                            value={vitalSigns.bloodSugar}
                                            onChange={(e) => setVitalSigns({ ...vitalSigns, bloodSugar: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Berat Badan (kg)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base text-gray-700"
                                            placeholder="65"
                                            value={vitalSigns.weight}
                                            onChange={(e) => setVitalSigns({ ...vitalSigns, weight: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tinggi Badan (cm)
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base text-gray-700"
                                            placeholder="170"
                                            value={vitalSigns.height}
                                            onChange={(e) => setVitalSigns({ ...vitalSigns, height: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {visitationType === 'medication' && (
                            <div className="bg-white border border-gray-300 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        <Pill className="h-5 w-5 text-green-600 mr-2" />
                                        <h4 className="font-medium text-gray-900">Obat yang Diberikan</h4>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setMedications([...medications, ''])}
                                        className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors "
                                    >
                                        + Tambah Obat
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {medications.map((med, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                type="text"
                                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-base text-gray-700"
                                                placeholder="Contoh: Metformin 500mg - 3x1 - 10 tablet"
                                                value={med}
                                                onChange={(e) => {
                                                    const newMeds = [...medications];
                                                    newMeds[idx] = e.target.value;
                                                    setMedications(newMeds);
                                                }}
                                            />
                                            {medications.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setMedications(medications.filter((_, i) => i !== idx))}
                                                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {visitationType === 'education' && (
                            <div className="bg-white border border-gray-300 rounded-lg p-4">
                                <div className="flex items-center mb-3">
                                    <BookOpen className="h-5 w-5 text-purple-600 mr-2" />
                                    <h4 className="font-medium text-gray-900">Materi Edukasi</h4>
                                </div>
                                <textarea
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-base text-gray-700"
                                    rows={6}
                                    placeholder="Tuliskan materi edukasi yang diberikan kepada pasien...&#10;&#10;Contoh:&#10;- Penjelasan tentang diet diabetes&#10;- Cara penggunaan insulin&#10;- Pentingnya kontrol gula darah rutin"
                                    value={education}
                                    onChange={(e) => setEducation(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="bg-white border border-gray-300 rounded-lg p-4">
                            <div className="flex items-center mb-3">
                                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                                <h4 className="font-medium text-gray-900">Komplikasi</h4>
                                <span className="text-gray-500 text-sm ml-2">(Opsional)</span>
                            </div>
                            <textarea
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-base text-gray-700"
                                rows={3}
                                placeholder="Catat jika ada komplikasi, keluhan khusus, atau kondisi yang perlu perhatian..."
                                value={complications}
                                onChange={(e) => setComplications(e.target.value)}
                            />
                            <p className="mt-2 text-xs text-gray-500 flex items-start">
                                <AlertTriangle className="h-3 w-3 mr-1 mt-0.5 text-orange-500" />
                                Jika ada komplikasi, sistem akan otomatis membuat alert untuk dokter spesialis
                            </p>
                        </div>
                        <div className="bg-white border border-gray-300 rounded-lg p-4">
                            <div className="flex items-center mb-3">
                                <Utensils className="h-5 w-5 text-orange-600 mr-2" />
                                <h4 className="font-medium text-gray-900">Kepatuhan Diet & Masalah</h4>
                                <span className="text-gray-500 text-sm ml-2">(Opsional)</span>
                            </div>

                            <DietComplianceChecker
                                value={dietCompliance}
                                onChange={(val) => setDietCompliance(val)}
                            />

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Berat Badan Saat Ini (kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-base text-gray-700"
                                    placeholder="70.5"
                                    value={vitalSigns.weight}
                                    onChange={(e) => setVitalSigns({ ...vitalSigns, weight: e.target.value })}
                                />
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Masalah/Kendala Diet
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-base text-gray-700"
                                    rows={3}
                                    placeholder="Contoh: Pasien menolak makan sayur, tidak mengikuti jadwal makan..."
                                    value={dietIssues}
                                    onChange={(e) => setDietIssues(e.target.value)}
                                />
                                <p className="mt-2 text-xs text-orange-600 flex items-start">
                                    <AlertTriangle className="h-3 w-3 mr-1 mt-0.5 text-orange-500" />
                                    Jika ada masalah diet, sistem akan membuat alert untuk Ahli Gizi
                                </p>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-300 rounded-lg p-4">
                            <div className="flex items-center mb-3">
                                <FileText className="h-5 w-5 text-gray-600 mr-2" />
                                <h4 className="font-medium text-gray-900">Catatan Tambahan</h4>
                                <span className="text-gray-500 text-sm ml-2">(Opsional)</span>
                            </div>
                            <textarea
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-base text-gray-700"
                                rows={3}
                                placeholder="Catatan lainnya yang perlu didokumentasikan..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        <div className="bg-white border border-green-400 rounded-lg p-5 shadow-md">
                            <h4 className="font-semibold text-green-900 mb-4 flex items-center">
                                <Activity className="h-5 w-5 mr-2 text-green-600" />
                                Ringkasan Visitasi
                            </h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Pasien</span>
                                    <span className="font-semibold text-gray-900 text-right">
                                        {selectedPatientData
                                            ? `${selectedPatientData.name} (${selectedPatientData.mrNumber})`
                                            : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shift</span>
                                    {getShiftBadge(currentShift)}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Jenis Visitasi</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${visitationType === 'vital' ? 'bg-blue-100 text-blue-800' :
                                        visitationType === 'medication' ? 'bg-green-100 text-green-800' :
                                            'bg-purple-100 text-purple-800'
                                        }`}>
                                        {visitationType === 'vital' ? 'Vital Signs' :
                                            visitationType === 'medication' ? 'Pemberian Obat' : 'Edukasi'}
                                    </span>
                                </div>
                                {complications.trim() && (
                                    <div className="flex justify-between items-start pt-2 border-t border-gray-200">
                                        <span className="text-red-600 font-medium">⚠️ Komplikasi Tercatat</span>
                                        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                                            Alert akan dibuat
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-3 justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 font-medium"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSubmitting || !selectedPatient}
                        className="w-full sm:w-auto bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium flex items-center justify-center space-x-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                <span>Menyimpan...</span>
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                <span>{editData ? 'Update Visitasi' : 'Simpan Visitasi'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TambahVisitasiForm;