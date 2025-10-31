// app/api/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'patients':
        return await getPatients();
      
      case 'drugs':
        return await getDrugs();
      
      case 'patient-complaints':
        return await getPatientComplaints();
      
      case 'lab-results':
        return await getLabResults();
      
      case 'pharmacy-notes':
        return await getPharmacyNotes();
      
      case 'blood-sugar':
        return await getBloodSugarHistory();
      
      case 'nutrition-plans':
        return await getNutritionPlans();
      
      case 'food-intakes':
        return await getFoodIntakes();

      case 'meal-entries':
        return await getMealEntries();

      case 'food-items':
        return await getFoodItems();

      case 'food-recalls':
        return await getFoodRecalls();
      
      case 'patient-logs':
        return await getPatientLogs();
      
      case 'vital-signs':
        return await getVitalSigns();

      case 'visitations':
        return await getVisitations();
      
      case 'alerts':
        return await getAlerts();
      
      case 'dashboard-stats':
        return await getDashboardStats();

      case 'appointments':
        return await getAppointments();
      
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Patients - Updated with new fields
async function getPatients() {
  const patients = await prisma.patient.findMany({
    include: {
      medications: true,
      vitalSigns: {
        orderBy: { recordDate: 'desc' },
        take: 1
      },
      bloodSugars: {
        orderBy: { date: 'desc' },
        take: 1
      },
      nutritionPlans: true,
      appointments: {
        where: {
          appointmentDate: {
            gte: new Date()
          }
        },
        orderBy: {
          appointmentDate: 'asc'
        },
        take: 1
      }
    }
  });

  const transformedPatients = patients.map(patient => {
    const latestVitals = patient.vitalSigns[0];
    const latestBloodSugar = patient.bloodSugars[0];
    const nextAppointment = patient.appointments[0];
    
    return {
      id: patient.id,
      mrNumber: patient.mrNumber,
      name: patient.name,
      age: patient.birthDate ? 
        Math.floor((Date.now() - patient.birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0,
      gender: patient.gender === 'MALE' ? 'L' : 'P',
      diabetesType: patient.diabetesType || 'Tipe 2',
      lastVisit: patient.lastVisit?.toISOString().split('T')[0] || 
                 latestVitals?.recordDate?.toISOString().split('T')[0] || '',
      bloodSugar: {
        value: latestBloodSugar?.value || latestVitals?.bloodGlucose || 0,
        date: latestBloodSugar?.date?.toLocaleDateString('id-ID') || '',
        trend: latestBloodSugar?.trend?.toLowerCase() || 'stable'
      },
      riskLevel: patient.riskLevel || calculateRiskLevel(latestBloodSugar?.value || latestVitals?.bloodGlucose || 0),
      vitalSigns: {
        bloodPressure: latestVitals ? `${latestVitals.systolicBP}/${latestVitals.diastolicBP}` : '120/80',
        heartRate: latestVitals?.heartRate || 70,
        temperature: latestVitals?.temperature || 36.5,
        weight: patient.weight || 65
      },
      insuranceType: patient.insuranceType,
      status: mapPatientStatus(patient.status),
      nextAppointment: nextAppointment?.appointmentDate.toISOString().split('T')[0],
      complications: patient.comorbidities,
      medications: patient.medications.map(med => ({
        id: med.id,
        name: med.medicationName,
        dosage: med.dosage,
        frequency: med.frequency,
        startDate: med.startDate.toLocaleDateString('id-ID'),
        interactions: med.interactions
      })),
      dietCompliance: patient.dietCompliance || patient.nutritionPlans[0]?.compliance || 0,
      allergies: patient.allergies,
      bmi: patient.bmi,
      weight: patient.weight,
      height: patient.height,
      calorieNeeds: patient.calorieNeeds || patient.nutritionPlans[0]?.targetCalories,
      calorieRequirement: patient.calorieRequirement || patient.nutritionPlans[0]?.targetCalories,
      dietPlan: patient.dietPlan
    };
  });

  return NextResponse.json(transformedPatients);
}

// Drug Data untuk Pharmacy Dashboard
async function getDrugs() {
  const drugs = await prisma.drugData.findMany();
  
  const transformedDrugs = drugs.map(drug => ({
    id: drug.id,
    name: drug.name,
    category: drug.category,
    dosageForm: drug.dosageForm,
    strength: drug.strength,
    manufacturer: drug.manufacturer,
    stock: drug.stock,
    expiryDate: drug.expiryDate.toISOString().split('T')[0],
    interactions: drug.interactions,
    contraindications: drug.contraindications,
    sideEffects: drug.sideEffects,
    indications: drug.indications
  }));

  return NextResponse.json(transformedDrugs);
}

// Patient Complaints
async function getPatientComplaints() {
  const complaints = await prisma.patientComplaint.findMany({
    include: {
      patient: {
        select: {
          name: true,
          mrNumber: true
        }
      }
    }
  });

  const transformedComplaints = complaints.map(complaint => ({
    id: complaint.id,
    patientId: complaint.patientId,
    date: complaint.date.toISOString().split('T')[0],
    complaint: complaint.complaint,
    severity: complaint.severity,
    status: complaint.status
  }));

  return NextResponse.json(transformedComplaints);
}

// Lab Results
async function getLabResults() {
  const labResults = await prisma.labResult.findMany({
    include: {
      patient: {
        select: {
          name: true,
          mrNumber: true
        }
      }
    }
  });

  const transformedResults = labResults.map(result => ({
    id: result.id,
    patientId: result.patientId,
    testType: result.testType,
    value: result.value,
    normalRange: result.normalRange,
    date: result.testDate.toISOString().split('T')[0],
    status: result.status
  }));

  return NextResponse.json(transformedResults);
}

// Pharmacy Notes
async function getPharmacyNotes() {
  const notes = await prisma.pharmacyNote.findMany({
    include: {
      patient: {
        select: {
          name: true,
          mrNumber: true
        }
      }
    }
  });

  const transformedNotes = notes.map(note => ({
    id: note.id,
    patientId: note.patientId,
    date: note.date.toISOString().split('T')[0],
    note: note.note,
    pharmacist: note.pharmacist,
    category: note.category
  }));

  return NextResponse.json(transformedNotes);
}

// Blood Sugar History
async function getBloodSugarHistory() {
  const bloodSugars = await prisma.bloodSugarHistory.findMany({
    include: {
      patient: {
        select: {
          name: true,
          mrNumber: true
        }
      }
    },
    orderBy: {
      date: 'desc'
    }
  });

  const transformedBloodSugars = bloodSugars.map(bs => ({
    id: bs.id,
    patientId: bs.patientId,
    value: bs.value,
    date: bs.date.toISOString().split('T')[0],
    time: bs.time,
    notes: bs.notes || ''
  }));

  return NextResponse.json(transformedBloodSugars);
}

// Nutrition Plans
async function getNutritionPlans() {
  const nutritionPlans = await prisma.nutritionPlan.findMany({
    include: {
      patient: {
        select: {
          name: true,
          mrNumber: true
        }
      },
      nutritionist: {
        select: {
          name: true
        }
      }
    }
  });

  const transformedPlans = nutritionPlans.map(plan => ({
    id: plan.id,
    patientId: plan.patientId,
    targetCalories: plan.targetCalories,
    carbLimit: plan.carbLimit,
    proteinGoal: plan.proteinGoal,
    fatLimit: plan.fatLimit,
    mealDistribution: plan.mealDistribution,
    restrictions: plan.restrictions,
    goals: plan.goals,
    createdDate: plan.createdAt.toISOString().split('T')[0],
    lastUpdated: plan.updatedAt.toISOString().split('T')[0],
    compliance: plan.compliance
  }));

  return NextResponse.json(transformedPlans);
}

// Food Intakes
async function getFoodIntakes() {
  const foodIntakes = await prisma.foodIntake.findMany({
    include: {
      patient: {
        select: {
          name: true,
          mrNumber: true
        }
      }
    },
    orderBy: {
      intakeDate: 'desc'
    }
  });

  const transformedIntakes = foodIntakes.map(intake => ({
    id: intake.id,
    patientId: intake.patientId,
    date: intake.intakeDate.toISOString().split('T')[0],
    mealType: intake.mealType.toLowerCase(),
    foodName: intake.foodName,
    portion: intake.portion,
    calories: intake.calories,
    carbs: intake.carbs,
    protein: intake.protein,
    fat: intake.fat
  }));

  return NextResponse.json(transformedIntakes);
}

// NEW: Meal Entries
async function getMealEntries() {
  const mealEntries = await prisma.mealEntry.findMany({
    include: {
      patient: {
        select: {
          name: true,
          mrNumber: true
        }
      },
      foods: {
        include: {
          foodItem: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const transformedEntries = mealEntries.map(entry => ({
    id: entry.id,
    patientId: entry.patientId,
    date: entry.date,
    mealType: entry.mealType.toLowerCase(),
    foods: entry.foods.map(food => ({
      foodId: food.foodId,
      foodName: food.foodName,
      portion: food.portion,
      calories: food.calories,
      carbs: food.carbs,
      protein: food.protein,
      fat: food.fat
    })),
    totalCalories: entry.totalCalories,
    totalCarbs: entry.totalCarbs,
    totalProtein: entry.totalProtein,
    totalFat: entry.totalFat,
    bloodSugarBefore: entry.bloodSugarBefore,
    bloodSugarAfter: entry.bloodSugarAfter,
    notes: entry.notes
  }));

  return NextResponse.json(transformedEntries);
}

// NEW: Food Items
async function getFoodItems() {
  const foodItems = await prisma.foodItem.findMany();
  
  const transformedItems = foodItems.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    calories: item.calories,
    carbs: item.carbs,
    protein: item.protein,
    fat: item.fat,
    fiber: item.fiber,
    glycemicIndex: item.glycemicIndex,
    diabeticFriendly: item.diabeticFriendly,
    sodium: item.sodium,
    sugar: item.sugar,
    portion: item.portion
  }));

  return NextResponse.json(transformedItems);
}

// NEW: Food Recalls
async function getFoodRecalls() {
  const foodRecalls = await prisma.foodRecall.findMany({
    include: {
      patient: {
        select: {
          name: true,
          mrNumber: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const transformedRecalls = foodRecalls.map(recall => ({
    id: recall.id,
    patientId: recall.patientId,
    date: recall.date,
    meals: [], // Could be populated with actual meal entries
    totalCalories: recall.totalCalories,
    totalCarbs: recall.totalCarbs,
    totalProtein: recall.totalProtein,
    totalFat: recall.totalFat,
    complianceScore: recall.complianceScore
  }));

  return NextResponse.json(transformedRecalls);
}

// Patient Logs untuk Nursing
async function getPatientLogs() {
  const patientLogs = await prisma.patientLog.findMany({
    include: {
      patient: {
        select: {
          name: true,
          mrNumber: true
        }
      }
    }
  });

  const transformedLogs = patientLogs.map(log => ({
    id: log.id,
    patientId: log.patientId,
    roomNumber: log.roomNumber,
    bedNumber: log.bedNumber,
    admissionDate: log.admissionDate.toISOString().split('T')[0],
    diagnosis: log.diagnosis,
    comorbidities: log.comorbidities,
    allergies: log.allergies,
    currentMedications: log.currentMedications,
    visitationHistory: [] // Akan diisi dari endpoint visitations
  }));

  return NextResponse.json(transformedLogs);
}

// Vital Signs
async function getVitalSigns() {
  const vitalSigns = await prisma.vitalSign.findMany({
    include: {
      patient: {
        select: {
          name: true,
          mrNumber: true
        }
      }
    },
    orderBy: {
      recordDate: 'desc'
    }
  });

  return NextResponse.json(vitalSigns);
}

// NEW: Visitations
async function getVisitations() {
  const visitations = await prisma.visitation.findMany({
    include: {
      patient: {
        select: {
          name: true,
          mrNumber: true
        }
      },
      nurse: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      date: 'desc'
    }
  });

  const transformedVisitations = visitations.map(visit => ({
    id: visit.id,
    patientId: visit.patientId,
    date: visit.date.toISOString().split('T')[0],
    shift: visit.shift.toLowerCase(),
    complaints: visit.complaints,
    medications: visit.medications,
    labResults: visit.labResults,
    actions: visit.actions,
    vitalSigns: visit.vitalSigns,
    complications: visit.complications,
    education: visit.education,
    notes: visit.notes
  }));

  return NextResponse.json(transformedVisitations);
}

// Alerts - Updated to use actual Alert model
async function getAlerts() {
  const dbAlerts = await prisma.alert.findMany({
    include: {
      patient: {
        select: {
          name: true,
          mrNumber: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const transformedAlerts = dbAlerts.map(alert => ({
    id: alert.id,
    type: alert.type,
    message: alert.message,
    patientName: alert.patient.name,
    patientMR: alert.patient.mrNumber,
    timestamp: alert.timestamp,
    category: alert.category
  }));

  return NextResponse.json(transformedAlerts);
}

// NEW: Appointments
async function getAppointments() {
  const appointments = await prisma.appointment.findMany({
    include: {
      patient: {
        select: {
          name: true,
          mrNumber: true
        }
      },
      doctor: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      appointmentDate: 'asc'
    }
  });

  const transformedAppointments = appointments.map(apt => ({
    id: apt.id,
    patientId: apt.patientId,
    patientName: apt.patient.name,
    patientMR: apt.patient.mrNumber,
    doctorName: apt.doctor?.name || 'Tidak ditentukan',
    appointmentDate: apt.appointmentDate.toISOString().split('T')[0],
    appointmentTime: apt.appointmentTime,
    type: apt.type,
    status: apt.status,
    notes: apt.notes
  }));

  return NextResponse.json(transformedAppointments);
}

// Dashboard Statistics - Updated
async function getDashboardStats() {
  const totalPatients = await prisma.patient.count();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayVisits = await prisma.vitalSign.count({
    where: {
      recordDate: {
        gte: today,
        lt: tomorrow
      }
    }
  });

  const patients = await prisma.patient.findMany({
    select: {
      allergies: true
    }
  });
  
  const totalAllergies = patients.reduce((acc, p) => acc + p.allergies.length, 0);

  // Additional stats
  const activePatients = await prisma.patient.count({
    where: {
      OR: [
        { status: 'ACTIVE' },
        { status: null }
      ]
    }
  });

  const highRiskPatients = await prisma.patient.count({
    where: {
      riskLevel: 'HIGH'
    }
  });

  const criticalAlerts = await prisma.alert.count({
    where: {
      type: 'CRITICAL'
    }
  });

  return NextResponse.json({
    activePatients: activePatients,
    todayVisits,
    totalAllergies,
    totalPatients,
    highRiskPatients,
    criticalAlerts
  });
}

// Helper functions
function calculateRiskLevel(bloodSugar: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (bloodSugar > 200) return 'HIGH';
  if (bloodSugar > 140) return 'MEDIUM';
  return 'LOW';
}

function mapPatientStatus(status: string | null): string {
  switch (status) {
    case 'ACTIVE': return 'Aktif';
    case 'RUJUK_BALIK': return 'Rujuk Balik';
    case 'MONITORING': return 'monitoring';
    case 'FOLLOW_UP': return 'follow_up';
    default: return 'Aktif';
  }
}