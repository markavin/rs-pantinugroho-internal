import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET - Get medication logs for a patient
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    const medicationId = searchParams.get('medicationId');

    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    // Check access permissions
    if (session.user.role === 'PATIENT') {
      const patient = await prisma.patient.findFirst({
        where: { 
          createdBy: session.user.id, // Use createdBy instead of userId
          id: patientId 
        }
      });
      
      if (!patient) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const whereClause: any = { patientId };
    if (medicationId) {
      whereClause.medicationId = medicationId;
    }

    const medicationLogs = await prisma.medicationLog.findMany({
      where: whereClause,
      include: {
        medication: {
          select: { 
            medicationName: true, 
            dosage: true, 
            frequency: true 
          }
        },
        loggedByUser: {
          select: { name: true, role: true }
        }
      },
      orderBy: { takenAt: 'desc' }
    });

    return NextResponse.json(medicationLogs);

  } catch (error) {
    console.error('Error fetching medication logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Log medication taken
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { medicationId, takenAt, notes, dosageTaken, wasSkipped, skipReason } = body;

    if (!medicationId) {
      return NextResponse.json(
        { error: 'Medication ID is required' },
        { status: 400 }
      );
    }

    // Get medication and verify access
    const medication = await prisma.medication.findUnique({
      where: { id: medicationId },
      include: { patient: true }
    });

    if (!medication) {
      return NextResponse.json(
        { error: 'Medication not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    if (session.user.role === 'PATIENT') {
      const patient = await prisma.patient.findFirst({
        where: { 
          createdBy: session.user.id, // Use createdBy instead of userId
          id: medication.patientId 
        }
      });
      
      if (!patient) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const log = await prisma.medicationLog.create({
      data: {
        medicationId,
        patientId: medication.patientId,
        takenAt: takenAt ? new Date(takenAt) : new Date(),
        notes,
        dosageTaken,
        wasSkipped: wasSkipped || false,
        skipReason,
        loggedBy: session.user.id
      },
      include: {
        medication: {
          select: { 
            medicationName: true, 
            dosage: true, 
            frequency: true 
          }
        },
        loggedByUser: {
          select: { name: true, role: true }
        }
      }
    });

    return NextResponse.json(log, { status: 201 });

  } catch (error) {
    console.error('Error logging medication:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update medication log
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { logId, ...updateData } = body;

    if (!logId) {
      return NextResponse.json(
        { error: 'Log ID is required' },
        { status: 400 }
      );
    }

    // Verify log exists and user has access
    const existingLog = await prisma.medicationLog.findUnique({
      where: { id: logId },
      include: { 
        medication: { 
          include: { patient: true } 
        } 
      }
    });

    if (!existingLog) {
      return NextResponse.json(
        { error: 'Medication log not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    if (session.user.role === 'PATIENT') {
      const patient = await prisma.patient.findFirst({
        where: { 
          createdBy: session.user.id,
          id: existingLog.medication.patientId 
        }
      });
      
      if (!patient) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const updatedLog = await prisma.medicationLog.update({
      where: { id: logId },
      data: updateData,
      include: {
        medication: {
          select: { 
            medicationName: true, 
            dosage: true, 
            frequency: true 
          }
        },
        loggedByUser: {
          select: { name: true, role: true }
        }
      }
    });

    return NextResponse.json(updatedLog);

  } catch (error) {
    console.error('Error updating medication log:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}