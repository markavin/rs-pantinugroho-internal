
// src/app/api/patient-complaints/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET patient complaints - All roles can view
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to access complaints
    const userRole = (session.user as any).role;
    const allowedRoles = ['PERAWAT_POLI', 'DOKTER_SPESIALIS', 'SUPER_ADMIN', 'PERAWAT_RUANGAN', 'ADMINISTRASI', 'MANAJER'];
    
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    let whereClause = {};
    if (patientId) {
      whereClause = { patientId };
    }

    const complaints = await prisma.patientComplaint.findMany({
      where: whereClause,
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

    return NextResponse.json(complaints);
  } catch (error) {
    console.error('Error fetching patient complaints:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST new patient complaint - ONLY ADMINISTRASI can add complaints
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMINISTRASI can create complaints (during registration or later)
    const userRole = (session.user as any).role;
    if (userRole !== 'ADMINISTRASI' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions. Only Administration can add patient complaints.' }, { status: 403 });
    }

    const body = await request.json();
    const { patientId, complaint, severity, notes } = body;

    // Validate required fields
    if (!patientId || !complaint || !severity) {
      return NextResponse.json(
        { error: 'Missing required fields: patientId, complaint, severity' },
        { status: 400 }
      );
    }

    // Validate severity values
    if (!['RINGAN', 'SEDANG', 'BERAT'].includes(severity)) {
      return NextResponse.json(
        { error: 'Invalid severity value. Must be RINGAN, SEDANG, or BERAT' },
        { status: 400 }
      );
    }

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const patientComplaint = await prisma.patientComplaint.create({
      data: {
        patientId,
        complaint: complaint.trim(),
        severity,
        status: 'BARU',
        notes: notes?.trim() || null,
        date: new Date()
      },
      include: {
        patient: {
          select: {
            name: true,
            mrNumber: true
          }
        }
      }
    });

    return NextResponse.json(patientComplaint, { status: 201 });
  } catch (error) {
    console.error('Error creating patient complaint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}