// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 12);
  };

  // Insert Users with hashed passwords
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      email: 'admin@pantinugroho.com',
      username: 'admin',
      password: await hashPassword('admin123'),
      name: 'Dr. Bambang Sutrisno',
      role: 'SUPER_ADMIN',
      employeeId: 'ADM001',
    },
  });

  const doctor = await prisma.user.upsert({
    where: { username: 'dokter' },
    update: {},
    create: {
      email: 'dokter@pantinugroho.com',
      username: 'dokter',
      password: await hashPassword('dokter123'),
      name: 'Dr. Sarah Wijayanti, Sp.PD',
      role: 'DOKTER_SPESIALIS',
      employeeId: 'DOC001',
    },
  });

  const nurse = await prisma.user.upsert({
    where: { username: 'perawat_ruangan' },
    update: {},
    create: {
      email: 'perawat.ruangan@pantinugroho.com',
      username: 'perawat_ruangan',
      password: await hashPassword('perawat123'),
      name: 'Sari Indrawati, S.Kep',
      role: 'PERAWAT_RUANGAN',
      employeeId: 'NUR001',
    },
  });

  const nursePoli = await prisma.user.upsert({
    where: { username: 'perawat_poli' },
    update: {},
    create: {
      email: 'perawat.poli@pantinugroho.com',
      username: 'perawat_poli',
      password: await hashPassword('perawat123'),
      name: 'Rina Kartika, S.Kep',
      role: 'PERAWAT_POLI',
      employeeId: 'NUP001',
    },
  });

  const nutritionist = await prisma.user.upsert({
    where: { username: 'ahli_gizi' },
    update: {},
    create: {
      email: 'ahligizi@pantinugroho.com',
      username: 'ahli_gizi',
      password: await hashPassword('gizi123'),
      name: 'Dewi Sartika, S.Gz',
      role: 'AHLI_GIZI',
      employeeId: 'NUT001',
    },
  });

  const pharmacist = await prisma.user.upsert({
    where: { username: 'farmasi' },
    update: {},
    create: {
      email: 'farmasi@pantinugroho.com',
      username: 'farmasi',
      password: await hashPassword('farmasi123'),
      name: 'Budi Santoso, S.Farm, Apt',
      role: 'FARMASI',
      employeeId: 'PHA001',
    },
  });

  const administrasi = await prisma.user.upsert({
    where: { username: 'administrasi' },
    update: {},
    create: {
      email: 'administrasi@pantinugroho.com',
      username: 'administrasi',
      password: await hashPassword('administrasi123'),
      name: 'Ahmad Syahputra, S.Kep',
      role: 'ADMINISTRASI',
      employeeId: 'AS001',
    },
  });

  const manajerial = await prisma.user.upsert({
    where: { username: 'manajer' },
    update: {},
    create: {
      email: 'manajer@pantinugroho.com',
      username: 'manajer',
      password: await hashPassword('manajer123'),
      name: 'Dr Sudohyono',
      role: 'MANAJER',
      employeeId: 'MN001',
    },
  });

  // Insert Patients
  const patient1 = await prisma.patient.upsert({
    where: { mrNumber: 'RM1001' },
    update: {},
    create: {
      mrNumber: 'RM1001',
      name: 'Budi Santoso',
      birthDate: new Date('1969-01-01'),
      gender: 'MALE',
      phone: '08123456789',
      address: 'Jl. Merdeka No. 123, Surabaya',
      height: 168,
      weight: 75,
      bmi: 26.0,
      bloodType: 'O',
      allergies: ['Sulfa', 'Ruam kulit'],
      medicalHistory: 'Riwayat hipertensi sejak 2018, diabetes mellitus tipe 2 sejak 2020',
      diabetesType: 'Tipe 2',
      diagnosisDate: new Date('2020-01-01'),
      comorbidities: ['Neuropati', 'Retinopati'],
      insuranceType: 'BPJS',
      insuranceNumber: 'BPJS-001-123456789',
      lastVisit: new Date('2024-08-20'),
      nextAppointment: new Date('2024-08-25'),
      riskLevel: 'HIGH',
      status: 'RAWAT_INAP',
      dietCompliance: 40,
      calorieNeeds: 1800,
      calorieRequirement: 1800,
      dietPlan: 'Diet rendah gula, tinggi serat',
      createdBy: admin.id,
    },
  });

  const patient2 = await prisma.patient.upsert({
    where: { mrNumber: 'RM1002' },
    update: {},
    create: {
      mrNumber: 'RM1002',
      name: 'Siti Rahayu',
      birthDate: new Date('1965-01-01'),
      gender: 'FEMALE',
      phone: '08234567890',
      address: 'Jl. Diponegoro No. 45, Surabaya',
      height: 160,
      weight: 58,
      bmi: 25.4,
      bloodType: 'A',
      allergies: ['Gluten'],
      medicalHistory: 'Diabetes mellitus tipe 2 sejak 2019, riwayat kolesterol tinggi',
      diabetesType: 'Tipe 2',
      diagnosisDate: new Date('2019-03-15'),
      comorbidities: ['Hiperkolesterolemia'],
      insuranceType: 'PRIVATE',
      insuranceNumber: 'PRV-002-987654321',
      lastVisit: new Date('2024-08-18'),
      riskLevel: 'MEDIUM',
      status: 'RUJUK_KELUAR',
      dietCompliance: 85,
      calorieNeeds: 1600,
      calorieRequirement: 1600,
      dietPlan: 'Kontrol porsi, hindari makanan manis',
      createdBy: admin.id,
    },
  });

  const patient3 = await prisma.patient.upsert({
    where: { mrNumber: 'RM1003' },
    update: {},
    create: {
      mrNumber: 'RM1003',
      name: 'Ahmad Wijaya',
      birthDate: new Date('1974-01-01'),
      gender: 'MALE',
      phone: '08345678901',
      address: 'Jl. Basuki Rahmat No. 78, Surabaya',
      height: 172,
      weight: 82,
      bmi: 27.7,
      bloodType: 'B',
      allergies: [],
      medicalHistory: 'Diabetes mellitus tipe 2 sejak 2021, obesitas, hipertensi tidak terkontrol',
      diabetesType: 'Tipe 2',
      diagnosisDate: new Date('2021-06-10'),
      comorbidities: ['Hipertensi', 'Obesitas'],
      insuranceType: 'BPJS',
      insuranceNumber: 'BPJS-003-456789012',
      lastVisit: new Date('2024-08-15'),
      riskLevel: 'HIGH',
      status: 'RAWAT_INAP',
      dietCompliance: 60,
      calorieNeeds: 2000,
      calorieRequirement: 2000,
      dietPlan: 'Diet ketat, hindari gula tambahan',
      createdBy: admin.id,
    },
  });

  const patient4 = await prisma.patient.upsert({
    where: { mrNumber: 'RM1004' },
    update: {},
    create: {
      mrNumber: 'RM1004',
      name: 'Dewi Lestari',
      birthDate: new Date('1979-01-01'),
      gender: 'FEMALE',
      phone: '08456789012',
      address: 'Jl. Pemuda No. 234, Surabaya',
      height: 160,
      weight: 55,
      bmi: 21.5,
      bloodType: 'AB',
      allergies: [],
      medicalHistory: 'Diabetes mellitus tipe 1 sejak remaja, riwayat keluarga diabetes',
      diabetesType: 'Tipe 1',
      diagnosisDate: new Date('1995-02-20'),
      comorbidities: [],
      insuranceType: 'CORPORATE',
      insuranceNumber: 'CORP-004-789012345',
      lastVisit: new Date('2024-08-12'),
      riskLevel: 'LOW',
      status: 'RAWAT_JALAN',
      dietCompliance: 90,
      calorieNeeds: 1500,
      calorieRequirement: 1500,
      dietPlan: 'Diet seimbang, olahraga teratur',
      createdBy: admin.id,
    },
  });

  const patient5 = await prisma.patient.upsert({
    where: { mrNumber: 'RM1005' },
    update: {},
    create: {
      mrNumber: 'RM1005',
      name: 'Joko Widodo',
      birthDate: new Date('1985-03-15'),
      gender: 'MALE',
      phone: '08567890123',
      address: 'Jl. Pahlawan No. 56, Surabaya',
      height: 175,
      weight: 70,
      bmi: 22.9,
      bloodType: 'O',
      allergies: [],
      medicalHistory: 'Diabetes mellitus tipe 2 baru terdiagnosis',
      diabetesType: 'Tipe 2',
      diagnosisDate: new Date('2024-08-01'),
      comorbidities: [],
      insuranceType: 'BPJS',
      insuranceNumber: 'BPJS-005-567890123',
      riskLevel: 'MEDIUM',
      status: 'AKTIF',
      dietCompliance: 0,
      calorieNeeds: 1900,
      calorieRequirement: 1900,
      dietPlan: null,
      createdBy: admin.id,
    },
  });

  // Create Handled Patients
  const handledPatient1 = await prisma.handledPatient.create({
    data: {
      patientId: patient1.id,
      handledBy: doctor.id,
      diagnosis: 'Diabetes Mellitus Tipe 2 dengan komplikasi neuropati',
      treatmentPlan: 'Kontrol gula darah ketat, terapi insulin, monitoring komplikasi',
      notes: 'Pasien perlu monitoring intensif, gula darah tidak stabil',
      status: 'OBSERVASI',
      priority: 'HIGH',
      nextVisitDate: new Date('2024-09-01'),
      estimatedDuration: '2 minggu',
      specialInstructions: 'Monitor gula darah 4x sehari, diet ketat'
    }
  });

  const handledPatient2 = await prisma.handledPatient.create({
    data: {
      patientId: patient2.id,
      handledBy: doctor.id,
      diagnosis: 'Diabetes Mellitus Tipe 2 terkontrol',
      treatmentPlan: 'Rujuk ke RS Pusat untuk evaluasi komplikasi lebih lanjut',
      notes: 'Pasien memerlukan penanganan di fasilitas yang lebih lengkap',
      status: 'RUJUK_KELUAR',
      priority: 'NORMAL',
      nextVisitDate: null,
      estimatedDuration: null,
      specialInstructions: 'Bawa semua hasil lab dan surat rujukan'
    }
  });

  // Create Staff Records
  await prisma.staffRecord.createMany({
    data: [
      {
        staffId: doctor.id,
        recordType: 'CREDENTIALS',
        title: 'Sertifikat Spesialis Penyakit Dalam',
        content: 'Spesialis Penyakit Dalam dari Universitas Airlangga, 2015',
        metadata: { certificateNumber: 'SP-PD-2015-001', university: 'UNAIR' }
      },
      {
        staffId: nurse.id,
        recordType: 'TRAINING',
        title: 'Pelatihan Diabetes Management',
        content: 'Menyelesaikan pelatihan manajemen diabetes untuk perawat',
        metadata: { completionDate: '2024-06-15', provider: 'PERKENI' }
      },
      {
        staffId: nutritionist.id,
        recordType: 'CREDENTIALS',
        title: 'Ahli Gizi Klinik Bersertifikat',
        content: 'Sarjana Gizi dari Universitas Brawijaya dengan sertifikat ahli gizi klinik',
        metadata: { degree: 'S.Gz', university: 'UB', specialization: 'Clinical Nutrition' }
      }
    ]
  });

  // Create Patient Records for monitoring vital signs and complaints
  await prisma.patientRecord.createMany({
    data: [
      {
        patientId: patient1.id,
        recordType: 'VITAL_SIGNS',
        title: 'Pemeriksaan Tanda Vital Rutin',
        content: 'Tekanan darah tinggi, gula darah tidak terkontrol',
        bloodSugar: 180,
        bloodPressure: '140/90',
        temperature: 36.8,
        heartRate: 85,
        weight: 75,
        metadata: { measuredBy: 'Perawat Ruangan', shift: 'Pagi' }
      },
      {
        patientId: patient1.id,
        recordType: 'COMPLAINTS',
        title: 'Keluhan Mual Setelah Makan',
        content: 'Pasien mengeluh mual setelah makan terutama setelah minum obat metformin',
        metadata: { severity: 'Sedang', duration: '2 hari', treatment: 'Obat diminum setelah makan' }
      },
      {
        patientId: patient3.id,
        recordType: 'VITAL_SIGNS',
        title: 'Monitoring Pasien Dekompensasi',
        content: 'Kondisi emergency, gula darah sangat tinggi',
        bloodSugar: 220,
        bloodPressure: '150/95',
        temperature: 36.7,
        heartRate: 88,
        weight: 82,
        metadata: { urgency: 'High', complications: ['Retinopati', 'Neuropati'] }
      }
    ]
  });

  // Create Lab Results
  await prisma.labResult.createMany({
    data: [
      {
        patientId: patient1.id,
        technicianId: admin.id, // Using admin as lab technician for demo
        testType: 'HbA1c',
        value: '8.5%',
        normalRange: '<7%',
        testDate: new Date('2024-08-15'),
        status: 'HIGH',
        notes: 'Kontrol gula darah buruk, perlu intensifikasi terapi',
        isVerified: true
      },
      {
        patientId: patient1.id,
        technicianId: admin.id,
        testType: 'Kreatinin',
        value: '1.2 mg/dL',
        normalRange: '0.6-1.3 mg/dL',
        testDate: new Date('2024-08-15'),
        status: 'NORMAL',
        notes: 'Fungsi ginjal masih dalam batas normal',
        isVerified: true
      },
      {
        patientId: patient3.id,
        technicianId: admin.id,
        testType: 'HbA1c',
        value: '9.2%',
        normalRange: '<7%',
        testDate: new Date('2024-08-20'),
        status: 'CRITICAL',
        notes: 'Kontrol gula darah sangat buruk, berisiko komplikasi',
        isVerified: true
      }
    ]
  });

  // Create Visitation Records
  // await prisma.visitation.createMany({
  //   data: [
  //     {
  //       patientId: patient1.id,
  //       nurseId: nurse.id,
  //       visitDate: new Date('2024-08-29'),
  //       shift: 'PAGI',
  //       complaints: 'Mual setelah makan, kaki kesemutan',

  //       // VITAL SIGNS - Field terpisah (bukan Json lagi)
  //       temperature: 36.8,
  //       bloodPressure: '140/90',
  //       heartRate: 85,
  //       respiratoryRate: 20,
  //       oxygenSaturation: 98,
  //       bloodSugar: 180,
  //       weight: 75,
  //       // height: null, // Opsional

  //       medicationsGiven: ['Metformin 500mg', 'Glimepiride 2mg'],
  //       labResults: 'HbA1c: 8.5%, Kreatinin: 1.2 mg/dL',
  //       actions: 'Berikan obat anti mual, pantau intake makanan, edukasi diet diabetes',
  //       complications: 'Neuropati ringan pada ekstremitas bawah',
  //       education: 'Edukasi tentang pentingnya kontrol gula darah dan diet yang tepat',
  //       notes: 'Pasien kooperatif, perlu monitoring ketat untuk mencegah komplikasi lebih lanjut',
  //       nextVisitNeeded: true,
  //       priority: 'HIGH'
  //     },
  //     {
  //       patientId: patient3.id,
  //       nurseId: nurse.id,
  //       visitDate: new Date('2024-08-29'),
  //       shift: 'SORE',
  //       complaints: 'Penglihatan kabur, kaki kesemutan, sering haus',

  //       // VITAL SIGNS - Field terpisah
  //       temperature: 36.7,
  //       bloodPressure: '150/95',
  //       heartRate: 88,
  //       respiratoryRate: 22,
  //       oxygenSaturation: 97,
  //       bloodSugar: 220,
  //       weight: 82,
  //       height: 172,

  //       medicationsGiven: ['Metformin 850mg', 'Insulin Regular 10 unit'],
  //       labResults: 'HbA1c: 9.2%',
  //       actions: 'Konsultasi dokter mata, fisioterapi untuk neuropati, adjustment insulin',
  //       complications: 'Retinopati diabetik, neuropati perifer',
  //       education: 'Pentingnya kontrol gula darah yang ketat, tanda-tanda komplikasi',
  //       notes: 'Kondisi memburuk, perlu intensifikasi terapi dan monitoring ketat',
  //       nextVisitNeeded: true,
  //       priority: 'URGENT'
  //     }
  //   ]
  // });
  // Create Nutrition Records
  await prisma.nutritionRecord.createMany({
    data: [
      {
        patientId: patient1.id,
        nutritionistId: nutritionist.id,
        foodRecall: {
          breakfast: { foods: ['Nasi putih', 'Ayam goreng', 'Teh manis'], totalCalories: 650 },
          lunch: { foods: ['Nasi putih', 'Ikan bakar', 'Sayur bening'], totalCalories: 580 },
          dinner: { foods: ['Nasi putih', 'Tempe goreng', 'Sambal'], totalCalories: 520 }
        },
        dietaryPattern: 'Masih sering konsumsi makanan tinggi karbohidrat dan gula',
        foodAllergies: ['Sulfa'],
        targetCalories: 1800,
        carbLimit: 225,
        proteinGoal: 90,
        fatLimit: 60,
        mealDistribution: { breakfast: 25, lunch: 35, dinner: 30, snacks: 10 },
        dietPlan: 'Ganti nasi putih dengan nasi merah, kurangi gorengan, tambah sayuran',
        complianceScore: 40,
        weightChange: 2.0, // naik 2kg
        bmiChange: 0.7,
        nutritionGoals: ['Turun BB 5kg dalam 3 bulan', 'Kontrol gula darah', 'Meningkatkan asupan serat'],
        recommendations: ['Konsumsi 5 porsi sayur dan buah per hari', 'Hindari makanan manis', 'Olahraga 150 menit per minggu']
      },
      {
        patientId: patient2.id,
        nutritionistId: nutritionist.id,
        foodRecall: {
          breakfast: { foods: ['Oatmeal', 'Buah apel', 'Susu rendah lemak'], totalCalories: 350 },
          lunch: { foods: ['Nasi merah', 'Ikan kukus', 'Sayur bayam'], totalCalories: 450 },
          dinner: { foods: ['Salad sayur', 'Tahu bakar', 'Air putih'], totalCalories: 300 }
        },
        dietaryPattern: 'Sudah menerapkan pola makan sehat untuk diabetes',
        foodAllergies: ['Gluten'],
        targetCalories: 1600,
        carbLimit: 200,
        proteinGoal: 80,
        fatLimit: 53,
        mealDistribution: { breakfast: 25, lunch: 35, dinner: 30, snacks: 10 },
        dietPlan: 'Pertahankan pola makan saat ini, variasi menu',
        complianceScore: 85,
        weightChange: -1.5, // turun 1.5kg
        bmiChange: -0.6,
        nutritionGoals: ['Pertahankan BB ideal', 'HbA1c < 7%', 'Cegah komplikasi'],
        recommendations: ['Lanjutkan pola makan sehat', 'Tambah aktivitas fisik', 'Monitor gula darah rutin']
      }
    ]
  });

  // Create Pharmacy Records
  await prisma.pharmacyRecord.createMany({
    data: [
      {
        patientId: patient1.id,
        pharmacistId: pharmacist.id,
        recordType: 'PRESCRIPTION',
        medications: [
          { name: 'Metformin 500mg', dosage: '500mg', frequency: '2x sehari', route: 'Oral', duration: '30 hari' },
          { name: 'Glimepiride 2mg', dosage: '2mg', frequency: '1x sehari', route: 'Oral', duration: '30 hari' }
        ],
        dosageInstructions: 'Metformin diminum setelah makan untuk mengurangi efek samping gastrointestinal',
        drugInteractions: ['Metformin + Glimepiride: Monitor hipoglikemia'],
        contraindications: ['Gagal ginjal berat', 'Ketoasidosis diabetik'],
        counselingNotes: 'Edukasi tentang tanda-tanda hipoglikemia dan cara mengatasinya',
        adherenceScore: 75,
        sideEffects: ['Mual ringan setelah makan'],
        transactionTotal: 85000,
        insuranceClaim: 'BPJS-001-123456789'
      },
      {
        patientId: patient3.id,
        pharmacistId: pharmacist.id,
        recordType: 'COUNSELING',
        medications: [
          { name: 'Metformin 850mg', dosage: '850mg', frequency: '2x sehari', route: 'Oral', duration: '30 hari' },
          { name: 'Insulin Regular', dosage: '10 unit', frequency: '2x sehari', route: 'Subkutan', duration: '1 vial' }
        ],
        dosageInstructions: 'Insulin disuntik 30 menit sebelum makan, rotasi tempat suntikan',
        drugInteractions: ['Insulin + Metformin: Sinergi dalam kontrol gula darah'],
        contraindications: ['Hipoglikemia', 'Alergi insulin'],
        counselingNotes: 'Edukasi teknik injeksi insulin, penyimpanan, dan rotasi tempat suntik',
        adherenceScore: 60,
        sideEffects: ['Lipodistrofi di tempat suntikan'],
        transactionTotal: 150000,
        insuranceClaim: 'BPJS-003-456789012'
      }
    ]
  });

  // Create Medical Reports
  await prisma.medicalReport.createMany({
    data: [
      {
        patientId: patient1.id,
        doctorId: doctor.id,
        reportType: 'PROGRESS_NOTE',
        chiefComplaint: 'Kontrol rutin diabetes, keluhan mual setelah makan',
        historyOfIllness: 'Diabetes mellitus tipe 2 sejak 2020, hipertensi sejak 2018',
        physicalExamination: {
          general: 'Tampak sakit sedang',
          vital: { BP: '140/90', HR: '85', T: '36.8', RR: '20' },
          abdomen: 'Nyeri epigastrium ringan',
          extremities: 'Sensasi berkurang di kaki'
        },
        diagnosis: 'Diabetes Mellitus Tipe 2 dengan neuropati perifer, Gastropati diabetik',
        differentialDx: ['Gastritis', 'GERD', 'Neuropati otonom'],
        treatmentPlan: 'Adjustment dosis metformin, tambah proton pump inhibitor',
        medications: [
          { name: 'Metformin', dose: '500mg', freq: '2x1', instruction: 'Setelah makan' },
          { name: 'Omeprazole', dose: '20mg', freq: '1x1', instruction: 'Sebelum makan' }
        ],
        labOrders: ['HbA1c kontrol', 'Fungsi ginjal', 'Elektrolit'],
        followUpPlan: 'Kontrol 2 minggu, edukasi diet',
        referrals: ['Konsultasi ahli gizi', 'Fisioterapi'],
        recommendations: ['Diet rendah gula', 'Olahraga teratur', 'Monitor gula darah harian'],
        riskFactors: ['Obesitas', 'Riwayat keluarga DM', 'Pola makan tidak sehat'],
        complications: ['Neuropati perifer', 'Gastropati'],
        prognosis: 'Baik dengan kontrol gula darah yang ketat'
      },
      {
        patientId: patient3.id,
        doctorId: doctor.id,
        reportType: 'EMERGENCY',
        chiefComplaint: 'Sesak napas, penglihatan kabur, lemas',
        historyOfIllness: 'DM tipe 2 tidak terkontrol, tidak rutin minum obat',
        physicalExamination: {
          general: 'Tampak sakit berat, dehidrasi',
          vital: { BP: '150/95', HR: '88', T: '36.7', RR: '22' },
          eyes: 'Retinopati diabetik proliferatif',
          extremities: 'Ulkus diabetik grade 2'
        },
        diagnosis: 'Diabetes Mellitus Tipe 2 dekompensasi dengan multiple komplikasi',
        differentialDx: ['Ketoasidosis diabetik', 'Sindrom hiperosmolar'],
        treatmentPlan: 'Stabilisasi gula darah, manajemen komplikasi',
        medications: [
          { name: 'Insulin Regular', dose: '10 unit', freq: '2x1', instruction: 'Subkutan' },
          { name: 'Metformin', dose: '850mg', freq: '2x1', instruction: 'Setelah makan' }
        ],
        labOrders: ['AGD', 'Elektrolit', 'Keton urin', 'HbA1c'],
        followUpPlan: 'Rawat inap, monitoring ketat',
        referrals: ['Konsultasi mata', 'Wound care'],
        recommendations: ['Rawat inap', 'Kontrol gula darah intensif', 'Edukasi kepatuhan'],
        riskFactors: ['Obesitas', 'Poor compliance', 'Tidak kontrol rutin'],
        complications: ['Retinopati proliferatif', 'Ulkus diabetik', 'Neuropati'],
        prognosis: 'Guarded, tergantung kepatuhan pengobatan'
      }
    ]
  });

  // Create Drug Data
  await prisma.drugData.createMany({
    data: [
      // 10.1 INSULINS
      {
        name: 'Novorapid',
        category: 'INSULINS',
        categoryKehamilan: 'B',
        dosageForm: 'Injection',
        strength: '0.5–1 u/kg BB/hari',
        manufacturer: 'NOVO',
        stock: 100,
        expiryDate: new Date('2026-12-31'),
      },
      {
        name: 'Sansulin Rapid',
        category: 'INSULINS',
        categoryKehamilan: 'B',
        dosageForm: 'Injection',
        strength: '0.2–1 u/kg BB/hari',
        manufacturer: 'SANB',
        stock: 100,
        expiryDate: new Date('2026-12-31'),
      },
      {
        name: 'Levemir',
        category: 'INSULINS',
        categoryKehamilan: 'B',
        dosageForm: 'Injection',
        strength: '0.5–1 u/kg BB/hari',
        manufacturer: 'NOVO',
        stock: 100,
        expiryDate: new Date('2026-12-31'),
      },
      {
        name: 'Novomix',
        category: 'INSULINS',
        categoryKehamilan: 'B',
        dosageForm: 'Injection',
        strength: '—',
        manufacturer: 'NOVO',
        stock: 100,
        expiryDate: new Date('2026-12-31'),
      },
      {
        name: 'Lantus',
        category: 'INSULINS',
        categoryKehamilan: 'B',
        dosageForm: 'Injection',
        strength: 'Individual dose, SC tiap 24 jam',
        manufacturer: 'SANB',
        stock: 100,
        expiryDate: new Date('2026-12-31'),
      },
      {
        name: 'Sansulin Log G',
        category: 'INSULINS',
        categoryKehamilan: 'B',
        dosageForm: 'Injection',
        strength: '—',
        manufacturer: 'SANB',
        stock: 100,
        expiryDate: new Date('2026-12-31'),
      },
      {
        name: 'Ryzodeg',
        category: 'INSULINS',
        categoryKehamilan: 'B',
        dosageForm: 'Injection',
        strength: '1–2x sehari',
        manufacturer: 'NOVO',
        stock: 100,
        expiryDate: new Date('2026-12-31'),
      },

      // 10.2 ORAL ANTIDIABETIC AGENTS
      {
        name: 'Glimepiride 1 mg',
        category: 'ORAL ANTIDIABETIC AGENTS',
        categoryKehamilan: 'C',
        dosageForm: 'Tablet',
        strength: '1 mg',
        manufacturer: 'GEN',
        stock: 100,
        expiryDate: new Date('2026-12-31'),
      },
      {
        name: 'Glimepiride 2 mg',
        category: 'ORAL ANTIDIABETIC AGENTS',
        categoryKehamilan: 'C',
        dosageForm: 'Tablet',
        strength: '2 mg',
        manufacturer: 'GEN',
        stock: 100,
        expiryDate: new Date('2026-12-31'),
      },
      {
        name: 'Glimepiride 3 mg',
        category: 'ORAL ANTIDIABETIC AGENTS',
        categoryKehamilan: 'C',
        dosageForm: 'Tablet',
        strength: '3 mg',
        manufacturer: 'GEN',
        stock: 100,
        expiryDate: new Date('2026-12-31'),
      },
      {
        name: 'Metformin 500 mg',
        category: 'ORAL ANTIDIABETIC AGENTS',
        categoryKehamilan: 'B',
        dosageForm: 'Tablet',
        strength: '500 mg',
        manufacturer: 'GEN',
        stock: 100,
        expiryDate: new Date('2026-12-31'),
      },
      {
        name: 'Metformin 850 mg',
        category: 'ORAL ANTIDIABETIC AGENTS',
        categoryKehamilan: 'B',
        dosageForm: 'Tablet',
        strength: '850 mg',
        manufacturer: 'GEN',
        stock: 100,
        expiryDate: new Date('2026-12-31'),
      },
      {
        name: 'Gliclazide MR',
        category: 'ORAL ANTIDIABETIC AGENTS',
        categoryKehamilan: 'C',
        dosageForm: 'Tablet 60 mg MR',
        strength: '60 mg MR',
        manufacturer: 'GEN',
        stock: 100,
        expiryDate: new Date('2026-12-31'),
      },
      {
        name: 'Fonlyn MR',
        category: 'ORAL ANTIDIABETIC AGENTS',
        categoryKehamilan: 'NA',
        dosageForm: 'Tablet 60 mg MR',
        strength: '60 mg MR',
        manufacturer: 'SERV',
        stock: 100,
        expiryDate: new Date('2026-12-31'),
      },
      {
        name: 'Gliquidone',
        category: 'ORAL ANTIDIABETIC AGENTS',
        categoryKehamilan: 'C',
        dosageForm: 'Tablet 30 mg',
        strength: '30 mg',
        manufacturer: 'GEN',
        stock: 100,
        expiryDate: new Date('2026-12-31'),
      },
      {
        name: 'Pioglitazone HCL',
        category: 'ORAL ANTIDIABETIC AGENTS',
        categoryKehamilan: 'C',
        dosageForm: 'Tablet 30 mg',
        strength: '15–30 mg 1× sehari',
        manufacturer: 'GEN',
        stock: 100,
        expiryDate: new Date('2026-12-31'),
      },
    ],
  })


  // Create Drug Transactions
  const drugTransaction1 = await prisma.drugTransaction.create({
    data: {
      patientId: patient1.id,
      status: 'COMPLETED',
      notes: 'Pembayaran melalui BPJS',
      completedAt: new Date('2024-08-25')
    }
  });

  const drugTransaction2 = await prisma.drugTransaction.create({
    data: {
      patientId: patient3.id,
      status: 'COMPLETED',
      notes: 'Pembayaran melalui BPJS, termasuk insulin',
      completedAt: new Date('2024-08-28')
    }
  });

  // Get drug data for transaction items
  const metformin500 = await prisma.drugData.findFirst({ where: { name: 'Metformin 500mg' } });
  const glimepiride = await prisma.drugData.findFirst({ where: { name: 'Glimepiride 2mg' } });
  const insulin = await prisma.drugData.findFirst({ where: { name: 'Insulin Regular' } });

  // Create Drug Transaction Items
  if (metformin500 && glimepiride) {
    await prisma.drugTransactionItem.createMany({
      data: [
        {
          transactionId: drugTransaction1.id,
          drugId: metformin500.id,
          quantity: 60, // 30 hari x 2 tablet
 
        },
        {
          transactionId: drugTransaction1.id,
          drugId: glimepiride.id,
          quantity: 30, // 30 hari x 1 tablet

        }
      ]
    });
  }

  if (metformin500 && insulin) {
    await prisma.drugTransactionItem.createMany({
      data: [
        {
          transactionId: drugTransaction2.id,
          drugId: metformin500.id,
          quantity: 60,
       
        },
        {
          transactionId: drugTransaction2.id,
          drugId: insulin.id,
          quantity: 2, // 2 vial
       
        }
      ]
    });
  }


  
  console.log('  Seeding finished!');
  console.log(`Created users: Admin, Doctor, Nurse (Ruangan & Poli), Nutritionist, Pharmacist, Administration, Manager`);
  console.log(`Created patients: ${patient1.name}, ${patient2.name}, ${patient3.name}, ${patient4.name}, ${patient5.name}`);
  console.log(`Created ${await prisma.handledPatient.count()} handled patients`);
  console.log(`Created ${await prisma.staffRecord.count()} staff records`);
  console.log(`Created ${await prisma.patientRecord.count()} patient records`);
  console.log(`Created ${await prisma.labResult.count()} lab results`);
  console.log(`Created ${await prisma.visitation.count()} visitation records`);
  console.log(`Created ${await prisma.nutritionRecord.count()} nutrition records`);
  console.log(`Created ${await prisma.pharmacyRecord.count()} pharmacy records`);
  console.log(`Created ${await prisma.medicalReport.count()} medical reports`);
  console.log(`Created ${await prisma.drugData.count()} drug data entries`);
  console.log(`Created ${await prisma.drugTransaction.count()} drug transactions`);
  console.log(`Created ${await prisma.alert.count()} alerts`);
}

main()
  .then(() => console.log('🎉 Database seeded successfully!'))
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());