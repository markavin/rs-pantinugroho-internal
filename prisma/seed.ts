// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';


const prisma = new PrismaClient();
// async function seedLoginLogs() {
//   console.log('🔄 Seeding login logs...');

//   // Get all users
//   const users = await prisma.user.findMany();

//   if (users.length === 0) {
//     console.log('No users found, skipping login logs');
//     return;
//   }

//   try {
//     // Generate login logs for the past 7 days
//     const now = new Date();
//     const loginLogs = [];

//     for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
//       const date = new Date(now);
//       date.setDate(date.getDate() - dayOffset);

//       // Generate 3-15 login logs per day
//       const loginsPerDay = Math.floor(Math.random() * 13) + 3;

//       for (let i = 0; i < loginsPerDay; i++) {
//         const user = users[Math.floor(Math.random() * users.length)];

//         // Random time during the day (6 AM to 10 PM)
//         const loginTime = new Date(date);
//         loginTime.setHours(
//           Math.floor(Math.random() * 16) + 6,
//           Math.floor(Math.random() * 60),
//           Math.floor(Math.random() * 60)
//         );

//         // Some sessions are still active (no logout time)
//         const isActive = dayOffset === 0 && Math.random() < 0.3; // 30% of today's sessions are active
//         const logoutTime = isActive ? null : new Date(loginTime.getTime() + Math.random() * 8 * 60 * 60 * 1000); // 0-8 hours later

//         const sessionId = `${user.id}_${loginTime.getTime()}_${Math.random().toString(36).substr(2, 9)}`;

//         loginLogs.push({
//           userId: user.id,
//           loginTime,
//           logoutTime,
//           sessionId,
//           ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
//           userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
//         });
//       }
//     }

//     // Create login logs
//     for (const log of loginLogs) {
//       await prisma.loginLog.create({
//         data: log
//       });
//     }

//     console.log(`✅ Created ${loginLogs.length} login logs`);
//   } catch (error) {
//     console.log('⚠️ LoginLog table not available, skipping login logs:', error.message);
//   }
// }

