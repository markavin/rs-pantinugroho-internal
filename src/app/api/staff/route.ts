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
    const staff = await prisma.user.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        employeeId: true,
        department: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

// POST - Create new staff
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, username, password, role, employeeId } = body;

    // Validate required fields - more explicit check
    const missingFields = [];
    if (!name || name.trim() === '') missingFields.push('name');
    if (!email || email.trim() === '') missingFields.push('email');
    if (!username || username.trim() === '') missingFields.push('username');
    if (!password || password.trim() === '') missingFields.push('password');
    if (!role || role.trim() === '') missingFields.push('role');

    if (missingFields.length > 0) {
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

    // Auto-generate department based on role
    const departmentMapping: { [key: string]: string } = {
      'DOKTER_SPESIALIS': 'Penyakit Dalam',
      'PERAWAT_RUANGAN': 'Keperawatan Ruangan',
      'PERAWAT_POLI': 'Poliklinik',
      'FARMASI': 'Farmasi',
      'AHLI_GIZI': 'Gizi'
    };

    const department = departmentMapping[role] || 'Umum';

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
        department,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        employeeId: true,
        department: true,
        createdAt: true,
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 });
  }
}