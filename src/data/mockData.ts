// src/data/mockData.ts

// admin 
export interface NewStaff {
    name: string;
    role: string;
    username: string;
    email: string;
    employeeId: string;
    password: string;
}

export interface Patient {
    id: string;
    mrNumber: string;
    name: string;
    age: number;
    gender: 'L' | 'P';
    diabetesType: 'Tipe 1' | 'Tipe 2';
    lastVisit: string;
    bloodSugar: {
        value: number;
        date: string;
        trend: 'increasing' | 'stable' | 'decreasing';
    };
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    vitalSigns: {
        bloodPressure: string;
        heartRate: number;
        temperature: number;
        weight: number;
    };
    insuranceType: string;
    status: 'Aktif' | 'Rujuk Balik' | 'active' | 'monitoring' | 'follow_up';
    nextAppointment?: string;
    complications?: string[];
    medications?: Medication[];
    dietCompliance?: number;
    allergies?: string[];
    bmi?: number;
    weight?: number;
    height?: number;
    calorieNeeds?: number;
    calorieRequirement?: number;
    dietPlan?: string;
}

//doctordashboard
export interface Medication {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate?: string;
    interactions?: string[];
}

export interface Alert {
    id: string;
    type: 'CRITICAL' | 'WARNING' | 'INFO';
    message: string;
    patientName: string;
    patientMR: string;
    timestamp: string;
    category: string;
}

// NutritionistDashboard
export interface FoodItem {
    id: string;
    name: string;
    category: string;
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    fiber: number;
    glycemicIndex: number;
    diabeticFriendly: boolean;
    sodium: number;
    sugar: number;
    portion: string;
}

export interface MealEntry {
    id: string;
    patientId: string;
    date: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    foods: Array<{
        foodId: string;
        foodName: string;
        portion: number; // in grams
        calories: number;
        carbs: number;
        protein: number;
        fat: number;
    }>;
    totalCalories: number;
    totalCarbs: number;
    totalProtein: number;
    totalFat: number;
    bloodSugarBefore?: number;
    bloodSugarAfter?: number;
    notes: string;
}

export interface NutritionPlan {
    id: string;
    patientId: string;
    targetCalories: number;
    carbLimit: number;
    proteinGoal: number;
    fatLimit: number;
    mealDistribution: {
        breakfast: number;
        lunch: number;
        dinner: number;
        snacks: number;
    };
    restrictions: string[];
    goals: string[];
    createdDate: string;
    lastUpdated: string;
    compliance: number;
}

export interface FoodRecall {
    id: string;
    patientId: string;
    date: string;
    meals: MealEntry[];
    totalCalories: number;
    totalCarbs: number;
    totalProtein: number;
    totalFat: number;
    complianceScore: number;
}

