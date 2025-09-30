// src/app/api/patient-records/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const allowedRoles = ['PERAWAT_POLI', 'DOKTER_SPESIALIS', 'SUPER_ADMIN', 'ADMINISTRASI'];

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { metadata, content, title } = body;

    const existingRecord = await prisma.patientRecord.findUnique({
      where: { id: params.id }
    });

    if (!existingRecord) {
      return NextResponse.json({ error: 'Patient record not found' }, { status: 404 });
    }

    const updatedRecord = await prisma.patientRecord.update({
      where: { id: params.id },
      data: {
        metadata: metadata || existingRecord.metadata,
        content: content || existingRecord.content,
        title: title || existingRecord.title,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error('Error updating patient record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}