import React, { useState, useEffect } from 'react';
import { X, Save, User, Activity, Pill, FileText, BookOpen, AlertTriangle, ChevronDown, Clock, Utensils, Calculator, Info } from 'lucide-react';
import { Patient, Visitation } from '@prisma/client';
// import DietComplianceChecker from './DietComplianceChecker';


interface TambahVisitasiFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    patients: Patient[];
    currentShift: 'PAGI' | 'SORE' | 'MALAM';
    editData?: Visitation | null;
}

interface EnergyCalculationResult {
    bbi: number;
    bmr: number;
    totalEnergy: number;
    activityFactor: string;
    ageFactor: number;
    stressFactor: number;
    nutritionStatus: string;
    breakdown: {
        baseEnergy: number;
        withActivity: number;
        withAge: number;
        withNutrition: number;
        withStress: number;
        final: number;
    };
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
    const [dietIssues, setDietIssues] = useState('');
    const [energyCalculation, setEnergyCalculation] = useState<EnergyCalculationResult | null>(null);
    const [activityLevel, setActivityLevel] = useState('ringan');
    const [stressLevel, setStressLevel] = useState('tidak_ada');
    const [showEnergyCalc, setShowEnergyCalc] = useState(false);

    const stressDescriptions: { [key: string]: string } = {
        'tidak_ada': 'Tidak ada stres metabolik, kondisi stabil, status gizi normal',
        'ringan': 'Peradangan ringan, operasi kecil, kanker, bedah efektif, trauma ringan, post operasi minor',
        'sedang': 'Sepsis, bedah tulang, luka bakar, penyakit hati, post operasi mayor',
        'berat': 'HIV AIDS dengan komplikasi, bedah multisistem, TB Paru dengan komplikasi',
        'sangat_berat': 'Luka kepala berat, trauma multipel, luka bakar luas'
    };