async function main() {
  console.log('🌱 Start seeding...');

  const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 12);
  };

  // Insert Users
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
      password: await hashPassword('perawat123'), // Hashed password
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
      password: await hashPassword('perawat123'), // Hashed password
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
      password: await hashPassword('gizi123'), // Hashed password
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
      password: await hashPassword('farmasi123'), // Hashed password
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
      password: await hashPassword('administrasi123'), // Hashed password
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
      password: await hashPassword('manajer123'), // Hashed password
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
      status: 'ACTIVE',
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
      status: 'RUJUK_BALIK',
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
      status: 'ACTIVE',
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
      status: 'RUJUK_BALIK',
      dietCompliance: 90,
      calorieNeeds: 1500,
      calorieRequirement: 1500,
      dietPlan: 'Diet seimbang, olahraga teratur',
      createdBy: admin.id,
    },
  });

  // Insert Medications
  await prisma.medication.createMany({
    data: [
      {
        patientId: patient1.id,
        prescribedBy: doctor.id,
        medicationName: 'Metformin 500mg',
        dosage: '500mg',
        frequency: '2x sehari',
        route: 'Oral',
        startDate: new Date('2025-08-01'),
        interactions: ['Glimepiride'],
      },
      {
        patientId: patient1.id,
        prescribedBy: doctor.id,
        medicationName: 'Glimepiride 2mg',
        dosage: '2mg',
        frequency: '1x sehari',
        route: 'Oral',
        startDate: new Date('2025-08-15'),
        interactions: ['Metformin'],
      },
      {
        patientId: patient2.id,
        prescribedBy: doctor.id,
        medicationName: 'Metformin 500mg',
        dosage: '500mg',
        frequency: '2x sehari',
        route: 'Oral',
        startDate: new Date('2025-07-15'),
      },
      {
        patientId: patient3.id,
        prescribedBy: doctor.id,
        medicationName: 'Metformin 850mg',
        dosage: '850mg',
        frequency: '2x sehari',
        route: 'Oral',
        startDate: new Date('2025-07-01'),
      },
      {
        patientId: patient3.id,
        prescribedBy: doctor.id,
        medicationName: 'Insulin',
        dosage: '10 unit',
        frequency: '2x sehari',
        route: 'Injection',
        startDate: new Date('2025-07-01'),
      },
      {
        patientId: patient4.id,
        prescribedBy: doctor.id,
        medicationName: 'Insulin Rapid',
        dosage: '8 unit',
        frequency: '3x sehari',
        route: 'Injection',
        startDate: new Date('2025-08-10'),
      },
    ],
  });

  // Insert Vital Signs
  await prisma.vitalSign.createMany({
    data: [
      {
        patientId: patient1.id,
        recordDate: new Date('2025-08-01'),
        systolicBP: 140,
        diastolicBP: 90,
        heartRate: 85,
        temperature: 36.8,
        bloodGlucose: 180,
        notes: 'Tekanan darah tinggi',
      },
      {
        patientId: patient2.id,
        recordDate: new Date('2025-07-15'),
        systolicBP: 130,
        diastolicBP: 85,
        heartRate: 78,
        temperature: 36.5,
        bloodGlucose: 145,
        notes: 'Kondisi stabil',
      },
      {
        patientId: patient3.id,
        recordDate: new Date('2025-07-01'),
        systolicBP: 150,
        diastolicBP: 95,
        heartRate: 88,
        temperature: 36.7,
        bloodGlucose: 220,
        notes: 'Gula darah tinggi',
      },
      {
        patientId: patient4.id,
        recordDate: new Date('2025-08-10'),
        systolicBP: 125,
        diastolicBP: 80,
        heartRate: 72,
        temperature: 36.4,
        bloodGlucose: 110,
        notes: 'Kondisi baik',
      },
    ],
  });

  // Insert Alerts
  await prisma.alert.createMany({
    data: [
      {
        type: 'CRITICAL',
        message: 'Budi Santoso: Potensi interaksi obat',
        patientId: patient1.id,
        timestamp: '08:30',
        category: 'medication',
      },
      {
        type: 'WARNING',
        message: 'Ahmad Wijaya: GDS tinggi (220)',
        patientId: patient3.id,
        timestamp: '07:45',
        category: 'blood_sugar',
      },
      {
        type: 'WARNING',
        message: 'Ahmad Wijaya: Tekanan darah tinggi',
        patientId: patient3.id,
        timestamp: '06:30',
        category: 'vital_signs',
      },
    ],
  });

  // Insert Food Items
  await prisma.foodItem.createMany({
    data: [
      { name: 'Nasi Merah', category: 'Karbohidrat', calories: 110, carbs: 25, protein: 2.5, fat: 1, fiber: 1.8, glycemicIndex: 55, diabeticFriendly: true, sodium: 5, sugar: 0.4, portion: '100g (1 centong)' },
      { name: 'Nasi Putih', category: 'Karbohidrat', calories: 130, carbs: 28, protein: 2.7, fat: 0.3, fiber: 0.4, glycemicIndex: 73, diabeticFriendly: false, sodium: 1, sugar: 0.1, portion: '100g (1 centong)' },
      { name: 'Ayam Dada Tanpa Kulit', category: 'Protein Hewani', calories: 165, carbs: 0, protein: 31, fat: 3.6, fiber: 0, glycemicIndex: 0, diabeticFriendly: true, sodium: 74, sugar: 0, portion: '100g (1 potong)' },
      { name: 'Ikan Salmon', category: 'Protein Hewani', calories: 206, carbs: 0, protein: 28, fat: 12, fiber: 0, glycemicIndex: 0, diabeticFriendly: true, sodium: 47, sugar: 0, portion: '100g (1 fillet)' },
      { name: 'Tempe', category: 'Protein Nabati', calories: 193, carbs: 7.6, protein: 20.3, fat: 8.8, fiber: 9, glycemicIndex: 14, diabeticFriendly: true, sodium: 9, sugar: 2.7, portion: '100g (4 potong)' },
      { name: 'Tahu', category: 'Protein Nabati', calories: 76, carbs: 1.9, protein: 8.1, fat: 4.8, fiber: 0.4, glycemicIndex: 15, diabeticFriendly: true, sodium: 7, sugar: 0.7, portion: '100g (4 potong)' },
      { name: 'Bayam', category: 'Sayuran', calories: 23, carbs: 3.6, protein: 2.9, fat: 0.4, fiber: 2.2, glycemicIndex: 15, diabeticFriendly: true, sodium: 79, sugar: 0.4, portion: '100g (1 mangkok)' },
      { name: 'Brokoli', category: 'Sayuran', calories: 25, carbs: 5, protein: 3, fat: 0.4, fiber: 3, glycemicIndex: 10, diabeticFriendly: true, sodium: 33, sugar: 1.5, portion: '100g (1 mangkok)' },
      { name: 'Kangkung', category: 'Sayuran', calories: 19, carbs: 3.1, protein: 3, fat: 0.2, fiber: 2.5, glycemicIndex: 15, diabeticFriendly: true, sodium: 113, sugar: 0.5, portion: '100g (1 ikat kecil)' },
      { name: 'Alpukat', category: 'Buah', calories: 160, carbs: 9, protein: 2, fat: 15, fiber: 7, glycemicIndex: 27, diabeticFriendly: true, sodium: 7, sugar: 0.7, portion: '100g (1/2 buah)' },
      { name: 'Apel', category: 'Buah', calories: 52, carbs: 14, protein: 0.3, fat: 0.2, fiber: 2.4, glycemicIndex: 36, diabeticFriendly: true, sodium: 1, sugar: 10, portion: '100g (1 buah kecil)' },
      { name: 'Pepaya', category: 'Buah', calories: 43, carbs: 11, protein: 0.5, fat: 0.3, fiber: 1.7, glycemicIndex: 60, diabeticFriendly: false, sodium: 8, sugar: 7.8, portion: '100g (1 potong)' },
      { name: 'Minyak Zaitun', category: 'Lemak Sehat', calories: 884, carbs: 0, protein: 0, fat: 100, fiber: 0, glycemicIndex: 0, diabeticFriendly: true, sodium: 2, sugar: 0, portion: '10ml (1 sdm)' },
      { name: 'Kacang Almond', category: 'Snack Sehat', calories: 579, carbs: 22, protein: 21, fat: 50, fiber: 12, glycemicIndex: 15, diabeticFriendly: true, sodium: 1, sugar: 4.4, portion: '30g (1 genggam)' },
    ],
  });

  // Get food items for meal entries
  const nasiMerah = await prisma.foodItem.findFirst({ where: { name: 'Nasi Merah' } });
  const ayamDada = await prisma.foodItem.findFirst({ where: { name: 'Ayam Dada Tanpa Kulit' } });
  const bayam = await prisma.foodItem.findFirst({ where: { name: 'Bayam' } });
  const ikanSalmon = await prisma.foodItem.findFirst({ where: { name: 'Ikan Salmon' } });
  const brokoli = await prisma.foodItem.findFirst({ where: { name: 'Brokoli' } });

  // Insert Meal Entries
  const mealEntry1 = await prisma.mealEntry.create({
    data: {
      patientId: patient1.id,
      date: '2024-08-29',
      mealType: 'BREAKFAST',
      totalCalories: 265,
      totalCarbs: 28.6,
      totalProtein: 30.2,
      totalFat: 4.3,
      bloodSugarBefore: 120,
      bloodSugarAfter: 145,
      notes: 'Pasien merasa kenyang dan puas',
    },
  });

  const mealEntry2 = await prisma.mealEntry.create({
    data: {
      patientId: patient1.id,
      date: '2024-08-29',
      mealType: 'LUNCH',
      totalCalories: 396,
      totalCarbs: 42.5,
      totalProtein: 34.8,
      totalFat: 13.9,
      notes: 'Porsi sesuai anjuran',
    },
  });

  // Insert Meal Entry Foods
  if (nasiMerah && ayamDada && bayam) {
    await prisma.mealEntryFood.createMany({
      data: [
        { mealEntryId: mealEntry1.id, foodId: nasiMerah.id, foodName: 'Nasi Merah', portion: 100, calories: 110, carbs: 25, protein: 2.5, fat: 1 },
        { mealEntryId: mealEntry1.id, foodId: ayamDada.id, foodName: 'Ayam Dada', portion: 80, calories: 132, carbs: 0, protein: 24.8, fat: 2.9 },
        { mealEntryId: mealEntry1.id, foodId: bayam.id, foodName: 'Bayam', portion: 100, calories: 23, carbs: 3.6, protein: 2.9, fat: 0.4 },
      ],
    });
  }

  if (nasiMerah && ikanSalmon && brokoli) {
    await prisma.mealEntryFood.createMany({
      data: [
        { mealEntryId: mealEntry2.id, foodId: nasiMerah.id, foodName: 'Nasi Merah', portion: 150, calories: 165, carbs: 37.5, protein: 3.8, fat: 1.5 },
        { mealEntryId: mealEntry2.id, foodId: ikanSalmon.id, foodName: 'Ikan Salmon', portion: 100, calories: 206, carbs: 0, protein: 28, fat: 12 },
        { mealEntryId: mealEntry2.id, foodId: brokoli.id, foodName: 'Brokoli', portion: 100, calories: 25, carbs: 5, protein: 3, fat: 0.4 },
      ],
    });
  }

  // Insert Drug Data
  await prisma.drugData.createMany({
    data: [
      {
        name: 'Metformin 500mg',
        category: 'Antidiabetes',
        dosageForm: 'Tablet',
        strength: '500mg',
        manufacturer: 'Dexa Medica',
        stock: 500,
        expiryDate: new Date('2025-12-31'),
        interactions: ['Glimepiride', 'Insulin'],
        contraindications: ['Gagal ginjal berat', 'Ketoasidosis diabetik'],
        sideEffects: ['Mual', 'Diare', 'Nyeri perut'],
        indications: ['Diabetes melitus tipe 2'],
      },
      {
        name: 'Glimepiride 2mg',
        category: 'Antidiabetes',
        dosageForm: 'Tablet',
        strength: '2mg',
        manufacturer: 'Novartis',
        stock: 300,
        expiryDate: new Date('2025-08-15'),
        interactions: ['Metformin', 'Aspirin'],
        contraindications: ['Diabetes tipe 1', 'Kehamilan'],
        sideEffects: ['Hipoglikemia', 'Pusing', 'Mual'],
        indications: ['Diabetes melitus tipe 2'],
      },
    ],
  });

  // Insert Nutrition Plans
  await prisma.nutritionPlan.createMany({
    data: [
      {
        patientId: patient1.id,
        nutritionistId: nutritionist.id,
        targetCalories: 1800,
        carbLimit: 225,
        proteinGoal: 90,
        fatLimit: 60,
        mealDistribution: { breakfast: 25, lunch: 35, dinner: 30, snacks: 10 },
        restrictions: ['Gula tambahan', 'Makanan tinggi sodium'],
        goals: ['Kontrol gula darah', 'Turun BB 5kg dalam 3 bulan'],
        compliance: 65,
      },
      {
        patientId: patient2.id,
        nutritionistId: nutritionist.id,
        targetCalories: 1600,
        carbLimit: 200,
        proteinGoal: 80,
        fatLimit: 53,
        mealDistribution: { breakfast: 25, lunch: 35, dinner: 30, snacks: 10 },
        restrictions: ['Gluten', 'Makanan manis'],
        goals: ['Pertahankan BB ideal', 'HbA1c < 7%'],
        compliance: 85,
      },
      {
        patientId: patient3.id,
        nutritionistId: nutritionist.id,
        targetCalories: 2000,
        carbLimit: 250,
        proteinGoal: 100,
        fatLimit: 67,
        mealDistribution: { breakfast: 25, lunch: 35, dinner: 30, snacks: 10 },
        restrictions: ['Gula tambahan'],
        goals: ['Kontrol gula darah ketat', 'Turun BB 8kg dalam 4 bulan'],
        compliance: 60,
      },
      {
        patientId: patient4.id,
        nutritionistId: nutritionist.id,
        targetCalories: 1500,
        carbLimit: 188,
        proteinGoal: 75,
        fatLimit: 50,
        mealDistribution: { breakfast: 25, lunch: 35, dinner: 30, snacks: 10 },
        restrictions: [],
        goals: ['Pertahankan BB ideal', 'Kontrol gula darah optimal'],
        compliance: 90,
      },
    ],
  });

  // Insert Food Intakes
  await prisma.foodIntake.createMany({
    data: [
      {
        patientId: patient1.id,
        intakeDate: new Date('2024-08-29'),
        mealType: 'BREAKFAST',
        foodName: 'Nasi Merah',
        portion: '100g (1 centong)',
        calories: 110,
        carbs: 25,
        protein: 2.5,
        fat: 1,
      },
      {
        patientId: patient1.id,
        intakeDate: new Date('2024-08-29'),
        mealType: 'BREAKFAST',
        foodName: 'Ayam Dada Tanpa Kulit',
        portion: '80g',
        calories: 132,
        carbs: 0,
        protein: 24.8,
        fat: 2.9,
      },
      {
        patientId: patient1.id,
        intakeDate: new Date('2024-08-29'),
        mealType: 'LUNCH',
        foodName: 'Nasi Merah',
        portion: '150g',
        calories: 165,
        carbs: 37.5,
        protein: 3.8,
        fat: 1.5,
      },
    ],
  });

  // Insert Food Recalls
  await prisma.foodRecall.createMany({
    data: [
      {
        patientId: patient1.id,
        date: '2024-08-29',
        totalCalories: 661,
        totalCarbs: 66.1,
        totalProtein: 65.0,
        totalFat: 18.2,
        complianceScore: 75,
      },
      {
        patientId: patient2.id,
        date: '2024-08-29',
        totalCalories: 1580,
        totalCarbs: 198,
        totalProtein: 79,
        totalFat: 52,
        complianceScore: 85,
      },
    ],
  });

  // Insert Patient Complaints
  await prisma.patientComplaint.createMany({
    data: [
      {
        patientId: patient1.id,
        date: new Date('2024-08-20'),
        complaint: 'Mual setelah minum obat metformin',
        severity: 'SEDANG',
        status: 'BARU',
      },
      {
        patientId: patient2.id,
        date: new Date('2024-08-18'),
        complaint: 'Pusing saat berdiri',
        severity: 'RINGAN',
        status: 'SELESAI',
      },
      {
        patientId: patient3.id,
        date: new Date('2024-08-27'),
        complaint: 'Penglihatan Kabur',
        severity: 'BERAT',
        status: 'SELESAI',
      },
    ],
  });

  // Insert Lab Results
  await prisma.labResult.createMany({
    data: [
      {
        patientId: patient1.id,
        testType: 'HbA1c',
        value: '8.5%',
        normalRange: '<7%',
        testDate: new Date('2024-08-15'),
        status: 'HIGH',
      },
      {
        patientId: patient1.id,
        testType: 'Kreatinin',
        value: '1.2 mg/dL',
        normalRange: '0.6-1.3 mg/dL',
        testDate: new Date('2024-08-15'),
        status: 'NORMAL',
      },
      {
        patientId: patient3.id,
        testType: 'HbA1c',
        value: '9.2%',
        normalRange: '<7%',
        testDate: new Date('2024-08-20'),
        status: 'HIGH',
      },
    ],
  });

  // Insert Pharmacy Notes
  await prisma.pharmacyNote.createMany({
    data: [
      {
        patientId: patient1.id,
        date: new Date('2024-08-20'),
        note: 'Pasien mengalami mual setelah minum metformin. Disarankan minum setelah makan.',
        pharmacist: 'Apt. Sarah',
        category: 'MEDICATION',
      },
      {
        patientId: patient2.id,
        date: new Date('2024-08-18'),
        note: 'Edukasi tentang tanda-tanda hipoglikemia dan cara mengatasinya.',
        pharmacist: 'Apt. Ahmad',
        category: 'COUNSELING',
      },
    ],
  });

  // Insert Blood Sugar History
  await prisma.bloodSugarHistory.createMany({
    data: [
      {
        patientId: patient1.id,
        value: 180,
        date: new Date('2024-08-29'),
        time: '08:00',
        trend: 'INCREASING',
        notes: 'Setelah sarapan',
      },
      {
        patientId: patient1.id,
        value: 145,
        date: new Date('2024-08-28'),
        time: '07:30',
        trend: 'STABLE',
        notes: 'Puasa',
      },
      {
        patientId: patient2.id,
        value: 145,
        date: new Date('2024-08-29'),
        time: '08:15',
        trend: 'STABLE',
        notes: 'Setelah minum obat',
      },
      {
        patientId: patient3.id,
        value: 220,
        date: new Date('2024-08-29'),
        time: '09:00',
        trend: 'INCREASING',
        notes: 'Tidak minum obat',
      },
    ],
  });

  // Insert Patient Logs
  await prisma.patientLog.createMany({
    data: [
      {
        patientId: patient1.id,
        roomNumber: 'R201',
        bedNumber: 'B1',
        admissionDate: new Date('2024-08-25'),
        diagnosis: 'Diabetes Melitus Tipe 2 dengan Komplikasi',
        comorbidities: ['Hipertensi', 'Neuropati Diabetik'],
        allergies: ['Sulfa', 'Ruam kulit'],
        currentMedications: ['Metformin 500mg 2x/hari', 'Glimepiride 2mg 1x/hari', 'Amlodipine 5mg 1x/hari'],
      },
      {
        patientId: patient3.id,
        roomNumber: 'R203',
        bedNumber: 'B2',
        admissionDate: new Date('2024-08-28'),
        diagnosis: 'Diabetes Melitus Tipe 2 Dekompensasi',
        comorbidities: ['Hipertensi', 'Obesitas'],
        allergies: [],
        currentMedications: ['Metformin 850mg 2x/hari', 'Insulin Regular 10 unit 2x/hari'],
      },
    ],
  });

  // Insert Visitations
  await prisma.visitation.createMany({
    data: [
      {
        patientId: patient1.id,
        nurseId: nurse.id,
        date: new Date('2024-08-29'),
        shift: 'PAGI',
        complaints: 'Mual setelah makan',
        medications: 'Metformin 500mg, Glimepiride 2mg',
        labResults: 'HbA1c: 8.5%, Kreatinin: 1.2 mg/dL',
        actions: 'Berikan obat anti mual, pantau intake makanan',
        complications: 'Neuropati ringan',
        education: 'Edukasi diet diabetes dan olahraga',
        notes: 'Pasien kooperatif, perlu monitoring ketat',
        vitalSigns: {
          temperature: '36.8',
          bloodPressure: '140/90',
          heartRate: '85',
          respiratoryRate: '20',
          oxygenSaturation: '98',
          bloodSugar: '180',
          weight: '75',
          height: '168'
        },
      },
      {
        patientId: patient3.id,
        nurseId: nurse.id,
        date: new Date('2024-08-29'),
        shift: 'SORE',
        complaints: 'Penglihatan kabur, kaki kesemutan',
        medications: 'Metformin 850mg, Insulin Regular 10 unit',
        labResults: 'HbA1c: 9.2%',
        actions: 'Konsultasi ke dokter mata, fisioterapi',
        complications: 'Retinopati, neuropati',
        education: 'Pentingnya kontrol gula darah yang ketat',
        notes: 'Kondisi memburuk, perlu intensifikasi terapi',
        vitalSigns: {
          temperature: '36.7',
          bloodPressure: '150/95',
          heartRate: '88',
          respiratoryRate: '22',
          oxygenSaturation: '97',
          bloodSugar: '220',
          weight: '82',
          height: '172'
        },
      },
    ],
  });

  // Insert Appointments
  await prisma.appointment.createMany({
    data: [
      {
        patientId: patient1.id,
        doctorId: doctor.id,
        appointmentDate: new Date('2024-08-25'),
        appointmentTime: '10:00',
        type: 'Kontrol Rutin',
        status: 'SCHEDULED',
        notes: 'Kontrol gula darah rutin',
      },
      {
        patientId: patient4.id,
        doctorId: doctor.id,
        appointmentDate: new Date('2024-09-01'),
        appointmentTime: '14:00',
        type: 'Follow Up',
        status: 'SCHEDULED',
        notes: 'Evaluasi terapi insulin',
      },
      {
        patientId: patient3.id,
        doctorId: doctor.id,
        appointmentDate: new Date('2024-09-05'),
        appointmentTime: '09:00',
        type: 'Konsultasi Komplikasi',
        status: 'SCHEDULED',
        notes: 'Evaluasi retinopati dan neuropati',
      },
    ],
  });

  // await seedLoginLogs();

  console.log('✅ Seeding finished!');
  console.log(`Created users: Admin, Doctor, Nurse, Nutritionist, Pharmacist`);
  console.log(`Created patients: ${patient1.name}, ${patient2.name}, ${patient3.name}, ${patient4.name}`);
  console.log(`Created ${await prisma.alert.count()} alerts`);
  console.log(`Created ${await prisma.foodItem.count()} food items`);
  console.log(`Created ${await prisma.mealEntry.count()} meal entries`);
  console.log(`Created ${await prisma.nutritionPlan.count()} nutrition plans`);
  console.log(`Created ${await prisma.visitation.count()} visitations`);
}

main()
  .then(() => console.log('🎉 Database seeded successfully!'))
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());