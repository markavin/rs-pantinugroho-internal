// src/app/api/patient-records/route.ts
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

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const recordType = searchParams.get('type');
    const limit = searchParams.get('limit');

    const whereClause: any = {};
    
    if (patientId) {
      whereClause.patientId = patientId;
    }
    
    if (recordType) {
      whereClause.recordType = recordType;
    }

    const records = await prisma.patientRecord.findMany({
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
        createdAt: 'desc'
      },
      take: limit ? parseInt(limit) : undefined
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching patient records:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const allowedRoles = ['PERAWAT_POLI', 'DOKTER_SPESIALIS', 'SUPER_ADMIN', 'PERAWAT_RUANGAN'];

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const {
      patientId,
      recordType,
      title,
      content,
      metadata
    } = body;

    // Validasi required fields
    if (!patientId || !recordType || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: patientId, recordType, title, content' },
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

    const patientRecord = await prisma.patientRecord.create({
      data: {
        patientId,
        recordType,
        title,
        content,
        metadata: metadata || {}
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

    return NextResponse.json(patientRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating patient record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}