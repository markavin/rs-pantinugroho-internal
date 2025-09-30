// src/app/api/nutrition-records/route.ts
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

    if (userRole !== 'AHLI_GIZI' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only nutritionists can create nutrition records' }, { status: 403 });
    }

    const body = await request.json();
    const {
      patientId,
      targetCalories,
      dietPlan,
      complianceScore,
      weightChange,
      recommendations,
      nutritionGoals,
      foodRecall,
      dietaryPattern,
      foodAllergies,
      carbLimit,
      proteinGoal,
      fatLimit,
      mealDistribution
    } = body;

    if (!patientId || !targetCalories) {
      return NextResponse.json({ error: 'patientId and targetCalories are required' }, { status: 400 });
    }

    // Verify patient exists and is in appropriate status
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        status: {
          in: ['RAWAT_INAP', 'RAWAT_JALAN']
        }
      }
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found or not eligible for nutrition monitoring' }, { status: 404 });
    }

    const nutritionRecord = await prisma.nutritionRecord.create({
      data: {
        patientId,
        nutritionistId: userId,
        foodRecall: foodRecall || {},
        dietaryPattern: dietaryPattern || null,
        foodAllergies: foodAllergies || [],
        targetCalories: parseInt(targetCalories),
        carbLimit: carbLimit ? parseInt(carbLimit) : null,
        proteinGoal: proteinGoal ? parseInt(proteinGoal) : null,
        fatLimit: fatLimit ? parseInt(fatLimit) : null,
        mealDistribution: mealDistribution || null,
        dietPlan: dietPlan || null,
        complianceScore: complianceScore ? parseInt(complianceScore) : null,
        weightChange: weightChange ? parseFloat(weightChange) : null,
        nutritionGoals: nutritionGoals || [],
        recommendations: recommendations || []
      },
      include: {
        patient: {
          select: {
            name: true,
            mrNumber: true
          }
        },
        nutritionist: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json(nutritionRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating nutrition record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}