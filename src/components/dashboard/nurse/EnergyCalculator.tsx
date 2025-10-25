import React, { useState } from 'react';
import { Calculator, Info, AlertCircle } from 'lucide-react';

interface EnergyCalculatorProps {
    patient: {
        height?: number;
        weight?: number;
        birthDate: Date;
        gender: 'MALE' | 'FEMALE';
    };
    vitalSigns: {
        height?: string;
        weight?: string;
    };
    onCalculationComplete: (result: EnergyCalculationResult) => void;
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

const EnergyCalculator: React.FC<EnergyCalculatorProps> = ({ patient, onCalculationComplete }) => {
    const [height, setHeight] = useState(patient.height?.toString() || '');
    const [weight, setWeight] = useState(patient.weight?.toString() || '');
    const [activityLevel, setActivityLevel] = useState('ringan');
    const [stressLevel, setStressLevel] = useState('tidak_ada');
    const [result, setResult] = useState<EnergyCalculationResult | null>(null);
    const [showCalculation, setShowCalculation] = useState(false);

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
        const h = parseFloat(height);
        const w = parseFloat(weight);

        if (!h || !w || h < 100 || w < 20) {
            alert('Tinggi dan berat badan harus valid');
            return;
        }

        const age = calculateAge(patient.birthDate);
        const isMale = patient.gender === 'MALE';

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

        const calculationResult: EnergyCalculationResult = {
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

        setResult(calculationResult);
        onCalculationComplete(calculationResult);
        setShowCalculation(true);
    };

    const stressDescriptions: { [key: string]: string } = {
        'tidak_ada': 'Tidak ada stres metabolik, kondisi stabil, status gizi normal',
        'ringan': 'Peradangan ringan, operasi kecil, kanker, bedah efektif, trauma ringan, post operasi minor',
        'sedang': 'Sepsis, bedah tulang, luka bakar, penyakit hati, post operasi mayor',
        'berat': 'HIV AIDS dengan komplikasi, bedah multisistem, TB Paru dengan komplikasi',
        'sangat_berat': 'Luka kepala berat, trauma multipel, luka bakar luas'
    };

    return (
        <div className="bg-white border border-blue-300 rounded-lg p-4">
            <div className="flex items-center mb-4">
                <Calculator className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="font-semibold text-gray-900">Perhitungan Kebutuhan Energi</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tinggi Badan (cm) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="170"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Berat Badan (kg) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="65"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Aktivitas Fisik <span className="text-red-500">*</span>
                    </label>
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tingkat Stres <span className="text-red-500">*</span>
                    </label>
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center space-x-2"
            >
                <Calculator className="h-4 w-4" />
                <span>Hitung Kebutuhan Energi</span>
            </button>

            {result && showCalculation && (
                <div className="mt-4 space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-900 mb-3 flex items-center">
                            <Info className="h-4 w-4 mr-2" />
                            Hasil Perhitungan (PERKENI 2015)
                        </h5>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-700">Berat Badan Ideal (BBI):</span>
                                <span className="font-semibold text-gray-900">{result.bbi} kg</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-700">BMR Dasar:</span>
                                <span className="font-semibold text-gray-900">{result.breakdown.baseEnergy} kkal</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-700">+ Aktivitas Fisik:</span>
                                <span className="font-semibold text-gray-900">{result.breakdown.withActivity} kkal</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-700">- Koreksi Usia ({(result.ageFactor * 100).toFixed(0)}%):</span>
                                <span className="font-semibold text-gray-900">{result.breakdown.withAge} kkal</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-700">+/- Koreksi Status Gizi ({result.nutritionStatus}):</span>
                                <span className="font-semibold text-gray-900">{result.breakdown.withNutrition} kkal</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-700">x Faktor Stres ({result.stressFactor}):</span>
                                <span className="font-semibold text-gray-900">{result.breakdown.withStress} kkal</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-green-800">Kebutuhan Energi Total:</span>
                            <span className="text-2xl font-bold text-green-900">{result.totalEnergy} kkal/hari</span>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-yellow-800">
                            Data ini akan otomatis tersimpan dan dapat diakses oleh Ahli Gizi untuk perencanaan diet pasien.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnergyCalculator;