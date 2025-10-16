// src/app/api/nutrition-patients/route.ts
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
    if (userRole !== 'AHLI_GIZI' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only nutritionists can access this endpoint' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const whereClause: any = {
      status: status || 'RAWAT_INAP'
    };

    const patients = await prisma.patient.findMany({
      where: whereClause,
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const patientIds = patients.map(p => p.id);

    const activeHandledPatients = await prisma.handledPatient.findMany({
      where: {
        patientId: { in: patientIds },
        status: { notIn: ['SELESAI', 'RUJUK_KELUAR', 'MENINGGAL'] }
      },
      select: {
        patientId: true,
        status: true,
        diagnosis: true,
        handledDate: true,
        handledBy: true,
        handler: {
          select: { name: true, role: true }
        }
      }
    });

    const latestNutritionRecords = await prisma.nutritionRecord.findMany({
      where: { patientId: { in: patientIds } },
      orderBy: { createdAt: 'desc' },
      distinct: ['patientId']
    });

    const combinedData = patients
      .filter(patient => activeHandledPatients.some(hp => hp.patientId === patient.id))
      .map(patient => {
        const handledInfo = activeHandledPatients.find(hp => hp.patientId === patient.id);
        const latestNutritionRecord = latestNutritionRecords.find(nr => nr.patientId === patient.id);

        return {
          ...patient,
          handledStatus: handledInfo?.status,
          handledDate: handledInfo?.handledDate,
          diagnosis: handledInfo?.diagnosis,
          handlingDoctor: handledInfo?.handler,
          latestNutritionRecord,
          dietCompliance: latestNutritionRecord?.complianceScore || null,
          calorieRequirement: latestNutritionRecord?.targetCalories || null,
          dietPlan: latestNutritionRecord?.dietPlan || null
        };
      });

    return NextResponse.json(combinedData);
  } catch (error) {
    console.error('Error fetching nutrition patients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}