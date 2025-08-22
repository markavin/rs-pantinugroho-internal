import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET - Get specific patient
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const patientId = params.id;

    // Patients can only view their own data
    if (session.user.role === 'PATIENT') {
      const patient = await prisma.patient.findFirst({
        where: { createdBy: session.user.id } // Fix: use createdBy instead of userId
      });
      
      if (!patient || patient.id !== patientId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: {
          select: { email: true, name: true }
        },
        medicalRecords: {
          include: {
            doctor: { select: { name: true } },
            vitalSigns: true
            // Fix: Remove medications relation from here as it doesn't exist in MedicalRecord
          },
          orderBy: { createdAt: 'desc' }
        },
        // Fix: Add medications as direct relation to patient
        medications: {
          include: {
            prescribedByUser: { select: { name: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        appointments: {
          include: {
            doctor: { select: { name: true } }
          },
          orderBy: { appointmentDate: 'desc' } // Fix: use appointmentDate instead of scheduledAt
        },
        // Add other useful relations
        vitalSigns: {
          orderBy: { recordDate: 'desc' },
          take: 10
        },
        labResults: {
          orderBy: { testDate: 'desc' },
          take: 10
        }
      }
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json(patient);

  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update patient
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    
    if (!session?.user || !['ADMIN', 'DOCTOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const patientId = params.id;
    const body = await req.json();
    
    const {
      name,
      birthDate,
      gender,
      phone,
      address,
      diabetesType,
      diagnosisDate,
      comorbidities,
      height,
      weight,
      bloodType,
      allergies,
      insuranceType,
      insuranceNumber
    } = body;

    // Calculate BMI if height and weight provided
    let bmi;
    if (height && weight) {
      bmi = weight / ((height / 100) ** 2);
    }

    const updatedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: {
        name,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        gender,
        phone,
        address,
        diabetesType,
        diagnosisDate: diagnosisDate ? new Date(diagnosisDate) : null,
        comorbidities,
        height,
        weight,
        bmi,
        bloodType,
        allergies,
        insuranceType,
        insuranceNumber
      },
      include: {
        user: {
          select: { email: true, name: true }
        }
      }
    });

    return NextResponse.json(updatedPatient);

  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete patient (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const patientId = params.id;

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { user: true }
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Delete patient and associated user
    await prisma.$transaction([
      prisma.patient.delete({ where: { id: patientId } }),
      prisma.user.delete({ where: { id: patient.createdBy } })
    ]);

    return NextResponse.json({ message: 'Patient deleted successfully' });

  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}