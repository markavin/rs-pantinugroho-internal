// src/app/api/patients/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth, hasPermission, isAuthenticated } from '@/lib/auth';

const prisma = new PrismaClient();

// GET single patient
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(['PERAWAT_POLI', 'DOKTER_SPESIALIS', 'SUPER_ADMIN', 'PERAWAT_RUANGAN']);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session, 'patients')) {
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

// PUT update patient
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(['PERAWAT_POLI']);
    if (!session || !isAuthenticated(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session, 'patients')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
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
      }
    });

    return NextResponse.json(patient);
  } catch (error) {
    console.error('Error updating patient:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE patient
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(['PERAWAT_POLI', 'SUPER_ADMIN']);
    if (!session || !isAuthenticated(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session, 'patients')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
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