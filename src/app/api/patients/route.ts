
// src/app/api/patients/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET all patients
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to access patients
    const userRole = (session.user as any).role;
    // PERAWAT_POLI can view patients for lab purposes, ADMINISTRASI can manage patients
    const allowedRoles = ['PERAWAT_POLI', 'DOKTER_SPESIALIS', 'SUPER_ADMIN', 'PERAWAT_RUANGAN', 'ADMINISTRASI'];
    
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const patients = await prisma.patient.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST new patient - ONLY ADMINISTRASI
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMINISTRASI can create patients
    const userRole = (session.user as any).role;
    if (userRole !== 'ADMINISTRASI' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions. Only Administration can register patients.' }, { status: 403 });
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
      complaint,
      complaintSeverity
    } = body;

    // Validate required fields
    if (!name || !birthDate || !gender || !insuranceType) {
      return NextResponse.json(
        { error: 'Missing required fields: name, birthDate, gender, insuranceType' },
        { status: 400 }
      );
    }

    // Generate MR Number
    const lastPatient = await prisma.patient.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { mrNumber: true }
    });

    let nextNumber = 1001;
    if (lastPatient?.mrNumber) {
      const lastNumber = parseInt(lastPatient.mrNumber.replace('RM', ''));
      nextNumber = lastNumber + 1;
    }
    const mrNumber = `RM${nextNumber.toString().padStart(4, '0')}`;

    // Create patient
    const patient = await prisma.patient.create({
      data: {
        mrNumber,
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
        status: 'ACTIVE',
        createdBy: (session.user as any).id,
      }
    });

    // Add complaint if provided (ADMINISTRASI can add initial complaint)
    if (complaint && complaint.trim()) {
      await prisma.patientComplaint.create({
        data: {
          patientId: patient.id,
          complaint: complaint.trim(),
          severity: complaintSeverity || 'RINGAN',
          status: 'BARU',
          date: new Date()
        }
      });
    }

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}