// src/app/api/handled-patients/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET handled patients
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;
    const allowedRoles = ['PERAWAT_POLI', 'DOKTER_SPESIALIS', 'SUPER_ADMIN', 'PERAWAT_RUANGAN', 'AHLI_GIZI', 'FARMASI'];
    
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const handledBy = searchParams.get('handledBy');

    let whereClause: any = {};
    
    // If not super admin, only show own handled patients
    if (userRole !== 'SUPER_ADMIN') {
      whereClause.handledBy = userId;
    }

    if (status) {
      whereClause.status = status;
    }

    if (handledBy && userRole === 'SUPER_ADMIN') {
      whereClause.handledBy = handledBy;
    }

    const handledPatients = await prisma.handledPatient.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            mrNumber: true,
            name: true,
            birthDate: true,
            gender: true,
            phone: true,
            diabetesType: true,
            insuranceType: true,
            riskLevel: true,
            status: true,
            bmi: true,
            allergies: true
          }
        },
        handler: {
          select: {
            name: true,
            role: true,
            employeeId: true
          }
        }
      },
      orderBy: {
        handledDate: 'desc'
      }
    });

    return NextResponse.json(handledPatients);
  } catch (error) {
    console.error('Error fetching handled patients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST new handled patient
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;
    const allowedRoles = ['PERAWAT_POLI', 'DOKTER_SPESIALIS', 'SUPER_ADMIN', 'PERAWAT_RUANGAN', 'AHLI_GIZI', 'FARMASI'];
    
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const {
      patientId,
      diagnosis,
      treatmentPlan,
      notes,
      priority,
      nextVisitDate,
      estimatedDuration,
      specialInstructions
    } = body;

    if (!patientId) {
      return NextResponse.json(
        { error: 'Missing required field: patientId' },
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

    // Check if patient is already being handled by this user with active status
    const existingHandled = await prisma.handledPatient.findFirst({
      where: {
        patientId,
        handledBy: userId,
        status: 'ACTIVE'
      }
    });

    if (existingHandled) {
      return NextResponse.json(
        { error: 'Patient is already being handled by you with active status' },
        { status: 400 }
      );
    }

    const handledPatient = await prisma.handledPatient.create({
      data: {
        patientId,
        handledBy: userId,
        diagnosis: diagnosis || null,
        treatmentPlan: treatmentPlan || null,
        notes: notes || null,
        priority: priority || 'NORMAL',
        status: 'ACTIVE',
        nextVisitDate: nextVisitDate ? new Date(nextVisitDate) : null,
        estimatedDuration: estimatedDuration || null,
        specialInstructions: specialInstructions || null,
      },
      include: {
        patient: {
          select: {
            id: true,
            mrNumber: true,
            name: true,
            birthDate: true,
            gender: true,
            diabetesType: true,
            insuranceType: true,
            riskLevel: true
          }
        },
        handler: {
          select: {
            name: true,
            role: true
          }
        }
      }
    });

    return NextResponse.json(handledPatient, { status: 201 });
  } catch (error) {
    console.error('Error creating handled patient:', error);
    
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ error: 'This patient is already being handled with the same status' }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}