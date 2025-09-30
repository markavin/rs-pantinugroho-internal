// src/app/api/medical-reports/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;
    
    if (userRole !== 'DOKTER_SPESIALIS' && userRole !== 'ADMINISTRASI') {
      return NextResponse.json({ error: 'Only doctors can create medical reports' }, { status: 403 });
    }

    const body = await request.json();
    const {
      patientId,
      reportType,
      diagnosis,
      treatmentPlan,
      chiefComplaint,
      historyOfIllness,
      physicalExamination,
      differentialDx,
      medications,
      labOrders,
      followUpPlan,
      referrals,
      recommendations,
      riskFactors,
      complications,
      prognosis
    } = body;

    if (!patientId || !diagnosis) {
      return NextResponse.json(
        { error: 'Missing required fields: patientId, diagnosis' },
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

    const medicalReport = await prisma.medicalReport.create({
      data: {
        patientId,
        doctorId: userId,
        reportType: reportType || 'INITIAL_ASSESSMENT',
        chiefComplaint: chiefComplaint || null,
        historyOfIllness: historyOfIllness || null,
        physicalExamination: physicalExamination || {},
        diagnosis,
        differentialDx: differentialDx || [],
        treatmentPlan: treatmentPlan || null,
        medications: medications || {},
        labOrders: labOrders || [],
        followUpPlan: followUpPlan || null,
        referrals: referrals || [],
        recommendations: recommendations || [],
        riskFactors: riskFactors || [],
        complications: complications || [],
        prognosis: prognosis || null
      },
      include: {
        patient: {
          select: {
            name: true,
            mrNumber: true
          }
        },
        doctor: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json(medicalReport, { status: 201 });
  } catch (error) {
    console.error('Error creating medical report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}