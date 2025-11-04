// src/app/api/handled-patients/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

function mapHandledStatusToPatientStatus(handledStatus: string, notes?: string): string {
    switch (handledStatus) {
        case 'ANTRIAN':
        case 'SEDANG_DITANGANI':
            return 'AKTIF';
        case 'KONSULTASI':
        case 'STABIL':
            return 'RAWAT_JALAN';
        case 'OBSERVASI':
        case 'EMERGENCY':
            return 'RAWAT_INAP';
        case 'RUJUK_KELUAR':
            return 'RUJUK_KELUAR';
        case 'SELESAI':
            if (notes && notes.toLowerCase().includes('pulang paksa')) {
                return 'PULANG_PAKSA';
            }
            return 'PULANG';
        case 'MENINGGAL':
            return 'MENINGGAL';
        default:
            return 'AKTIF';
    }
}
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;
    const allowedRoles = ['PERAWAT_POLI', 'DOKTER_SPESIALIS', 'SUPER_ADMIN', 'PERAWAT_RUANGAN', 'ADMINISTRASI', 'FARMASI', 'MANAJER', 'AHLI_GIZI'];

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const handledPatient = await prisma.handledPatient.findUnique({
      where: { id: params.id },
      include: {
        patient: {
          select: {
            id: true,
            mrNumber: true,
            name: true,
            birthDate: true,
            gender: true,
            phone: true,
            diabetesType: true,
            insuranceType: true,
            riskLevel: true,
            status: true,
            allergies: true
          }
        },
        handler: {
          select: {
            name: true,
            role: true,
            employeeId: true
          }
        }
      }
    });

    if (!handledPatient) {
      return NextResponse.json({ error: 'Handled patient not found' }, { status: 404 });
    }

    if (userRole !== 'SUPER_ADMIN' && handledPatient.handledBy !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(handledPatient);
  } catch (error) {
    console.error('Error fetching handled patient:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
    const userId = (session.user as any).id;
    const allowedRoles = ['PERAWAT_POLI', 'DOKTER_SPESIALIS', 'SUPER_ADMIN', 'PERAWAT_RUANGAN', 'ADMINISTRASI', 'FARMASI', 'MANAJER', 'AHLI_GIZI'];

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const existingHandledPatient = await prisma.handledPatient.findUnique({
      where: { id: params.id },
      include: {
        patient: true
      }
    });

    if (!existingHandledPatient) {
      return NextResponse.json({ error: 'Handled patient not found' }, { status: 404 });
    }

    if (userRole !== 'SUPER_ADMIN' && existingHandledPatient.handledBy !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const {
      diagnosis,
      treatmentPlan,
      notes,
      priority,
      nextVisitDate,
      estimatedDuration,
      specialInstructions,
      status
    } = body;

    const lastHandledPatient = await prisma.handledPatient.findFirst({
      where: {
        patientId: existingHandledPatient.patientId,
        id: { not: params.id }
      },
      orderBy: { handledDate: 'desc' }
    });

    let finalStatus = status;
    if (status === undefined) {
      if (lastHandledPatient) {
        finalStatus = lastHandledPatient.status;
        console.log(`Restoring previous handled status for edit: ${finalStatus}`);
      } else {
        finalStatus = existingHandledPatient.status;
      }
    }

    const finalNotes = notes !== undefined ? notes : existingHandledPatient.notes;

    try {
      const result = await prisma.$transaction(async (tx) => {
        const updatedHandledPatient = await tx.handledPatient.update({
          where: { id: params.id },
          data: {
            diagnosis: diagnosis !== undefined ? diagnosis : existingHandledPatient.diagnosis,
            treatmentPlan: treatmentPlan !== undefined ? treatmentPlan : existingHandledPatient.treatmentPlan,
            notes: finalNotes,
            status: finalStatus as any,
            priority: priority !== undefined ? (priority as any) : existingHandledPatient.priority,
            estimatedDuration: estimatedDuration !== undefined ? estimatedDuration : existingHandledPatient.estimatedDuration,
            specialInstructions: specialInstructions !== undefined ? specialInstructions : existingHandledPatient.specialInstructions,
            nextVisitDate: nextVisitDate !== undefined ? (nextVisitDate ? new Date(nextVisitDate) : null) : existingHandledPatient.nextVisitDate,
          },
          include: {
            patient: {
              select: {
                id: true,
                mrNumber: true,
                name: true,
                birthDate: true,
                gender: true,
                diabetesType: true,
                insuranceType: true,
                riskLevel: true,
                status: true
              }
            },
            handler: {
              select: {
                name: true,
                role: true
              }
            }
          }
        });

        const newPatientStatus = mapHandledStatusToPatientStatus(finalStatus, finalNotes);

        await tx.patient.update({
          where: { id: existingHandledPatient.patientId },
          data: {
            status: newPatientStatus as any,
            lastVisit: new Date()
          }
        });

        console.log(`Patient global status updated to: ${newPatientStatus} (from edit mode)`);

        return updatedHandledPatient;
      });

      return NextResponse.json(result);
    } catch (error) {
      console.error('Error updating handled patient:', error);
      return NextResponse.json({
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating handled patient:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;
    const allowedRoles = ['PERAWAT_POLI', 'DOKTER_SPESIALIS', 'SUPER_ADMIN', 'PERAWAT_RUANGAN', 'ADMINISTRASI', 'FARMASI', 'MANAJER', 'AHLI_GIZI'];

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const existingHandledPatient = await prisma.handledPatient.findUnique({
      where: { id: params.id },
      include: {
        patient: true
      }
    });

    if (!existingHandledPatient) {
      return NextResponse.json({ error: 'Handled patient not found' }, { status: 404 });
    }

    if (userRole !== 'SUPER_ADMIN' && existingHandledPatient.handledBy !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.handledPatient.delete({
        where: { id: params.id }
      });

      await tx.patient.update({
        where: { id: existingHandledPatient.patientId },
        data: {
          status: 'AKTIF' as any
        }
      });
    });

    return NextResponse.json({ message: 'Handled patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting handled patient:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}