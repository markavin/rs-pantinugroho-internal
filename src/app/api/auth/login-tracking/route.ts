//src\app\api\auth\login-tracking\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

function getStartAndEndOfDay(date: Date, tzOffset = 7) {
  // shift date to local timezone (WIB default)
  const local = new Date(date.getTime() + tzOffset * 60 * 60 * 1000);
  const start = new Date(local.getFullYear(), local.getMonth(), local.getDate());
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  // shift back to UTC for DB comparison
  return {
    start: new Date(start.getTime() - tzOffset * 60 * 60 * 1000),
    end: new Date(end.getTime() - tzOffset * 60 * 60 * 1000),
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Admin stats requested by:', (session.user as any).username);

    const now = new Date();
    const { start, end } = getStartAndEndOfDay(now);

    // Total staff aktif
    const totalStaff = await prisma.user.count({
      where: { isActive: true },
    });

    // Daily logins
    const dailyLogins = await prisma.loginLog.count({
      where: {
        loginTime: { gte: start, lt: end },
      },
    });

    // Weekly logins (1 query, bukan loop 7 kali)
    const sevenDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    const rawWeekly = await prisma.loginLog.groupBy({
      by: ['loginTime'],
      where: {
        loginTime: { gte: sevenDaysAgo },
      },
      _count: { loginTime: true },
    });

    // Format data biar konsisten 7 hari
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const { start, end } = getStartAndEndOfDay(d);
      const count = rawWeekly
        .filter(r => r.loginTime >= start && r.loginTime < end)
        .reduce((sum, r) => sum + r._count.loginTime, 0);

      weeklyActivity.push({
        day: dayNames[d.getDay()],
        date: d.toISOString().split('T')[0],
        logins: count,
        isToday: d.toDateString() === now.toDateString(),
      });
    }

    // Staff distribution by role
    const staffDistribution = await prisma.user.groupBy({
      by: ['role'],
      where: { isActive: true },
      _count: { role: true },
    });

    const roleNames = {
      DOKTER_SPESIALIS: 'Dokter Spesialis',
      PERAWAT_RUANGAN: 'Perawat Ruangan',
      PERAWAT_POLI: 'Perawat Poli',
      FARMASI: 'Farmasi',
      ADMINISTRASI: 'Administrasi',
      MANAJER: 'Manajer',
      AHLI_GIZI: 'Ahli Gizi',
    };

    const roleColors = {
      DOKTER_SPESIALIS: 'bg-blue-500',
      PERAWAT_RUANGAN: 'bg-teal-500',
      PERAWAT_POLI: 'bg-cyan-500',
      FARMASI: 'bg-emerald-500',
      ADMINISTRASI: 'bg-gray-500',
      MANAJER: 'bg-amber-500',
      AHLI_GIZI: 'bg-green-500',
    };

    const distribution = staffDistribution.map(item => ({
      role: roleNames[item.role as keyof typeof roleNames] || item.role,
      count: item._count.role,
      color: roleColors[item.role as keyof typeof roleColors] || 'bg-gray-500',
    }));

    return NextResponse.json({
      totalStaff,
      dailyLogins,
      weeklyActivity,
      distribution,
      meta: {
        timestamp: now.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error.message },
      { status: 500 },
    );
  }
}
