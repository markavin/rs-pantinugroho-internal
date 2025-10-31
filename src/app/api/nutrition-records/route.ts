// src/app/api/nutrition-records/route.ts
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

    const whereClause: any = {};
    if (patientId) {
      whereClause.patientId = patientId;
    }

    const records = await prisma.nutritionRecord.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
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

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching nutrition records:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    const allowedRoles = ['AHLI_GIZI', 'SUPER_ADMIN'];
    
    if (!allowedRoles.includes(userRole)) {
      console.error('Forbidden: User role', userRole, 'not in', allowedRoles);
      return NextResponse.json({ 
        error: 'Only nutritionists can create nutrition records',
        userRole: userRole
      }, { status: 403 });
    }

    const body = await request.json();
    const {
      patientId,
      targetCalories,
      dietPlan,
      mealDistribution,
      complianceScore,
      weightChange,
      recommendations,
      foodRecall
    } = body;

    if (!patientId) {
      return NextResponse.json(
        { error: 'Missing required field: patientId' },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create nutrition record
      const nutritionRecord = await tx.nutritionRecord.create({
        data: {
          patientId,
          nutritionistId: userId,
          targetCalories: targetCalories || null,
          dietPlan: dietPlan || null,
          mealDistribution: mealDistribution || null,
          complianceScore: complianceScore || null,
          weightChange: weightChange || null,
          recommendations: recommendations || [],
          foodRecall: foodRecall || null
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

      const patientUpdateData: any = {};
      
      if (dietPlan) {
        patientUpdateData.dietPlan = dietPlan;
      }
      
      if (targetCalories) {
        patientUpdateData.calorieRequirement = targetCalories;
      }
      
      if (complianceScore !== null && complianceScore !== undefined) {
        patientUpdateData.dietCompliance = parseInt(complianceScore.toString());
      }

      // Update patient jika ada data yang perlu diupdate
      if (Object.keys(patientUpdateData).length > 0) {
        await tx.patient.update({
          where: { id: patientId },
          data: patientUpdateData
        });
        
        console.log('Patient updated with:', patientUpdateData);
      }

      return nutritionRecord;
    });

    console.log('Nutrition record created successfully:', result.id);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating nutrition record:', error);
    
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ error: 'Duplicate entry detected' }, { status: 400 });
    }
    
    if ((error as any).code === 'P2003') {
      return NextResponse.json({ error: 'Foreign key constraint failed' }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}