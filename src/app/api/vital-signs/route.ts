import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// POST - Add vital signs
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      patientId,
      bloodSugar,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      weight,
      height,
      heartRate,
      temperature,
      notes
    } = body;

    // Validate required fields
    if (!patientId || (!bloodSugar && bloodSugar !== 0)) {
      return NextResponse.json(
        { error: 'Patient ID and blood sugar are required' },
        { status: 400 }
      );
    }

    // Check if user can add vital signs for this patient
    if (session.user.role === 'PATIENT') {
      const patient = await prisma.patient.findFirst({
        where: { createdBy: session.user.id } // Fix: use createdBy
      });
      
      if (!patient || patient.id !== patientId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Update patient's height and weight if provided
    if (height || weight) {
      let updateData: any = {};
      if (height) updateData.height = height;
      if (weight) updateData.weight = weight;
      
      // Calculate BMI if both height and weight are available
      if (height && weight) {
        updateData.bmi = weight / ((height / 100) ** 2);
      }
      
      await prisma.patient.update({
        where: { id: patientId },
        data: updateData
      });
    }

    const vitalSign = await prisma.vitalSign.create({
      data: {
        patientId,
        // Fix: Map to correct field names in schema
        bloodGlucose: bloodSugar, // Use bloodGlucose (primary field)
        bloodSugar: bloodSugar,   // Also populate bloodSugar for backwards compatibility
        systolicBP: bloodPressureSystolic,
        diastolicBP: bloodPressureDiastolic,
        heartRate,
        temperature,
        recordDate: new Date(),
        measuredAt: new Date() // Add both fields if both exist in schema
      }
    });

    return NextResponse.json(vitalSign, { status: 201 });

  } catch (error) {
    console.error('Error creating vital sign:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get vital signs for a patient
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    // Check access permissions
    if (session.user.role === 'PATIENT') {
      const patient = await prisma.patient.findFirst({
        where: { createdBy: session.user.id } // Fix: use createdBy
      });
      
      if (!patient || patient.id !== patientId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const vitalSigns = await prisma.vitalSign.findMany({
      where: { patientId },
      orderBy: { recordDate: 'desc' }, // Fix: use recordDate instead of measuredAt
      take: limit
    });

    return NextResponse.json(vitalSigns);

  } catch (error) {
    console.error('Error fetching vital signs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}