// PharmacyDashboard
export interface DrugData {
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

export interface PatientComplaint {
    id: string;
    patientId: string;
    date: string;
    complaint: string;
    severity: 'Ringan' | 'Sedang' | 'Berat';
    status: 'Baru' | 'Dalam Proses' | 'Selesai';

}

export interface LabResult {
    id: string;
    patientId: string;
    testType: string;
    value: string;
    normalRange: string;
    date: string;
    status: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL';
}

export interface PharmacyNote {
    id: string;
    patientId: string;
    date: string;
    note: string;
    pharmacist: string;
    category: 'MEDICATION' | 'COUNSELING' | 'MONITORING' | 'ADVERSE_REACTION';
}

export interface BloodSugarHistory {
    id: string;
    patientId: string;
    value: number;
    date: string;
    time: string;
    notes: string;
}

// nurse 
export interface VitalSigns {
    temperature: string;
    bloodPressure: string;
    heartRate: string;
    respiratoryRate: string;
    oxygenSaturation: string;
    bloodSugar: string;
    weight: string;
    height: string;
}

export interface Visitation {
    id: string;
    patientId: string;
    date: string;
    shift: 'pagi' | 'sore';
    complaints: string;
    medications: string;
    labResults: string;
    actions: string;
    vitalSigns: VitalSigns;
    complications: string;
    education: string;
    notes: string;
}

export interface PatientLog {
    id: string;
    patientId: string;
    roomNumber: string;
    bedNumber: string;
    admissionDate: string;
    diagnosis: string;
    comorbidities: string[];
    allergies: string[];
    currentMedications: string[];
    visitationHistory: Visitation[];
}
// Mock Patients Data
export const mockPatients: Patient[] = [
    {
        id: '1',
        mrNumber: 'RM1001',
        name: 'Budi Santoso',
        age: 55,
        gender: 'L',
        diabetesType: 'Tipe 2',
        lastVisit: '2024-08-20',
        bloodSugar: { value: 180, date: '01/08/2025', trend: 'increasing' },
        riskLevel: 'HIGH',
        nextAppointment: '2024-08-25',
        complications: ['Neuropati', 'Retinopati'],
        medications: [
            {
                id: '1',
                name: 'Metformin 500mg',
                dosage: '500mg',
                frequency: '2x sehari',
                startDate: '01/08/2025',
                interactions: ['Glimepiride'],
            },
            {
                id: '2',
                name: 'Glimepiride 2mg',
                dosage: '2mg',
                frequency: '1x sehari',
                startDate: '15/08/2025',
                interactions: ['Metformin'],
            },
        ],
        dietCompliance: 40,
        vitalSigns: { bloodPressure: '140/90', heartRate: 85, temperature: 36.8, weight: 75 },
        insuranceType: 'BPJS',
        status: 'Aktif',
        allergies: ['Sulfa', 'Ruam kulit'],
        bmi: 26.0,
        weight: 75,
        height: 168,
        calorieNeeds: 1800,
        calorieRequirement: 1800,
        dietPlan: 'Diet rendah gula, tinggi serat',
    },
    {
        id: '2',
        mrNumber: 'RM1002',
        name: 'Siti Rahayu',
        age: 59,
        gender: 'P',
        diabetesType: 'Tipe 2',
        lastVisit: '2024-08-18',
        bloodSugar: { value: 145, date: '15/07/2025', trend: 'stable' },
        riskLevel: 'MEDIUM',
        medications: [
            {
                id: '3',
                name: 'Metformin 500mg',
                dosage: '500mg',
                frequency: '2x sehari',
                startDate: '15/07/2025',
            },
        ],
        dietCompliance: 85,
        vitalSigns: { bloodPressure: '130/85', heartRate: 78, temperature: 36.5, weight: 58 },
        insuranceType: 'Pribadi',
        status: 'Rujuk Balik',
        bmi: 25.4,
        weight: 58,
        height: 160,
        calorieNeeds: 1600,
        calorieRequirement: 1600,
        dietPlan: 'Kontrol porsi, hindari makanan manis',
        allergies: ['Gluten'],
    },
    {
        id: '3',
        mrNumber: 'RM1003',
        name: 'Ahmad Wijaya',
        age: 50,
        gender: 'L',
        diabetesType: 'Tipe 2',
        lastVisit: '2024-08-15',
        bloodSugar: { value: 220, date: '01/07/2025', trend: 'increasing' },
        riskLevel: 'HIGH',
        medications: [
            {
                id: '4',
                name: 'Metformin 850mg',
                dosage: '850mg',
                frequency: '2x sehari',
                startDate: '01/07/2025',
            },
            {
                id: '5',
                name: 'Insulin',
                dosage: '10 unit',
                frequency: '2x sehari',
                startDate: '01/07/2025',
            },
        ],
        dietCompliance: 60,
        vitalSigns: { bloodPressure: '150/95', heartRate: 88, temperature: 36.7, weight: 82 },
        insuranceType: 'BPJS',
        status: 'Aktif',
        bmi: 27.7,
        weight: 82,
        height: 172,
        calorieNeeds: 2000,
        calorieRequirement: 2000,
        dietPlan: 'Diet ketat, hindari gula tambahan',
        allergies: [],
    },
    {
        id: '4',
        mrNumber: 'RM1004',
        name: 'Dewi Lestari',
        age: 45,
        gender: 'P',
        diabetesType: 'Tipe 1',
        lastVisit: '2024-08-12',
        bloodSugar: { value: 110, date: '10 /08/2025', trend: 'stable' },
        riskLevel: 'LOW',
        medications: [
            {
                id: '6',
                name: 'Insulin Rapid',
                dosage: '8 unit',
                frequency: '3x sehari',
                startDate: '10/08/2025',
            },
        ],
        dietCompliance: 90,
        vitalSigns: { bloodPressure: '125/80', heartRate: 72, temperature: 36.4, weight: 55 },
        insuranceType: 'Asuransi Swasta',
        status: 'Rujuk Balik',
        bmi: 21.5,
        weight: 55,
        height: 160,
        calorieNeeds: 1500,
        calorieRequirement: 1500,
        dietPlan: 'Diet seimbang, olahraga teratur',
        allergies: [],
    },
];

// Mock Alerts Data
export const mockAlerts: Alert[] = [
    {
        id: '1',
        type: 'CRITICAL',
        message: 'Budi Santoso: Potensi interaksi obat',
        patientName: 'Budi Santoso',
        patientMR: 'RM1001',
        timestamp: '08:30',
        category: 'medication'
    },
    {
        id: '2',
        type: 'WARNING',
        message: 'Ahmad Wijaya: GDS tinggi (220)',
        patientName: 'Ahmad Wijaya',
        patientMR: 'RM1003',
        timestamp: '07:45',
        category: 'blood_sugar'
    },
    {
        id: '3',
        type: 'WARNING',
        message: 'Ahmad Wijaya: Tekanan darah tinggi',
        patientName: 'Ahmad Wijaya',
        patientMR: 'RM1003',
        timestamp: '06:30',
        category: 'vital_signs'
    }
];

export const mockFoodData: FoodItem[] = [
    { id: '1', name: 'Nasi Merah', category: 'Karbohidrat', calories: 110, carbs: 25, protein: 2.5, fat: 1, fiber: 1.8, glycemicIndex: 55, diabeticFriendly: true, sodium: 5, sugar: 0.4, portion: '100g (1 centong)' },
    { id: '2', name: 'Nasi Putih', category: 'Karbohidrat', calories: 130, carbs: 28, protein: 2.7, fat: 0.3, fiber: 0.4, glycemicIndex: 73, diabeticFriendly: false, sodium: 1, sugar: 0.1, portion: '100g (1 centong)' },
    { id: '3', name: 'Ayam Dada Tanpa Kulit', category: 'Protein Hewani', calories: 165, carbs: 0, protein: 31, fat: 3.6, fiber: 0, glycemicIndex: 0, diabeticFriendly: true, sodium: 74, sugar: 0, portion: '100g (1 potong)' },
    { id: '4', name: 'Ikan Salmon', category: 'Protein Hewani', calories: 206, carbs: 0, protein: 28, fat: 12, fiber: 0, glycemicIndex: 0, diabeticFriendly: true, sodium: 47, sugar: 0, portion: '100g (1 fillet)' },
    { id: '5', name: 'Tempe', category: 'Protein Nabati', calories: 193, carbs: 7.6, protein: 20.3, fat: 8.8, fiber: 9, glycemicIndex: 14, diabeticFriendly: true, sodium: 9, sugar: 2.7, portion: '100g (4 potong)' },
    { id: '6', name: 'Tahu', category: 'Protein Nabati', calories: 76, carbs: 1.9, protein: 8.1, fat: 4.8, fiber: 0.4, glycemicIndex: 15, diabeticFriendly: true, sodium: 7, sugar: 0.7, portion: '100g (4 potong)' },
    { id: '7', name: 'Bayam', category: 'Sayuran', calories: 23, carbs: 3.6, protein: 2.9, fat: 0.4, fiber: 2.2, glycemicIndex: 15, diabeticFriendly: true, sodium: 79, sugar: 0.4, portion: '100g (1 mangkok)' },
    { id: '8', name: 'Brokoli', category: 'Sayuran', calories: 25, carbs: 5, protein: 3, fat: 0.4, fiber: 3, glycemicIndex: 10, diabeticFriendly: true, sodium: 33, sugar: 1.5, portion: '100g (1 mangkok)' },
    { id: '9', name: 'Kangkung', category: 'Sayuran', calories: 19, carbs: 3.1, protein: 3, fat: 0.2, fiber: 2.5, glycemicIndex: 15, diabeticFriendly: true, sodium: 113, sugar: 0.5, portion: '100g (1 ikat kecil)' },
    { id: '10', name: 'Alpukat', category: 'Buah', calories: 160, carbs: 9, protein: 2, fat: 15, fiber: 7, glycemicIndex: 27, diabeticFriendly: true, sodium: 7, sugar: 0.7, portion: '100g (1/2 buah)' },
    { id: '11', name: 'Apel', category: 'Buah', calories: 52, carbs: 14, protein: 0.3, fat: 0.2, fiber: 2.4, glycemicIndex: 36, diabeticFriendly: true, sodium: 1, sugar: 10, portion: '100g (1 buah kecil)' },
    { id: '12', name: 'Pepaya', category: 'Buah', calories: 43, carbs: 11, protein: 0.5, fat: 0.3, fiber: 1.7, glycemicIndex: 60, diabeticFriendly: false, sodium: 8, sugar: 7.8, portion: '100g (1 potong)' },
    { id: '13', name: 'Minyak Zaitun', category: 'Lemak Sehat', calories: 884, carbs: 0, protein: 0, fat: 100, fiber: 0, glycemicIndex: 0, diabeticFriendly: true, sodium: 2, sugar: 0, portion: '10ml (1 sdm)' },
    { id: '14', name: 'Kacang Almond', category: 'Snack Sehat', calories: 579, carbs: 22, protein: 21, fat: 50, fiber: 12, glycemicIndex: 15, diabeticFriendly: true, sodium: 1, sugar: 4.4, portion: '30g (1 genggam)' }
];

export const mockNutritionPlans: NutritionPlan[] = [
    {
        id: '1',
        patientId: '1',
        targetCalories: 1800,
        carbLimit: 225,
        proteinGoal: 90,
        fatLimit: 60,
        mealDistribution: { breakfast: 25, lunch: 35, dinner: 30, snacks: 10 },
        restrictions: ['Gula tambahan', 'Makanan tinggi sodium'],
        goals: ['Kontrol gula darah', 'Turun BB 5kg dalam 3 bulan'],
        createdDate: '2024-08-01',
        lastUpdated: '2024-08-20',
        compliance: 65
    },
    {
        id: '2',
        patientId: '2',
        targetCalories: 1600,
        carbLimit: 200,
        proteinGoal: 80,
        fatLimit: 53,
        mealDistribution: { breakfast: 25, lunch: 35, dinner: 30, snacks: 10 },
        restrictions: ['Gluten', 'Makanan manis'],
        goals: ['Pertahankan BB ideal', 'HbA1c < 7%'],
        createdDate: '2024-07-15',
        lastUpdated: '2024-08-18',
        compliance: 85
    },
]

export const mockMealEntries: MealEntry[] = [
    {
        id: '1',
        patientId: '1',
        date: '2024-08-29',
        mealType: 'breakfast',
        foods: [
            { foodId: '1', foodName: 'Nasi Merah', portion: 100, calories: 110, carbs: 25, protein: 2.5, fat: 1 },
            { foodId: '3', foodName: 'Ayam Dada', portion: 80, calories: 132, carbs: 0, protein: 24.8, fat: 2.9 },
            { foodId: '7', foodName: 'Bayam', portion: 100, calories: 23, carbs: 3.6, protein: 2.9, fat: 0.4 }
        ],
        totalCalories: 265,
        totalCarbs: 28.6,
        totalProtein: 30.2,
        totalFat: 4.3,
        bloodSugarBefore: 120,
        bloodSugarAfter: 145,
        notes: 'Pasien merasa kenyang dan puas'
    },
    {
        id: '2',
        patientId: '1',
        date: '2024-08-29',
        mealType: 'lunch',
        foods: [
            { foodId: '1', foodName: 'Nasi Merah', portion: 150, calories: 165, carbs: 37.5, protein: 3.8, fat: 1.5 },
            { foodId: '4', foodName: 'Ikan Salmon', portion: 100, calories: 206, carbs: 0, protein: 28, fat: 12 },
            { foodId: '8', foodName: 'Brokoli', portion: 100, calories: 25, carbs: 5, protein: 3, fat: 0.4 }
        ],
        totalCalories: 396,
        totalCarbs: 42.5,
        totalProtein: 34.8,
        totalFat: 13.9,
        notes: 'Porsi sesuai anjuran'
    }
]


export const mockDrugData: DrugData[] = [
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
]

export const mockPatientComplaint: PatientComplaint[] = [
    {
        id: '1',
        patientId: '1',
        date: '2024-08-20',
        complaint: 'Mual setelah minum obat metformin',
        severity: 'Sedang',
        status: 'Baru'
    },
    {
        id: '2',
        patientId: '2',
        date: '2024-08-18',
        complaint: 'Pusing saat berdiri',
        severity: 'Ringan',
        status: 'Selesai'
    },
    {
        id: '3',
        patientId: '3',
        date: '2024-08-27',
        complaint: 'Penglihatan Kabur',
        severity: 'Berat',
        status: 'Selesai'
    }
]

export const mockLabResult: LabResult[] = [
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
]

export const mockPharmacyNote: PharmacyNote[] = [
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
]

// nursepoli
export const mockBloodSugar: BloodSugarHistory[] = [
    { id: '1', patientId: '1', value: 180, date: '2024-08-29', time: '08:00', notes: 'Setelah sarapan' },
    { id: '2', patientId: '1', value: 145, date: '2024-08-28', time: '07:30', notes: 'Puasa' },
    { id: '3', patientId: '2', value: 145, date: '2024-08-29', time: '08:15', notes: 'Setelah minum obat' },
    { id: '4', patientId: '3', value: 220, date: '2024-08-29', time: '09:00', notes: 'Tidak minum obat' }
]

// Nurse
export const mockPatientLog: PatientLog[] = [
    {
        id: '1',
        patientId: '1',
        roomNumber: 'R201',
        bedNumber: 'B1',
        admissionDate: '2024-08-25',
        diagnosis: 'Diabetes Melitus Tipe 2 dengan Komplikasi',
        comorbidities: ['Hipertensi', 'Neuropati Diabetik'],
        allergies: ['Sulfa', 'Ruam kulit'],
        currentMedications: ['Metformin 500mg 2x/hari', 'Glimepiride 2mg 1x/hari', 'Amlodipine 5mg 1x/hari'],
        visitationHistory: []
    },
    {
        id: '2',
        patientId: '3',
        roomNumber: 'R203',
        bedNumber: 'B2',
        admissionDate: '2024-08-28',
        diagnosis: 'Diabetes Melitus Tipe 2 Dekompensasi',
        comorbidities: ['Hipertensi', 'Obesitas'],
        allergies: [],
        currentMedications: ['Metformin 850mg 2x/hari', 'Insulin Regular 10 unit 2x/hari'],
        visitationHistory: []
    }
]



// Dashboard Statistics
export const dashboardStats = {
    activePatients: 12,
    todayVisits: 6,
    totalAllergies: 7
};

// Utility functions for data manipulation
export const getPatientsByRiskLevel = (riskLevel: 'LOW' | 'MEDIUM' | 'HIGH') => {
    return mockPatients.filter(patient => patient.riskLevel === riskLevel);
};

export const getPatientsByComplianceLevel = (minCompliance: number, maxCompliance?: number) => {
    return mockPatients.filter(patient => {
        const compliance = patient.dietCompliance || 0;
        return maxCompliance
            ? compliance >= minCompliance && compliance < maxCompliance
            : compliance >= minCompliance;
    });
};

export const getPatientsByBMICategory = () => {
    return {
        underweight: mockPatients.filter(p => (p.bmi || 0) > 0 && (p.bmi || 0) < 18.5),
        normal: mockPatients.filter(p => (p.bmi || 0) >= 18.5 && (p.bmi || 0) < 25),
        overweight: mockPatients.filter(p => (p.bmi || 0) >= 25 && (p.bmi || 0) < 30),
        obese: mockPatients.filter(p => (p.bmi || 0) >= 30)
    };
};

export const getAverageCompliance = () => {
    const totalCompliance = mockPatients.reduce((acc, p) => acc + (p.dietCompliance || 0), 0);
    return Math.round(totalCompliance / mockPatients.length);
};

export const getPatientsWithNutritionPlan = () => {
    return mockPatients.filter(p => p.calorieRequirement);
};