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
    const allowedRoles = ['PERAWAT_POLI', 'DOKTER_SPESIALIS', 'SUPER_ADMIN', 'PERAWAT_RUANGAN', 'ADMINISTRASI'];
    
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            name: true
          }
        },
        complaints: {
          orderBy: {
            date: 'desc'
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
      diabetesType,
      insuranceType,
      allergies,
      medicalHistory,
      status
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
        diabetesType: diabetesType || null,
        insuranceType,
        allergies: allergies && Array.isArray(allergies) && allergies.length > 0 ? allergies : [],
        medicalHistory: medicalHistory || null,
        status: status || 'ACTIVE',
      }
    });

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

    const existingPatient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: {
        medicalRecords: true,
        appointments: true,
        vitalSigns: true,
        labResults: true,
        medications: true,
        nutritionPlans: true,
        educationNotes: true,
        foodIntakes: true,
        medicationLogs: true,
        complaints: true,
        bloodSugars: true,
        patientLogs: true,
        pharmacyNotes: true,
        alerts: true,
        mealEntries: true,
        foodRecalls: true,
        visitations: true
      }
    });

    if (!existingPatient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const hasRelatedData = 
      existingPatient.medicalRecords.length > 0 ||
      existingPatient.appointments.length > 0 ||
      existingPatient.vitalSigns.length > 0 ||
      existingPatient.labResults.length > 0 ||
      existingPatient.medications.length > 0 ||
      existingPatient.nutritionPlans.length > 0 ||
      existingPatient.educationNotes.length > 0 ||
      existingPatient.foodIntakes.length > 0 ||
      existingPatient.medicationLogs.length > 0 ||
      existingPatient.bloodSugars.length > 0 ||
      existingPatient.patientLogs.length > 0 ||
      existingPatient.pharmacyNotes.length > 0 ||
      existingPatient.alerts.length > 0 ||
      existingPatient.mealEntries.length > 0 ||
      existingPatient.foodRecalls.length > 0 ||
      existingPatient.visitations.length > 0;

    if (hasRelatedData) {
      return NextResponse.json({ 
        error: 'Cannot delete patient with existing medical data. Please archive the patient instead.' 
      }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      if (existingPatient.complaints.length > 0) {
        await tx.patientComplaint.deleteMany({
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