    useEffect(() => {
        if (editData && isOpen) {
            setSelectedPatient(editData.patientId);

            const hasVitals = editData.temperature || editData.bloodPressure ||
                editData.heartRate || editData.bloodSugar;
            const hasMeds = editData.medicationsGiven && editData.medicationsGiven.length > 0;
            const hasEdu = !!editData.education;

            if (hasVitals) {
                setVisitationType('vital');
                setVitalSigns({
                    temperature: editData.temperature?.toString() || '',
                    bloodPressure: editData.bloodPressure || '',
                    heartRate: editData.heartRate?.toString() || '',
                    respiratoryRate: editData.respiratoryRate?.toString() || '',
                    oxygenSaturation: editData.oxygenSaturation?.toString() || '',
                    bloodSugar: editData.bloodSugar?.toString() || '',
                    weight: editData.weight?.toString() || '',
                    height: editData.height?.toString() || ''
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

    const calculateEnergy = () => {
        const selectedPatientData = patients.find(p => p.id === selectedPatient);
        if (!selectedPatientData) return;

        const h = parseFloat(vitalSigns.height || selectedPatientData.height?.toString() || '0');
        const w = parseFloat(vitalSigns.weight || selectedPatientData.weight?.toString() || '0');

        if (!h || !w || h < 100 || w < 20) {
            alert('Tinggi dan berat badan harus valid untuk perhitungan energi');
            return;
        }

        const age = calculateAge(selectedPatientData.birthDate);
        const isMale = selectedPatientData.gender === 'MALE';

        let bbi: number;
        if ((isMale && h < 150) || (!isMale && h < 160)) {
            bbi = h - 100;
        } else {
            bbi = (h - 100) - (0.1 * (h - 100));
        }

        const bmr = isMale ? (30 * bbi) : (25 * bbi);

        const activityFactors: { [key: string]: number } = {
            'bedrest': 0.10,
            'ringan': 0.20,
            'sedang': 0.30,
            'berat': 0.45
        };
        const activityAdd = bmr * activityFactors[activityLevel];

        let ageReduction = 0;
        if (age >= 70) ageReduction = 0.15;
        else if (age >= 60) ageReduction = 0.10;
        else if (age >= 40) ageReduction = 0.05;
        const ageSubtract = bmr * ageReduction;

        const energyAfterActivity = bmr + activityAdd - ageSubtract;

        const bmi = w / Math.pow(h / 100, 2);
        let nutritionStatus = 'Normal';
        let nutritionCorrection = 0;

        if (bmi < 18.5) {
            nutritionStatus = 'Kurang';
            nutritionCorrection = bmr * 0.20;
        } else if (bmi >= 25 && bmi < 30) {
            nutritionStatus = 'Overweight';
            nutritionCorrection = bmr * -0.10;
        } else if (bmi >= 30) {
            nutritionStatus = 'Obesitas';
            nutritionCorrection = bmr * -0.20;
        }

        const energyAfterNutrition = energyAfterActivity + nutritionCorrection;

        const stressFactors: { [key: string]: number } = {
            'tidak_ada': 1.3,
            'ringan': 1.4,
            'sedang': 1.5,
            'berat': 1.6,
            'sangat_berat': 1.7
        };
        const stressMultiplier = stressFactors[stressLevel];
        const finalEnergy = Math.round(energyAfterNutrition * stressMultiplier);

        const result: EnergyCalculationResult = {
            bbi: Math.round(bbi * 10) / 10,
            bmr: Math.round(bmr),
            totalEnergy: finalEnergy,
            activityFactor: activityLevel,
            ageFactor: ageReduction,
            stressFactor: stressMultiplier,
            nutritionStatus,
            breakdown: {
                baseEnergy: Math.round(bmr),
                withActivity: Math.round(bmr + activityAdd),
                withAge: Math.round(energyAfterActivity),
                withNutrition: Math.round(energyAfterNutrition),
                withStress: Math.round(energyAfterNutrition * stressMultiplier),
                final: finalEnergy
            }
        };

        setEnergyCalculation(result);
        setShowEnergyCalc(true);
    };

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
            // Hitung BMI jika ada tinggi dan berat
            let calculatedBMI: number | null = null;
            if (vitalSigns.height && vitalSigns.weight) {
                const h = parseFloat(vitalSigns.height);
                const w = parseFloat(vitalSigns.weight);
                if (h > 0 && w > 0) {
                    calculatedBMI = w / Math.pow(h / 100, 2);
                }
            }

            // Filter medications yang tidak kosong
            const filteredMedications = medications.filter(m => m && m.trim() !== '');

            const payload: any = {
                patientId: selectedPatient,
                shift: currentShift,

                temperature: vitalSigns.temperature && vitalSigns.temperature.trim()
                    ? parseFloat(vitalSigns.temperature)
                    : null,
                bloodPressure: vitalSigns.bloodPressure?.trim() || null,
                heartRate: vitalSigns.heartRate && vitalSigns.heartRate.trim()
                    ? parseInt(vitalSigns.heartRate)
                    : null,
                respiratoryRate: vitalSigns.respiratoryRate && vitalSigns.respiratoryRate.trim()
                    ? parseInt(vitalSigns.respiratoryRate)
                    : null,
                oxygenSaturation: vitalSigns.oxygenSaturation && vitalSigns.oxygenSaturation.trim()
                    ? parseInt(vitalSigns.oxygenSaturation)
                    : null,
                bloodSugar: vitalSigns.bloodSugar && vitalSigns.bloodSugar.trim()
                    ? parseInt(vitalSigns.bloodSugar)
                    : null,
                weight: vitalSigns.weight && vitalSigns.weight.trim()
                    ? parseFloat(vitalSigns.weight)
                    : null,
                height: vitalSigns.height && vitalSigns.height.trim()
                    ? parseInt(vitalSigns.height)
                    : null,

                // MEDICAL DATA
                medicationsGiven: filteredMedications,
                education: education?.trim() || null,
                complications: complications?.trim() || null,
                notes: notes?.trim() || null,

                // DIET MONITORING
                dietCompliance: dietCompliance?.trim() ? parseInt(dietCompliance) : null,
                dietIssues: dietIssues?.trim() || null,

                energyRequirement: energyCalculation?.totalEnergy || null,
                calculatedBMI: calculatedBMI ? parseFloat(calculatedBMI.toFixed(2)) : null,
                calculatedBBI: energyCalculation?.bbi || null,
                basalMetabolicRate: energyCalculation?.bmr || null,
                activityLevel: energyCalculation ? activityLevel : null,
                stressLevel: energyCalculation ? stressLevel : null,
                stressFactor: energyCalculation?.stressFactor || null,
                nutritionStatus: energyCalculation?.nutritionStatus || null,
                energyCalculationDetail: energyCalculation ? {
                    bbi: energyCalculation.bbi,
                    bmr: energyCalculation.bmr,
                    activityLevel: activityLevel,
                    stressLevel: stressLevel,
                    stressFactor: energyCalculation.stressFactor,
                    nutritionStatus: energyCalculation.nutritionStatus,
                    ageFactor: energyCalculation.ageFactor,
                    breakdown: energyCalculation.breakdown,
                    calculatedAt: new Date().toISOString(),
                    calculatedBy: 'nurse'
                } : null
            };

            console.log('=== PAYLOAD TO API ===');
            console.log(JSON.stringify(payload, null, 2));

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

            if (!response.ok) {
                throw new Error(responseData.error || responseData.details || `Server error: ${response.status}`);
            }

            alert(editData ? 'Visitasi berhasil diupdate!' : 'Visitasi berhasil disimpan!');

            resetForm();
            onSave();

        } catch (error) {
            console.error('Error saving visitation:', error);
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
        setEnergyCalculation(null);
        setShowEnergyCalc(false);
        setActivityLevel('ringan');
        setStressLevel('tidak_ada');
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
                                            className={`w-full px-4 py-3 pr-10 text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none text-gray-900 font-medium ${errors.patient ? 'border-red-300' : 'border-gray-300'}`}
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
                                                <tr>
                                                    <td className="text-gray-600 pr-4">Usia</td>
                                                    <td className="px-1">:</td>
                                                    <td className="font-semibold text-gray-900">{calculateAge(selectedPatientData.birthDate)} tahun</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-gray-600 pr-4">Jenis Kelamin</td>
                                                    <td className="px-1">:</td>
                                                    <td className="font-semibold text-gray-900">{selectedPatientData.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}</td>
                                                </tr>
                                                {selectedPatientData.bmi && (
                                                    <tr>
                                                        <td className="text-gray-600 pr-4">BMI</td>
                                                        <td className="px-1">:</td>
                                                        <td className="font-semibold text-gray-900">{selectedPatientData.bmi.toFixed(1)}</td>
                                                    </tr>
                                                )}
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
                                    <Activity className="h-5 w-5 text-green-600 mr-2" />
                                    <h4 className="font-medium text-gray-900">Data Vital Signs</h4>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Suhu (C)</label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tekanan Darah</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base text-gray-700"
                                            placeholder="120/80"
                                            value={vitalSigns.bloodPressure}
                                            onChange={(e) => setVitalSigns({ ...vitalSigns, bloodPressure: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nadi (bpm)</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base text-gray-700"
                                            placeholder="75"
                                            value={vitalSigns.heartRate}
                                            onChange={(e) => setVitalSigns({ ...vitalSigns, heartRate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Pernapasan (x/mnt)</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base text-gray-700"
                                            placeholder="20"
                                            value={vitalSigns.respiratoryRate}
                                            onChange={(e) => setVitalSigns({ ...vitalSigns, respiratoryRate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">SpO2 (%)</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base text-gray-700"
                                            placeholder="98"
                                            value={vitalSigns.oxygenSaturation}
                                            onChange={(e) => setVitalSigns({ ...vitalSigns, oxygenSaturation: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">GDS (mg/dL)</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base text-gray-700"
                                            placeholder="120"
                                            value={vitalSigns.bloodSugar}
                                            onChange={(e) => setVitalSigns({ ...vitalSigns, bloodSugar: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Berat Badan (kg)</label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tinggi Badan (cm)</label>
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
                                        className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
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
                                    placeholder="Tuliskan materi edukasi yang diberikan kepada pasien..."
                                    value={education}
                                    onChange={(e) => setEducation(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="bg-white border rounded-lg p-4">
                            <div className="flex items-center mb-4">
                                <Calculator className="h-5 w-5 text-green-600 mr-2" />
                                <h4 className="font-semibold text-gray-900">Perhitungan Kebutuhan Energi (PERKENI 2015)</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Aktivitas Fisik</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                                        value={activityLevel}
                                        onChange={(e) => setActivityLevel(e.target.value)}
                                    >
                                        <option value="bedrest">Bedrest (10% dari BMR)</option>
                                        <option value="ringan">Ringan (20% dari BMR)</option>
                                        <option value="sedang">Sedang (30% dari BMR)</option>
                                        <option value="berat">Berat (40-50% dari BMR)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat Stres</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                                        value={stressLevel}
                                        onChange={(e) => setStressLevel(e.target.value)}
                                    >
                                        <option value="tidak_ada">Tidak Ada Stres (1.2-1.3)</option>
                                        <option value="ringan">Stres Ringan (1.3-1.4)</option>
                                        <option value="sedang">Stres Sedang (1.4-1.5)</option>
                                        <option value="berat">Stres Berat (1.5-1.6)</option>
                                        <option value="sangat_berat">Stres Sangat Berat (1.7)</option>
                                    </select>
                                    {stressLevel && (
                                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                                            <strong>Deskripsi:</strong> {stressDescriptions[stressLevel]}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={calculateEnergy}
                                className="ml-auto bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center space-x-2"
                            >
                                <Calculator className="h-4 w-4" />
                                <span>Hitung Kebutuhan Energi</span>
                            </button>

                            {showEnergyCalc && energyCalculation && (
                                <div className="mt-4 space-y-3">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h5 className="font-semibold text-blue-900 mb-3 flex items-center">
                                            <Info className="h-4 w-4 mr-2" />
                                            Hasil Perhitungan
                                        </h5>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-700">Berat Badan Ideal (BBI):</span>
                                                <span className="font-semibold text-gray-900">{energyCalculation.bbi} kg</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-700">BMR Dasar:</span>
                                                <span className="font-semibold text-gray-900">{energyCalculation.breakdown.baseEnergy} kkal</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-700">+ Aktivitas Fisik:</span>
                                                <span className="font-semibold text-gray-900">{energyCalculation.breakdown.withActivity} kkal</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-700">- Koreksi Usia ({(energyCalculation.ageFactor * 100).toFixed(0)}%):</span>
                                                <span className="font-semibold text-gray-900">{energyCalculation.breakdown.withAge} kkal</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-700">+/- Koreksi Status Gizi ({energyCalculation.nutritionStatus}):</span>
                                                <span className="font-semibold text-gray-900">{energyCalculation.breakdown.withNutrition} kkal</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-700">x Faktor Stres ({energyCalculation.stressFactor}):</span>
                                                <span className="font-semibold text-gray-900">{energyCalculation.breakdown.withStress} kkal</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-green-800">Kebutuhan Energi Total:</span>
                                            <span className="text-2xl font-bold text-green-900">{energyCalculation.totalEnergy} kkal/hari</span>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start space-x-2">
                                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-yellow-800">
                                            Data ini akan otomatis tersimpan dan dapat diakses oleh Ahli Gizi untuk perencanaan diet pasien.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>


                        <div className="bg-white border border-gray-300 rounded-lg p-4">
                            <div className="flex items-center mb-3">
                                <Utensils className="h-5 w-5 text-green-600 mr-2" />
                                <h4 className="font-medium text-gray-900">Monitoring Diet Pasien</h4>
                                <span className="text-gray-500 text-sm ml-2">(Opsional)</span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Persentase Kepatuhan Diet (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-base text-gray-900 font-semibold"
                                        placeholder="Contoh: 75 (untuk 75%)"
                                        value={dietCompliance}
                                        onChange={(e) => setDietCompliance(e.target.value)}
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Estimasi berdasarkan porsi makanan yang dihabiskan pasien
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Masalah/Kendala Diet yang Ditemukan
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 resize-none text-base text-gray-900"
                                        rows={4}
                                        placeholder="Contoh: Pasien menolak makan sayur, hanya menghabiskan 50% porsi makan siang, tidak mengikuti jadwal snack..."
                                        value={dietIssues}
                                        onChange={(e) => setDietIssues(e.target.value)}
                                    />
                                    <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                        <p className="text-xs text-orange-800 flex items-start">
                                            <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                                            <span>
                                                <strong>Penting:</strong> Jika terdapat masalah diet yang memerlukan perhatian khusus (kepatuhan rendah, penolakan makanan, dll),
                                                sistem akan otomatis membuat alert untuk Ahli Gizi agar dapat segera melakukan evaluasi dan penyesuaian rencana diet.
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

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
                                {energyCalculation && (
                                    <div className="flex justify-between items-start pt-2 border-t border-gray-200">
                                        <span className="text-blue-600 font-medium">Kebutuhan Energi</span>
                                        <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                            {energyCalculation.totalEnergy} kkal/hari
                                        </span>
                                    </div>
                                )}
                                {complications.trim() && (
                                    <div className="flex justify-between items-start pt-2 border-t border-gray-200">
                                        <span className="text-red-600 font-medium">Komplikasi Tercatat</span>
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
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
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