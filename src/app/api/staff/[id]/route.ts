// src/app/api/staff/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET - Fetch single staff
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const staff = await prisma.user.findUnique({
      where: {
        id: params.id,
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
      }
    });

    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    return NextResponse.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

// PUT - Update staff
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, username, password, role, employeeId, department } = body;

    // Check if staff exists
    const existingStaff = await prisma.user.findUnique({
      where: {
        id: params.id,
        isActive: true
      }
    });

    if (!existingStaff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    // Check for duplicate username/email/employeeId (excluding current user)
    const duplicateUser = await prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: params.id } },
          {
            OR: [
              { username: username },
              { email: email },
              { employeeId: employeeId }
            ]
          }
        ]
      }
    });

    if (duplicateUser) {
      return NextResponse.json({
        error: 'Username, email, or employee ID already exists'
      }, { status: 400 });
    }

    // Auto-generate department based on role if not provided
    const departmentMapping: { [key: string]: string } = {
      'DOKTER_SPESIALIS': 'Penyakit Dalam',
      'PERAWAT_RUANGAN': 'Keperawatan Ruangan',
      'PERAWAT_POLI': 'Poliklinik',
      'FARMASI': 'Farmasi',
      'ADMINISTRASI': 'Administrasi',
      'MANAJER': 'Manajer',
      'AHLI_GIZI': 'Gizi'
    };

    const finalDepartment = department || departmentMapping[role] || 'Umum';

    // Prepare update data
    const updateData: any = {
      name,
      email,
      username,
      role,
      employeeId,
      department: finalDepartment
    };

    // Only hash and update password if provided
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        employeeId: true,
        department: true,
        updatedAt: true,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating staff:', error);
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
  }
}

// DELETE - Hard delete staff from database
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if staff exists first
    const existingStaff = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!existingStaff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    // Check if staff has related records that might cause issues
    // You might want to add checks for related records here
    // For example, check if this user has created patients, medications, etc.

    try {
      // Hard delete the user from database
      await prisma.user.delete({
        where: { id: params.id }
      });

      return NextResponse.json({
        message: 'Staff deleted permanently from database',
        deletedStaff: {
          id: existingStaff.id,
          name: existingStaff.name,
          employeeId: existingStaff.employeeId
        }
      });
    } catch (deleteError: any) {
      // If foreign key constraint error, provide meaningful message
      if (deleteError.code === 'P2003') {
        return NextResponse.json({
          error: 'Cannot delete staff because they have associated records (patients, medications, etc.). Please remove related records first or contact system administrator.'
        }, { status: 400 });
      }

      // Re-throw other errors
      throw deleteError;
    }

  } catch (error) {
    console.error('Error deleting staff:', error);
    return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 });
  }
}