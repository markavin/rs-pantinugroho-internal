
// src/app/api/patients/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET single patient - PERAWAT_POLI can view for lab purposes
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

// PUT update patient - ONLY ADMINISTRASI
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMINISTRASI can update patients
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
      medicalHistory
    } = body;

    // Validate required fields
    if (!name || !birthDate || !gender || !insuranceType) {
      return NextResponse.json(
        { error: 'Missing required fields: name, birthDate, gender, insuranceType' },
        { status: 400 }
      );
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
        diabetesType: diabetesType || null,
        insuranceType,
        allergies: allergies && allergies.length > 0 ? allergies : null,
        medicalHistory: medicalHistory || null,
      }
    });

    return NextResponse.json(patient);
  } catch (error) {
    console.error('Error updating patient:', error);
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE patient - ONLY ADMINISTRASI
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMINISTRASI and SUPER_ADMIN can delete patients
    const userRole = (session.user as any).role;
    if (userRole !== 'ADMINISTRASI' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions. Only Administration can delete patients.' }, { status: 403 });
    }

    // Check if patient exists
    const existingPatient = await prisma.patient.findUnique({
      where: { id: params.id }
    });

    if (!existingPatient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Delete patient (this will cascade delete related records due to foreign key constraints)
    await prisma.patient.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
