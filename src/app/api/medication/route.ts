import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET - Get medications for a patient
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');

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

    const medications = await prisma.medication.findMany({
      where: { 
        patientId,
        isActive: true 
      },
      include: {
        prescribedByUser: { // This matches your schema relation name
          select: { name: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(medications);

  } catch (error) {
    console.error('Error fetching medications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Prescribe new medication (doctors only)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user || !['DOCTOR', 'PHARMACIST'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      patientId,
      name,
      genericName,
      dosage,
      frequency,
      duration,
      instructions,
      startDate,
      endDate,
      route
    } = body;

    if (!patientId || !name || !dosage || !frequency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    const medication = await prisma.medication.create({
      data: {
        patientId,
        medicationName: name, // Use medicationName as defined in schema
        dosage,
        frequency,
        route: route || 'Oral', // Provide default if not specified
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        prescribedBy: session.user.id,
        isActive: true,
        // Optional fields
        ...(genericName && { genericName }),
        ...(duration && { duration }),
        ...(instructions && { instructions }),
        ...(name && { name }) // Store name as alias too
      },
      include: {
        prescribedByUser: {
          select: { name: true, role: true }
        }
      }
    });

    return NextResponse.json(medication, { status: 201 });

  } catch (error) {
    console.error('Error creating medication:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update medication (doctors/pharmacists only)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user || !['DOCTOR', 'PHARMACIST'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { medicationId, ...updateData } = body;

    if (!medicationId) {
      return NextResponse.json(
        { error: 'Medication ID is required' },
        { status: 400 }
      );
    }

    // Verify medication exists
    const existingMedication = await prisma.medication.findUnique({
      where: { id: medicationId }
    });

    if (!existingMedication) {
      return NextResponse.json(
        { error: 'Medication not found' },
        { status: 404 }
      );
    }

    const medication = await prisma.medication.update({
      where: { id: medicationId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        prescribedByUser: {
          select: { name: true, role: true }
        }
      }
    });

    return NextResponse.json(medication);

  } catch (error) {
    console.error('Error updating medication:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Deactivate medication (doctors only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user || session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const medicationId = searchParams.get('medicationId');

    if (!medicationId) {
      return NextResponse.json(
        { error: 'Medication ID is required' },
        { status: 400 }
      );
    }

    // Soft delete by setting isActive to false
    const medication = await prisma.medication.update({
      where: { id: medicationId },
      data: { 
        isActive: false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ message: 'Medication deactivated successfully' });

  } catch (error) {
    console.error('Error deactivating medication:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}