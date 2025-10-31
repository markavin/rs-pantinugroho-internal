// src/app/api/patients/route.ts
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

    const userRole = (session.user as any).role;
    const allowedRoles = ['PERAWAT_POLI', 'DOKTER_SPESIALIS', 'SUPER_ADMIN', 'PERAWAT_RUANGAN', 'ADMINISTRASI', 'FARMASI', 'MANAJER', 'AHLI_GIZI'];

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const whereClause: any = {};

    if (activeOnly) {
      whereClause.status = {
        in: ['AKTIF', 'RAWAT_JALAN', 'RAWAT_INAP']
      };
    }

    const patients = await prisma.patient.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'ADMINISTRASI' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions. Only Administration can register patients.' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      birthDate,
      gender,
      phone,
      address,
      height,
      weight,
      diabetesType,
      insuranceType,
      smokingStatus,
      allergies,
      medicalHistory,
      status,
      complaint,
      complaintSeverity
    } = body;

    if (!name || !birthDate || !gender || !insuranceType) {
      return NextResponse.json(
        { error: 'Missing required fields: name, birthDate, gender, insuranceType' },
        { status: 400 }
      );
    }

    const lastPatient = await prisma.patient.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { mrNumber: true }
    });

    let nextNumber = 1001;
    if (lastPatient?.mrNumber) {
      const lastNumber = parseInt(lastPatient.mrNumber.replace('RM', ''));
      nextNumber = lastNumber + 1;
    }
    const mrNumber = `RM${nextNumber.toString().padStart(4, '0')}`;

    let bmi = null;
    if (height && weight) {
      const heightInMeters = parseFloat(height) / 100;
      bmi = parseFloat(weight) / (heightInMeters * heightInMeters);
      bmi = Math.round(bmi * 100) / 100;
    }

    const patient = await prisma.patient.create({
      data: {
        mrNumber,
        name,
        birthDate: new Date(birthDate),
        gender,
        phone: phone || null,
        address: address || null,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        bmi: bmi,
        diabetesType: diabetesType || null,
        insuranceType,
        smokingStatus: smokingStatus || 'TIDAK_MEROKOK',
        allergies: allergies && Array.isArray(allergies) && allergies.length > 0 ? allergies : [],
        medicalHistory: medicalHistory || null,
        comorbidities: [],
        status: status || 'AKTIF',
        createdBy: (session.user as any).id,
      }
    });

    await prisma.alert.create({
      data: {
        type: 'INFO',
        category: 'SYSTEM',
        message: `Pasien baru ${patient.name} (${patient.mrNumber}) terdaftar. Segera lakukan pemeriksaan awal.
        Detail:
        - Diabetes Type: ${patient.diabetesType || 'Belum diketahui'}
        - Penjamin: ${patient.insuranceType}
        - Alergi: ${patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(', ') : 'Tidak ada'}`,
        patientId: patient.id,
        priority: 'MEDIUM',
        isRead: false
      }
    });

    if (complaint && complaint.trim()) {
      await prisma.patientRecord.create({
        data: {
          patientId: patient.id,
          recordType: 'COMPLAINTS',
          title: 'Keluhan Pasien',
          content: complaint.trim(),
          metadata: {
            severity: complaintSeverity || 'RINGAN',
            status: 'BARU',
            notes: ''
          }
        }
      });
    }

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);

    if ((error as any).code === 'P2002') {
      return NextResponse.json({ error: 'Patient with this MR Number already exists' }, { status: 400 });
    }

    if ((error as any).code === 'P2003') {
      return NextResponse.json({ error: 'Invalid reference data provided' }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}