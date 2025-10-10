// src/app/api/alerts/route.ts - VERSI LENGKAP

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
    const role = searchParams.get('role'); // User's current role
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const patientId = searchParams.get('patientId');

    const whereClause: any = {};
    
    // Filter by read status
    if (unreadOnly) {
      whereClause.isRead = false;
    }

    // Filter by patient
    if (patientId) {
      whereClause.patientId = patientId;
    }

    // PENTING: Filter alerts sesuai target role
    // Karena field targetRole belum ada di schema, kita gunakan category sebagai proxy
    // Nanti perlu migration untuk add targetRole field
    
    // Mapping role ke category yang relevan
    const roleCategoryMap: Record<string, string[]> = {
      'PERAWAT_POLI': ['SYSTEM', 'BLOOD_SUGAR', 'VITAL_SIGNS'],
      'DOKTER_SPESIALIS': ['SYSTEM', 'BLOOD_SUGAR', 'VITAL_SIGNS', 'MEDICATION'],
      'FARMASI': ['MEDICATION'],
      'GIZI': ['DIET', 'NUTRITION'],
      'ADMINISTRASI': ['SYSTEM', 'REGISTRATION']
    };

    // Filter berdasarkan role jika ada mapping
    if (role && roleCategoryMap[role]) {
      whereClause.category = {
        in: roleCategoryMap[role]
      };
    }

    const alerts = await prisma.alert.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            name: true,
            mrNumber: true
          }
        }
      },
      orderBy: [
        { isRead: 'asc' },  // Unread first
        { priority: 'desc' }, // Then by priority
        { createdAt: 'desc' } // Then by date
      ],
      take: 100 // Limit untuk performa
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      type, 
      message, 
      patientId, 
      category, 
      priority = 'MEDIUM',
      targetRole // Akan diabaikan sampai field ini ditambahkan ke schema
    } = body;

    // Validasi required fields
    if (!type || !message || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: type, message, category' }, 
        { status: 400 }
      );
    }

    const alert = await prisma.alert.create({
      data: {
        type,
        message,
        patientId: patientId || null,
        category,
        priority,
        isRead: false,
        // targetRole akan ditambahkan setelah migration
      },
      include: {
        patient: {
          select: {
            name: true,
            mrNumber: true
          }
        }
      }
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE all read alerts (cleanup)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const olderThanDays = parseInt(searchParams.get('olderThanDays') || '30');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await prisma.alert.deleteMany({
      where: {
        isRead: true,
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    return NextResponse.json({ 
      message: `Deleted ${result.count} old read alerts`,
      count: result.count 
    });
  } catch (error) {
    console.error('Error deleting old alerts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}