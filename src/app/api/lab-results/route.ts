// src/app/api/lab-results/route.ts
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
    const testType = searchParams.get('testType');
    const limit = searchParams.get('limit');

    const whereClause: any = {};

    if (patientId) {
      whereClause.patientId = patientId;
    }

    if (testType) {
      whereClause.testType = testType;
    }

    const labResults = await prisma.labResult.findMany({
      where: whereClause,
      include: {
        technician: true,
        patient: true
      },
      orderBy: {
        testDate: 'desc'
      },
      take: limit ? parseInt(limit) : undefined
    });

    return NextResponse.json(labResults);
  } catch (error) {
    console.error('Error fetching lab results:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  let prismaClient = new PrismaClient();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    const allowedRoles = ['PERAWAT_POLI', 'DOKTER_SPESIALIS', 'SUPER_ADMIN', 'PERAWAT_RUANGAN', 'ADMINISTRASI', 'FARMASI', 'MANAJER', 'AHLI_GIZI', 'LABORATORIUM'];

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    console.log('📥 Received lab result data:', body);

    const {
      patientId,
      testType,
      value,
      normalRange,
      status,
      notes,
      testDate
    } = body;

    // Validasi required fields
    if (!patientId || !testType || !value || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: patientId, testType, value, status' },
        { status: 400 }
      );
    }

    // Verify patient exists
    const patient = await prismaClient.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // 🔧 FIX: Remove technician verification, not all users have employee records
    console.log('✅ Creating lab result for user:', userId);

    // Create lab result - langsung tanpa verify user lagi
    const labResult = await prismaClient.labResult.create({
      data: {
        patientId: patientId,
        technicianId: userId,
        testType: testType,
        value: value,
        normalRange: normalRange || '-',
        status: status,
        notes: notes || null,
        testDate: testDate ? new Date(testDate) : new Date(),
        isVerified: false
      }
    });

    console.log('✅ Lab result created successfully:', labResult.id);

    return NextResponse.json(labResult, { status: 201 });
  } catch (error: any) {
    console.error('❌ Detailed error creating lab result:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });

    if (error.code === 'P2002') {
      return NextResponse.json({
        error: 'Duplicate entry detected'
      }, { status: 400 });
    }

    if (error.code === 'P2003') {
      return NextResponse.json({
        error: 'Foreign key constraint failed. Patient or user may not exist.'
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  } finally {
    await prismaClient.$disconnect();
  }
}