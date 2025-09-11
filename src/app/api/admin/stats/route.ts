// src/app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// Helper function to check if LoginLog table exists and has data
async function checkLoginLogTable() {
  try {
    const count = await prisma.loginLog.count();
    console.log('LoginLog table exists with', count, 'records');
    return { exists: true, count };
  } catch (error: any) {
    console.log('LoginLog table check failed:', error.code);
    if (error.code === 'P2021') {
      console.log('LoginLog table does not exist');
    }
    return { exists: false, count: 0 };
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Admin stats request from:', (session.user as any).username);

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    // Get total staff count (always accurate)
    const totalStaff = await prisma.user.count({
      where: { isActive: true }
    });

    console.log('Total staff:', totalStaff);

    // Check if LoginLog table exists
    const loginLogStatus = await checkLoginLogTable();
    
    let dailyLogins = 0;
    let weeklyActivity = [];

    if (loginLogStatus.exists && loginLogStatus.count > 0) {
      console.log('Using real LoginLog data');
      
      try {
        // Get today's actual login count
        dailyLogins = await prisma.loginLog.count({
          where: {
            loginTime: {
              gte: startOfDay,
              lt: endOfDay
            }
          }
        });

        console.log('Daily logins found:', dailyLogins);

        // Get 7-day login activity with real data
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
          
          const logins = await prisma.loginLog.count({
            where: {
              loginTime: {
                gte: dayStart,
                lt: dayEnd
              }
            }
          });

          const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
          const isToday = dayStart.toDateString() === now.toDateString();
          
          weeklyActivity.push({
            day: dayNames[date.getDay()],
            date: date.toISOString().split('T')[0],
            logins,
            isToday
          });
        }

        console.log('Weekly activity generated from real data');

      } catch (queryError) {
        console.error('Error querying LoginLog data:', queryError);
        
        // If query fails, set to 0 to show no data available
        dailyLogins = 0;
        
        const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const isToday = date.toDateString() === now.toDateString();
          
          weeklyActivity.push({
            day: dayNames[date.getDay()],
            date: date.toISOString().split('T')[0],
            logins: 0,
            isToday
          });
        }
      }
    } else {
      console.log('LoginLog table not available, no login data');
      
      // No LoginLog table = no login tracking data
      dailyLogins = 0;
      
      const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const isToday = date.toDateString() === now.toDateString();
        
        weeklyActivity.push({
          day: dayNames[date.getDay()],
          date: date.toISOString().split('T')[0],
          logins: 0,
          isToday
        });
      }
    }

    // Get staff distribution by role (always accurate)
    const staffDistribution = await prisma.user.groupBy({
      by: ['role'],
      where: { isActive: true },
      _count: {
        role: true
      }
    });

    const roleNames = {
      'DOKTER_SPESIALIS': 'Dokter Spesialis',
      'PERAWAT_RUANGAN': 'Perawat Ruangan',
      'PERAWAT_POLI': 'Perawat Poli',
      'FARMASI': 'Farmasi',
      'AHLI_GIZI': 'Ahli Gizi'
    };

    const roleColors = {
      'DOKTER_SPESIALIS': 'bg-blue-500',
      'PERAWAT_RUANGAN': 'bg-teal-500',
      'PERAWAT_POLI': 'bg-cyan-500',
      'FARMASI': 'bg-emerald-500',
      'AHLI_GIZI': 'bg-green-500'
    };

    const distribution = staffDistribution.map(item => ({
      role: roleNames[item.role as keyof typeof roleNames] || item.role,
      count: item._count.role,
      color: roleColors[item.role as keyof typeof roleColors] || 'bg-gray-500'
    }));

    const responseData = {
      totalStaff,
      dailyLogins,
      weeklyActivity,
      distribution,
      meta: {
        hasLoginData: loginLogStatus.exists && loginLogStatus.count > 0,
        loginLogRecords: loginLogStatus.count,
        timestamp: now.toISOString()
      }
    };

    console.log('Returning stats:', {
      totalStaff,
      dailyLogins,
      weeklyActivityDays: weeklyActivity.length,
      distributionItems: distribution.length,
      hasRealLoginData: loginLogStatus.exists && loginLogStatus.count > 0
    });

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    
    return NextResponse.json({ 
      error: 'Failed to fetch stats',
      details: error.message
    }, { status: 500 });
  }
}