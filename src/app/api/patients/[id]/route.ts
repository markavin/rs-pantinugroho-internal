// src/app/api/patients/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const allowedRoles = ['PERAWAT_POLI', 'DOKTER_SPESIALIS', 'SUPER_ADMIN', 'PERAWAT_RUANGAN', 'ADMINISTRASI', 'FARMASI', 'AHLI_GIZI', 'MANAJER', 'AHLI_GIZI'];
    
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        handledBy: {
          include: {
            handler: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          },
          orderBy: {
            handledDate: 'desc'
          }
        },
        drugTransactions: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        appointments: {
          orderBy: {
            appointmentDate: 'desc'
          },
          take: 10
        },
        alerts: {
          where: {
            isRead: false
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'ADMINISTRASI' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions. Only Administration can update patients.' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      birthDate,
      gender,
      phone,
      address,
      height,
      weight,
      bloodType,
      diabetesType,
      diagnosisDate,
      insuranceType,
      insuranceNumber,
      smokingStatus, // ← TAMBAHKAN INI
      allergies,
      medicalHistory,
      comorbidities,
      status,
      riskLevel,
      calorieNeeds,
      calorieRequirement,
      dietPlan,
      dietCompliance,
      complaints // untuk update keluhan jika ada
    } = body;

    // Validate required fields
    if (!name || !birthDate || !gender || !insuranceType) {
      return NextResponse.json(
        { error: 'Missing required fields: name, birthDate, gender, insuranceType' },
        { status: 400 }
      );
    }

    // Calculate BMI if height and weight are provided
    let bmi = null;
    if (height && weight) {
      const heightInMeters = parseFloat(height) / 100;
      bmi = parseFloat(weight) / (heightInMeters * heightInMeters);
      bmi = Math.round(bmi * 100) / 100;
    }

    // Update patient data
    const patient = await prisma.patient.update({
      where: { id: params.id },
      data: {
        name,
        birthDate: new Date(birthDate),
        gender,
        phone: phone || null,
        address: address || null,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        bmi: bmi,
        bloodType: bloodType || null,
        diabetesType: diabetesType || null,
        diagnosisDate: diagnosisDate ? new Date(diagnosisDate) : null,
        insuranceType,
        insuranceNumber: insuranceNumber || null,
        smokingStatus: smokingStatus || 'TIDAK_MEROKOK', // ← TAMBAHKAN INI
        allergies: allergies && Array.isArray(allergies) && allergies.length > 0 ? allergies : [],
        medicalHistory: medicalHistory || null,
        comorbidities: comorbidities && Array.isArray(comorbidities) && comorbidities.length > 0 ? comorbidities : [],
        status: status || 'AKTIF',
        riskLevel: riskLevel || null,
        calorieNeeds: calorieNeeds ? parseInt(calorieNeeds) : null,
        calorieRequirement: calorieRequirement ? parseInt(calorieRequirement) : null,
        dietPlan: dietPlan || null,
        dietCompliance: dietCompliance ? parseInt(dietCompliance) : null,
      }
    });

    // Handle complaints update if provided (untuk edit mode)
    if (complaints && Array.isArray(complaints)) {
      // Get existing complaints from DB
      const existingComplaints = await prisma.patientRecord.findMany({
        where: {
          patientId: params.id,
          recordType: 'COMPLAINTS'
        }
      });

      // Delete complaints that are not in the update list
      const updatedIds = complaints
        .filter((c: any) => c.id && !c.id.startsWith('temp_'))
        .map((c: any) => c.id);
      
      const toDelete = existingComplaints
        .filter(ec => !updatedIds.includes(ec.id))
        .map(ec => ec.id);

      if (toDelete.length > 0) {
        await prisma.patientRecord.deleteMany({
          where: {
            id: { in: toDelete }
          }
        });
      }

      // Update or create complaints
      for (const complaint of complaints) {
        const complaintData = {
          patientId: params.id,
          recordType: 'COMPLAINTS' as const,
          title: 'Keluhan Pasien',
          content: complaint.complaint,
          metadata: {
            severity: complaint.severity,
            status: complaint.status || 'BARU',
            notes: complaint.notes || ''
          }
        };

        if (complaint.id && !complaint.id.startsWith('temp_')) {
          // Update existing complaint
          await prisma.patientRecord.update({
            where: { id: complaint.id },
            data: complaintData
          });
        } else {
          // Create new complaint
          await prisma.patientRecord.create({
            data: complaintData
          });
        }
      }
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error('Error updating patient:', error);
    
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }
    
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ error: 'Duplicate data constraint violation' }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'ADMINISTRASI' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions. Only Administration can delete patients.' }, { status: 403 });
    }

    // Check if patient exists and has related data
    const existingPatient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: {
        handledBy: true,
        drugTransactions: true,
        patientRecords: true,
        labResults: true,
        visitationLogs: true,
        nutritionRecords: true,
        pharmacyRecords: true,
        medicalReports: true,
        alerts: true,
        appointments: true
      }
    });

    if (!existingPatient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Check if patient has any related medical data
    const hasRelatedData = 
      existingPatient.handledBy.length > 0 ||
      existingPatient.drugTransactions.length > 0 ||
      existingPatient.patientRecords.length > 0 ||
      existingPatient.labResults.length > 0 ||
      existingPatient.visitationLogs.length > 0 ||
      existingPatient.nutritionRecords.length > 0 ||
      existingPatient.pharmacyRecords.length > 0 ||
      existingPatient.medicalReports.length > 0 ||
      existingPatient.appointments.length > 0;

    if (hasRelatedData) {
      return NextResponse.json({ 
        error: 'Cannot delete patient with existing medical data. Please archive the patient by setting status to inactive instead.' 
      }, { status: 400 });
    }

    // Delete patient and cascade delete alerts (if any)
    await prisma.$transaction(async (tx) => {
      // Delete alerts first
      if (existingPatient.alerts.length > 0) {
        await tx.alert.deleteMany({
          where: { patientId: params.id }
        });
      }

      // Delete patient
      await tx.patient.delete({
        where: { id: params.id }
      });
    });

    return NextResponse.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }
    
    if ((error as any).code === 'P2003') {
      return NextResponse.json({ 
        error: 'Cannot delete patient due to existing related data. Please remove or archive related records first.' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}