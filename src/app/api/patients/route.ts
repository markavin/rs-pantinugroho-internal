// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { getSession, requireAuth } from '@/lib/auth';

// // GET - List all patients (untuk doctor, nurse, admin)
// export async function GET(req: NextRequest) {
//   try {
//     const session = await getSession();
    
//     if (!session?.user) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     // Only allow medical staff to view all patients
//     const allowedRoles = ['DOCTOR', 'NURSE', 'ADMIN'];
//     if (!allowedRoles.includes(session.user.role)) {
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//     }

//     const { searchParams } = new URL(req.url);
//     const search = searchParams.get('search') || '';
//     const page = parseInt(searchParams.get('page') || '1');
//     const limit = parseInt(searchParams.get('limit') || '10');
//     const skip = (page - 1) * limit;

//     const where = search ? {
//       OR: [
//         { name: { contains: search, mode: 'insensitive' as const } },
//         { mrNumber: { contains: search, mode: 'insensitive' as const } },
//         { user: { email: { contains: search, mode: 'insensitive' as const } } }
//       ]
//     } : {};

//     const [patients, total] = await Promise.all([
//       prisma.patient.findMany({
//         where,
//         include: {
//           user: {
//             select: { email: true, name: true }
//           },
//           medicalRecords: {
//             orderBy: { createdAt: 'desc' },
//             take: 1,
//             include: {
//               vitalSigns: {
//                 orderBy: { recordDate: 'desc' },
//                 take: 1
//               }
//             }
//           }
//         },
//         skip,
//         take: limit,
//         orderBy: { createdAt: 'desc' }
//       }),
//       prisma.patient.count({ where })
//     ]);

//     // Transform data untuk frontend
//     const transformedPatients = patients.map(patient => ({
//       id: patient.id,
//       mrNumber: patient.mrNumber,
//       name: patient.name,
//       birthDate: patient.birthDate,
//       gender: patient.gender,
//       phone: patient.phone,
//       address: patient.address,
//       diabetesType: patient.diabetesType,
//       diagnosisDate: patient.diagnosisDate,
//       comorbidities: patient.comorbidities,
//       lastVisit: patient.medicalRecords[0]?.visitDate || null,
//       lastBloodSugar: patient.medicalRecords[0]?.vitalSigns[0]?.bloodGlucose || null,
//       riskLevel: calculateRiskLevel(patient, patient.medicalRecords[0]),
//       user: patient.user
//     }));

//     return NextResponse.json({
//       patients: transformedPatients,
//       pagination: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit)
//       }
//     });

//   } catch (error) {
//     console.error('Error fetching patients:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// // POST - Create new patient (admin only)
// export async function POST(req: NextRequest) {
//   try {
//     const session = await getSession();
    
//     if (!session?.user || !['ADMIN', 'DOCTOR'].includes(session.user.role)) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const body = await req.json();
//     const {
//       name,
//       email,
//       birthDate,
//       gender,
//       phone,
//       address,
//       diabetesType,
//       diagnosisDate,
//       comorbidities = []
//     } = body;

//     // Validate required fields
//     if (!name || !email || !birthDate || !gender) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     // Generate MR Number
//     const lastPatient = await prisma.patient.findFirst({
//       orderBy: { mrNumber: 'desc' }
//     });
    
//     const nextNumber = lastPatient 
//       ? parseInt(lastPatient.mrNumber.split('-')[1]) + 1
//       : 1;
//     const mrNumber = `MR-${nextNumber.toString().padStart(4, '0')}`;

//     // Create user account for patient
//     const user = await prisma.user.create({
//       data: {
//         email,
//         username: email.split('@')[0],
//         name,
//         role: 'PATIENT',
//         password: 'defaultPassword123' // Should be hashed in production
//       }
//     });

//     // Create patient record
//     const patient = await prisma.patient.create({
//       data: {
//         mrNumber,
//         name,
//         birthDate: new Date(birthDate),
//         gender,
//         phone,
//         address,
//         diabetesType,
//         diagnosisDate: diagnosisDate ? new Date(diagnosisDate) : null,
//         comorbidities,
//         createdBy: user.id, // Fix: use createdBy instead of userId
//         insuranceType: 'BPJS' // Default insurance type
//       },
//       include: {
//         user: {
//           select: { email: true, name: true }
//         }
//       }
//     });

//     return NextResponse.json(patient, { status: 201 });

//   } catch (error) {
//     console.error('Error creating patient:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// // Helper function untuk calculate risk level
// function calculateRiskLevel(patient: any, lastRecord: any) {
//   let riskScore = 0;

//   // Age factor
//   const age = new Date().getFullYear() - new Date(patient.birthDate).getFullYear();
//   if (age > 65) riskScore += 2;
//   else if (age > 50) riskScore += 1;

//   // Diabetes type
//   if (patient.diabetesType === 'Tipe 1') riskScore += 2;

//   // Last blood sugar - fixed field name
//   if (lastRecord?.vitalSigns?.[0]?.bloodGlucose) {
//     const bloodSugar = lastRecord.vitalSigns[0].bloodGlucose;
//     if (bloodSugar > 200) riskScore += 3;
//     else if (bloodSugar > 140) riskScore += 1;
//   }

//   // Comorbidities
//   riskScore += (patient.comorbidities?.length || 0);

//   // Determine risk level
//   if (riskScore >= 5) return 'HIGH';
//   if (riskScore >= 3) return 'MEDIUM';
//   return 'LOW';
// }