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
      orderBy: {
        createdAt: 'desc'
      },
      take: limit ? parseInt(limit) : undefined,
      include: {
        patient: {
          select: {
            name: true,
            mrNumber: true
          }
        }
      }
    });

    console.log(`✅ Fetched ${records.length} patient records`);

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching patient records:', error);
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

    const body = await request.json();
    console.log('📥 Received patient record data:', body);

    const {
      patientId,
      recordType,
      title,
      content,
      metadata,
      bloodSugar,
      bloodPressure,
      temperature,
      heartRate,
      weight,
      medicationCompliance,
      dietCompliance
    } = body;

    // Validasi required fields
    if (!patientId || !recordType || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: patientId, recordType, title' },
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

    // 🔧 FIX: Ensure vital signs data is saved to proper columns
    const recordData: any = {
      patientId,
      recordType,
      title,
      content: content || '',
      metadata: metadata || {}
    };

    // Add clinical data if provided
    if (bloodSugar !== undefined && bloodSugar !== null) {
      recordData.bloodSugar = parseFloat(bloodSugar);
    }
    
    if (bloodPressure !== undefined && bloodPressure !== null) {
      recordData.bloodPressure = String(bloodPressure);
      console.log('✅ Saving Blood Pressure:', bloodPressure);
    }
    
    if (temperature !== undefined && temperature !== null) {
      recordData.temperature = parseFloat(temperature);
      console.log('✅ Saving Temperature:', temperature);
    }
    
    if (heartRate !== undefined && heartRate !== null) {
      recordData.heartRate = parseInt(heartRate);
      console.log('✅ Saving Heart Rate:', heartRate);
    }
    
    if (weight !== undefined && weight !== null) {
      recordData.weight = parseFloat(weight);
    }
    
    if (medicationCompliance !== undefined && medicationCompliance !== null) {
      recordData.medicationCompliance = parseInt(medicationCompliance);
    }
    
    if (dietCompliance !== undefined && dietCompliance !== null) {
      recordData.dietCompliance = parseInt(dietCompliance);
    }

    console.log('💾 Creating patient record with data:', recordData);

    // Create patient record
    const patientRecord = await prismaClient.patientRecord.create({
      data: recordData
    });

    console.log('✅ Patient record created successfully:', patientRecord.id);
    console.log('   - Blood Pressure:', patientRecord.bloodPressure);
    console.log('   - Heart Rate:', patientRecord.heartRate);
    console.log('   - Temperature:', patientRecord.temperature);

    return NextResponse.json(patientRecord, { status: 201 });
  } catch (error: any) {
    console.error('❌ Detailed error creating patient record:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });

    if (error.code === 'P2002') {
      return NextResponse.json({ 
        error: 'Duplicate entry detected' 
      }, { status: 400 });
    }

    if (error.code === 'P2003') {
      return NextResponse.json({ 
        error: 'Foreign key constraint failed. Patient may not exist.' 
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

export async function PATCH(request: Request) {
  let prismaClient = new PrismaClient();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    const updatedRecord = await prismaClient.patientRecord.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error('Error updating patient record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prismaClient.$disconnect();
  }
}