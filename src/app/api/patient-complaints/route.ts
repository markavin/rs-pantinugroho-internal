// src/app/api/patient-complaints/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const allowedRoles = ['PERAWAT_POLI', 'DOKTER_SPESIALIS', 'SUPER_ADMIN', 'PERAWAT_RUANGAN', 'ADMINISTRASI', 'FARMASI', 'MANAJER', 'AHLI_GIZI', 'LABORATORIUM'];

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');

    let whereClause: any = {};
    
    if (patientId) {
      whereClause.patientId = patientId;
    }
    
    if (status) {
      whereClause.status = status;
    }

    const complaints = await prisma.patientRecord.findMany({
      where: {
        ...whereClause,
        recordType: 'COMPLAINTS'
      },
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

    // Transform PatientRecord to match PatientComplaint interface
    const transformedComplaints = complaints.map(record => ({
      id: record.id,
      patientId: record.patientId,
      complaint: record.content,
      severity: (record.metadata as any)?.severity || 'RINGAN',
      status: (record.metadata as any)?.status || 'BARU',
      date: record.createdAt,
      notes: (record.metadata as any)?.notes,
      patient: record.patient
    }));

    return NextResponse.json(transformedComplaints);
  } catch (error) {
    console.error('Error fetching patient complaints:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const allowedRoles = ['PERAWAT_POLI', 'DOKTER_SPESIALIS', 'SUPER_ADMIN', 'PERAWAT_RUANGAN', 'ADMINISTRASI', 'FARMASI', 'MANAJER', 'AHLI_GIZI', 'LABORATORIUM'];

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { patientId, complaint, severity = 'RINGAN', notes } = body;

    if (!patientId || !complaint) {
      return NextResponse.json(
        { error: 'Missing required fields: patientId, complaint' },
        { status: 400 }
      );
    }

    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Create complaint as PatientRecord with COMPLAINTS type
    const patientRecord = await prisma.patientRecord.create({
      data: {
        patientId,
        recordType: 'COMPLAINTS',
        title: `Keluhan - ${severity}`,
        content: complaint,
        metadata: {
          severity,
          status: 'BARU',
          notes: notes || null
        }
      }
    });

    return NextResponse.json(patientRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating patient complaint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}