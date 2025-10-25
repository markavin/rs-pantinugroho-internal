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

    // PERBAIKAN 1: Langsung filter berdasarkan status RAWAT_INAP
    const whereClause: any = {
      status: status || 'RAWAT_INAP'
    };

    console.log('Fetching patients with status:', whereClause.status);

    const patients = await prisma.patient.findMany({
      where: whereClause,
      orderBy: {
        updatedAt: 'desc'
      }
    });

    console.log(`Found ${patients.length} patients with status RAWAT_INAP`);

    const patientIds = patients.map(p => p.id);

    // PERBAIKAN 2: Ambil handled patients tapi jangan filter terlalu ketat
    const handledPatients = await prisma.handledPatient.findMany({
      where: {
        patientId: { in: patientIds }
      },
      orderBy: {
        handledDate: 'desc'
      },
      distinct: ['patientId'],
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

    // Ambil data visitasi terbaru untuk perhitungan energi
    const latestVisitations = await prisma.visitation.findMany({
      where: { patientId: { in: patientIds } },
      orderBy: { createdAt: 'desc' },
      distinct: ['patientId'],
      select: {
        patientId: true,
        energyRequirement: true,
        calculatedBMI: true,
        energyCalculationDetail: true,
        weight: true,
        height: true,
        createdAt: true
      }
    });

    // PERBAIKAN 3: Tidak filter lagi, langsung map semua pasien RAWAT_INAP
    const combinedData = patients.map(patient => {
      const handledInfo = handledPatients.find(hp => hp.patientId === patient.id);
      const latestNutritionRecord = latestNutritionRecords.find(nr => nr.patientId === patient.id);
      const latestVisitation = latestVisitations.find(v => v.patientId === patient.id);

      return {
        ...patient,
        // Handled info (bisa null kalau belum ada)
        handledStatus: handledInfo?.status || null,
        handledDate: handledInfo?.handledDate || null,
        diagnosis: handledInfo?.diagnosis || null,
        handlingDoctor: handledInfo?.handler || null,
        
        // Nutrition records
        latestNutritionRecord: latestNutritionRecord || null,
        dietCompliance: latestNutritionRecord?.complianceScore || null,
        calorieRequirement: latestNutritionRecord?.targetCalories || null,
        dietPlan: latestNutritionRecord?.dietPlan || null,
        
        // Data dari visitasi perawat
        latestEnergyCalculation: latestVisitation?.energyRequirement || patient.latestEnergyRequirement || null,
        latestBMI: latestVisitation?.calculatedBMI || patient.latestBMI || null,
        energyCalculationDetail: latestVisitation?.energyCalculationDetail || patient.lastEnergyCalculation || null,
        lastWeightUpdate: latestVisitation?.createdAt || null,
        currentWeight: latestVisitation?.weight || patient.weight || null,
        currentHeight: latestVisitation?.height || patient.height || null
      };
    });

    console.log(`Returning ${combinedData.length} patients to frontend`);

    return NextResponse.json(combinedData);
  } catch (error) {
    console.error('Error fetching nutrition patients:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}