// src/app/api/patients/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

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
      smokingStatus,
      allergies,
      medicalHistory,
      comorbidities,
      status,
      riskLevel,
      calorieNeeds,
      calorieRequirement,
      dietPlan,
      dietCompliance,
      complaints
    } = body;

    if (!name || !birthDate || !gender || !insuranceType) {
      return NextResponse.json(
        { error: 'Missing required fields: name, birthDate, gender, insuranceType' },
        { status: 400 }
      );
    }

    let bmi = null;
    if (height && weight) {
      const heightInMeters = parseFloat(height) / 100;
      bmi = parseFloat(weight) / (heightInMeters * heightInMeters);
      bmi = Math.round(bmi * 100) / 100;
    }

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
        smokingStatus: smokingStatus || 'TIDAK_MEROKOK',
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

    if (complaints && Array.isArray(complaints)) {
      for (const complaint of complaints) {
        if (!complaint.content || !complaint.content.trim()) {
          continue;
        }

        const complaintData = {
          patientId: params.id,
          recordType: 'COMPLAINTS' as const,
          title: 'Keluhan Pasien',
          content: complaint.content.trim(),
          metadata: {
            severity: complaint.metadata?.severity || 'RINGAN',
            status: complaint.metadata?.status || 'BARU',
            notes: complaint.metadata?.notes || ''
          }
        };

        if (complaint.id && !complaint.id.startsWith('temp_')) {
          await prisma.patientRecord.update({
            where: { id: complaint.id },
            data: complaintData
          });
        } else {
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

    // Query dengan include yang sesuai dengan schema (REMOVED: appointments)
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
        alerts: true
      }
    });

    if (!existingPatient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Check for related data (REMOVED: appointments check)
    const hasRelatedData = 
      existingPatient.handledBy.length > 0 ||
      existingPatient.drugTransactions.length > 0 ||
      existingPatient.patientRecords.length > 0 ||
      existingPatient.labResults.length > 0 ||
      existingPatient.visitationLogs.length > 0 ||
      existingPatient.nutritionRecords.length > 0 ||
      existingPatient.pharmacyRecords.length > 0 ||
      existingPatient.medicalReports.length > 0;

    if (hasRelatedData) {
      return NextResponse.json({ 
        error: 'Cannot delete patient with existing medical data. Please archive the patient by setting status to inactive instead.' 
      }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      if (existingPatient.alerts.length > 0) {
        await tx.alert.deleteMany({
          where: { patientId: params.id }
        });
      }

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