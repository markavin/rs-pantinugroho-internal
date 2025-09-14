// src/app/api/dashboard/nurse-poli-stats/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to access dashboard stats
    const userRole = (session.user as any).role;
    if (userRole !== 'PERAWAT_POLI' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Count total patients
    const totalPatients = await prisma.patient.count();

    // Count today's registrations
    const todayRegistrations = await prisma.patient.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    });

    // Count active complaints (status: BARU or DALAM_PROSES)
    const activeComplaints = await prisma.patientComplaint.count({
      where: {
        status: {
          in: ['BARU', 'DALAM_PROSES']
        }
      }
    });

    const stats = {
      totalPatients,
      todayRegistrations,
      activeComplaints
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching nurse poli dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}