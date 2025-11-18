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
    const allowedRoles = ['PERAWAT_POLI', 'DOKTER_SPESIALIS', 'SUPER_ADMIN', 'PERAWAT_RUANGAN', 'ADMINISTRASI', 'FARMASI', 'AHLI_GIZI', 'MANAJER', 'LABORATORIUM'];
    
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
    const allowedRoles = ['PERAWAT_POLI', 'DOKTER_SPESIALIS', 'SUPER_ADMIN', 'PERAWAT_RUANGAN', 'ADMINISTRASI', 'FARMASI', 'AHLI_GIZI', 'MANAJER', 'LABORATORIUM'];
    
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      birthDate,
      gender,
      idNumber,
      nationality,
      bloodType,
      language,
      motherName,
      phone,
      address,
      intendedDoctor,
      height,
      weight,
      bmi,
      diabetesType,
      insuranceType,
      insuranceNumber,
      smokingStatus,
      allergies,
      medicalHistory,
      status
    } = body;

    const updateData: any = {};

    if (userRole === 'ADMINISTRASI' || userRole === 'SUPER_ADMIN') {
      if (name !== undefined) updateData.name = name;
      if (birthDate !== undefined) updateData.birthDate = new Date(birthDate);
      if (gender !== undefined) updateData.gender = gender;
      if (idNumber !== undefined) updateData.idNumber = idNumber || null;
      if (nationality !== undefined) updateData.nationality = nationality;
      if (bloodType !== undefined) updateData.bloodType = bloodType || null;
      if (language !== undefined) updateData.language = language || null;
      if (motherName !== undefined) updateData.motherName = motherName || null;
      if (phone !== undefined) updateData.phone = phone || null;
      if (address !== undefined) updateData.address = address || null;
      if (intendedDoctor !== undefined) updateData.intendedDoctor = intendedDoctor || null;
      if (insuranceType !== undefined) updateData.insuranceType = insuranceType;
      if (insuranceNumber !== undefined) updateData.insuranceNumber = insuranceNumber || null;
      if (status !== undefined) updateData.status = status || 'AKTIF';
    }

    if (userRole === 'PERAWAT_POLI' || userRole === 'LABORATORIUM' || userRole === 'SUPER_ADMIN') {
      if (height !== undefined) updateData.height = height ? parseFloat(height) : null;
      if (weight !== undefined) updateData.weight = weight ? parseFloat(weight) : null;
      if (bmi !== undefined) updateData.bmi = bmi;
      if (smokingStatus !== undefined) updateData.smokingStatus = smokingStatus;
      if (diabetesType !== undefined) updateData.diabetesType = diabetesType || null;
      if (allergies !== undefined) updateData.allergies = allergies && Array.isArray(allergies) && allergies.length > 0 ? allergies : [];
      if (medicalHistory !== undefined) updateData.medicalHistory = medicalHistory || null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const patient = await prisma.patient.update({
      where: { id: params.id },
      data: updateData
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