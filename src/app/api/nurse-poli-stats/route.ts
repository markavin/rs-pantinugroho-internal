// src/app/api/dashboard/nurse-poli-stats/route.ts
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
    if (userRole !== 'PERAWAT_POLI' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalPatientsToday = await prisma.patient.count({
      where: {
        status: {
          in: ['AKTIF', 'RAWAT_JALAN']
        }
      }
    });

    const examinationsToday = await prisma.patientRecord.count({
      where: {
        recordType: 'VITAL_SIGNS',
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    const waitingForDoctor = await prisma.handledPatient.count({
      where: {
        status: 'ANTRIAN'
      }
    });

    const abnormalResults = await prisma.labResult.count({
      where: {
        testDate: {
          gte: today,
          lt: tomorrow
        },
        status: {
          in: ['HIGH', 'CRITICAL', 'LOW']
        }
      }
    });

    const stats = {
      totalPatientsToday,
      examinationsToday,
      waitingForDoctor,
      abnormalResults
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching nurse poli stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}