// src/app/api/debug/check-login-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check LoginLog table
    const loginLogCount = await prisma.loginLog.count();
    console.log('Total LoginLog records:', loginLogCount);

    // Get all login logs
    const allLogins = await prisma.loginLog.findMany({
      include: {
        user: {
          select: {
            name: true,
            username: true,
            role: true
          }
        }
      },
      orderBy: { loginTime: 'desc' },
      take: 20
    });

    // Get today's logins
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const todayLogins = await prisma.loginLog.findMany({
      where: {
        loginTime: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      include: {
        user: {
          select: {
            name: true,
            username: true,
            role: true
          }
        }
      },
      orderBy: { loginTime: 'desc' }
    });

    const todayCount = await prisma.loginLog.count({
      where: {
        loginTime: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    });

    return NextResponse.json({
      totalLoginRecords: loginLogCount,
      todayLoginCount: todayCount,
      todayLogins: todayLogins.map(log => ({
        id: log.id,
        user: log.user.name,
        username: log.user.username,
        role: log.user.role,
        loginTime: log.loginTime,
        logoutTime: log.logoutTime,
        sessionId: log.sessionId,
        ipAddress: log.ipAddress
      })),
      allRecentLogins: allLogins.map(log => ({
        id: log.id,
        user: log.user.name,
        username: log.user.username,
        role: log.user.role,
        loginTime: log.loginTime,
        logoutTime: log.logoutTime,
        sessionId: log.sessionId,
        ipAddress: log.ipAddress
      })),
      currentTime: new Date().toISOString(),
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString()
    });

  } catch (error) {
    console.error('Debug check error:', error);
    return NextResponse.json({
      error: 'Failed to check login data',
      details: error.message
    }, { status: 500 });
  }
}