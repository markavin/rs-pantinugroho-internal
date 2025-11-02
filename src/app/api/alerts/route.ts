// src/app/api/alerts/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const targetRole = searchParams.get('targetRole');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const patientId = searchParams.get('patientId');
    const category = searchParams.get('category');

    const whereClause: any = {};

    if (unreadOnly) {
      whereClause.isRead = false;
    }

    if (patientId) {
      whereClause.patientId = patientId;
    }

    if (category) {
      whereClause.category = category;
    }

    if (targetRole) {
      whereClause.targetRole = targetRole;
    } else if (role && !category && !patientId) {
      whereClause.OR = [
        { targetRole: role },
        { targetRole: null }
      ];
    }

    console.log('Alert query whereClause:', JSON.stringify(whereClause, null, 2));

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
        { isRead: 'asc' },
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 100
    });

    console.log('Found alerts:', alerts.length);

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
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

    console.log('Alert Request Body:', JSON.stringify(body, null, 2));

    const {
      type,
      message,
      patientId,
      category,
      priority = 'MEDIUM',
      targetRole
    } = body;

    console.log('Parsed Values:', {
      type,
      category,
      priority,
      targetRole,
      hasPatientId: !!patientId
    });

    if (!type || !message || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: type, message, category' },
        { status: 400 }
      );
    }

    const validTypes = ['CRITICAL', 'WARNING', 'INFO'];
    const validCategories = [
      'SYSTEM',
      'BLOOD_SUGAR',
      'VITAL_SIGNS',
      'LAB_RESULT',
      'MEDICATION',
      'NUTRITION',
      'APPOINTMENT',
      'REGISTRATION'
    ];
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    const validRoles = [
      'SUPER_ADMIN',
      'DOKTER_SPESIALIS',
      'PERAWAT_RUANGAN',
      'PERAWAT_POLI',
      'AHLI_GIZI',
      'FARMASI',
      'MANAJER',
      'ADMINISTRASI'
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` },
        { status: 400 }
      );
    }

    let finalTargetRole = null;

    if (targetRole) {
      const trimmedRole = String(targetRole).trim();

      if (trimmedRole && trimmedRole !== 'null' && trimmedRole !== 'undefined') {
        if (validRoles.includes(trimmedRole)) {
          finalTargetRole = trimmedRole;
          console.log('Valid targetRole:', finalTargetRole);
        } else {
          console.error('Invalid targetRole:', trimmedRole);
          return NextResponse.json(
            { error: `Invalid targetRole '${trimmedRole}'. Must be one of: ${validRoles.join(', ')}` },
            { status: 400 }
          );
        }
      } else {
        console.warn('targetRole is empty/null/undefined, will be set to null');
      }
    }

    console.log('Final targetRole to save:', finalTargetRole);

    const alert = await prisma.alert.create({
      data: {
        type,
        message,
        patientId: patientId || null,
        category,
        priority,
        targetRole: finalTargetRole,
        isRead: false,
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

    console.log('Alert created successfully:', {
      id: alert.id,
      type: alert.type,
      targetRole: alert.targetRole,
      category: alert.category
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { error: 'Failed to create alert', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

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
    return NextResponse.json(
      { error: 'Failed to delete alerts', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}