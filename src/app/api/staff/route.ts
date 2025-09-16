// src/app/api/staff/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET - Fetch all staff
export async function GET() {
  try {
    console.log('🔍 Fetching staff...');
    
    // First, let's check the session for debugging
    const session = await getServerSession(authOptions);
    console.log('🔐 Session:', session?.user?.role);
    
    // Temporarily remove authentication check for debugging
    // if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
    //   console.log('❌ Unauthorized - Role:', (session?.user as any)?.role);
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Check total user count first
    const totalUsers = await prisma.user.count();
    console.log('👥 Total users in database:', totalUsers);

    // Check active users count
    const activeUsers = await prisma.user.count({
      where: { isActive: true }
    });
    console.log('✅ Active users in database:', activeUsers);

    // Get all users for debugging
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        employeeId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('📊 All users:', allUsers.map(u => ({
      name: u.name,
      role: u.role,
      isActive: u.isActive,
      employeeId: u.employeeId
    })));

    // Filter out non-staff roles
    const staff = allUsers.filter(user => 
      user.role !== 'PATIENT' && 
      user.isActive === true
    );

    console.log('👨‍💼 Filtered staff:', staff.length);

    return NextResponse.json(staff);
  } catch (error) {
    console.error('❌ Error fetching staff:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch staff',
      details: error.message
    }, { status: 500 });
  }
}

// POST - Create new staff (keep existing code but add debugging)
export async function POST(request: NextRequest) {
  try {
    console.log('📝 Creating new staff...');
    
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      console.log('❌ Unauthorized for staff creation');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('📋 Request body:', { ...body, password: '***' });

    const { name, email, username, password, role, employeeId } = body;

    // Validate required fields - more explicit check
    const missingFields = [];
    if (!name || name.trim() === '') missingFields.push('name');
    if (!email || email.trim() === '') missingFields.push('email');
    if (!username || username.trim() === '') missingFields.push('username');
    if (!password || password.trim() === '') missingFields.push('password');
    if (!role || role.trim() === '') missingFields.push('role');

    if (missingFields.length > 0) {
      console.log('❌ Missing fields:', missingFields);
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    // Check if username, email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username.trim() },
          { email: email.trim() }
        ]
      }
    });

    if (existingUser) {
      console.log('❌ User already exists:', existingUser.username);
      return NextResponse.json({ 
        error: 'Username atau email sudah digunakan' 
      }, { status: 400 });
    }

    // Generate sequential Employee ID based on role
    const prefixes: { [key: string]: string } = {
      'DOKTER_SPESIALIS': 'DOK',
      'PERAWAT_RUANGAN': 'NUR',
      'PERAWAT_POLI': 'NUP',
      'FARMASI': 'PHA',
      'ADMINISTRASI': 'AS',
      'MANAJER': 'MN',
      'AHLI_GIZI': 'NUT'
    };

    const prefix = prefixes[role] || 'EMP';
    
    // Count existing users with the same role to get next number
    const existingCount = await prisma.user.count({
      where: { 
        role: role,
        isActive: true 
      }
    });
    
    const nextNumber = (existingCount + 1).toString().padStart(3, '0');
    const generatedEmployeeId = `${prefix}${nextNumber}`;

    console.log('🏷️ Generated Employee ID:', generatedEmployeeId);

  

    // Hash password
    const hashedPassword = await bcrypt.hash(password.trim(), 12);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        username: username.trim(),
        password: hashedPassword,
        role,
        employeeId: generatedEmployeeId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        employeeId: true,
        createdAt: true,
      }
    });

    console.log('✅ Created staff:', newUser.name, '-', newUser.role);

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating staff:', error);
    return NextResponse.json({ 
      error: 'Failed to create staff',
      details: error.message
    }, { status: 500 });
  }
}