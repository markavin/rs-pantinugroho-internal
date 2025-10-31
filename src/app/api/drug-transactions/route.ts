// src/app/api/drug-transactions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    console.log('GET drug-transactions - patientId:', patientId); // DEBUG

    const whereClause: any = {};
    if (patientId) {
      whereClause.patientId = patientId;
    }

    const transactions = await prisma.drugTransaction.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            mrNumber: true,
            phone: true
          }
        },
        items: {
          include: {
            drug: {
              select: {
                name: true,
                strength: true,
                dosageForm: true,
                category: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Found transactions:', transactions.length); // DEBUG

    const transformedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      patientId: transaction.patientId,
      patientName: transaction.patient.name,
      mrNumber: transaction.patient.mrNumber,
      items: transaction.items.map(item => ({
        id: item.id,
        drugId: item.drugId,
        drugName: item.drug.name,
        strength: item.drug.strength,
        dosageForm: item.drug.dosageForm,
        quantity: item.quantity
      })),
      status: transaction.status,
      createdAt: transaction.createdAt.toISOString(),
      completedAt: transaction.completedAt?.toISOString(),
      notes: transaction.notes,
      prescriptionSource: (transaction as any).prescriptionSource || 'MANUAL'
    }));

    return NextResponse.json(transformedTransactions);
  } catch (error) {
    console.error('Error fetching drug transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drug transactions' },
      { status: 500 }
    );
  }
}

// POST tetap sama seperti sebelumnya
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;
    const allowedRoles = ['FARMASI', 'SUPER_ADMIN'];

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const {
      patientId,
      items,
      notes,
      prescriptionSource,
      relatedHandledPatientId,
      relatedPrescriptionAlertId
    } = body;

    if (!patientId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: patientId, items' },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    for (const item of items) {
      if (!item.drugId || !item.quantity) {
        return NextResponse.json(
          { error: 'All items must have drugId and quantity' },
          { status: 400 }
        );
      }

      const drug = await prisma.drugData.findUnique({
        where: { id: item.drugId }
      });

      if (!drug) {
        return NextResponse.json(
          { error: `Drug with ID ${item.drugId} not found` },
          { status: 404 }
        );
      }

      if (drug.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${drug.name}. Available: ${drug.stock}, Required: ${item.quantity}` },
          { status: 400 }
        );
      }

      if (item.quantity <= 0) {
        return NextResponse.json(
          { error: `Quantity for ${drug.name} must be greater than 0` },
          { status: 400 }
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();

      const drugTransaction = await tx.drugTransaction.create({
        data: {
          patientId,
          status: 'COMPLETED',
          notes: notes?.trim() || null,
          createdAt: now,
          completedAt: now,
        }
      });

      const transactionItems = await Promise.all(
        items.map((item: any) =>
          tx.drugTransactionItem.create({
            data: {
              transactionId: drugTransaction.id,
              drugId: item.drugId,
              quantity: item.quantity,
            }
          })
        )
      );

      for (const item of items) {
        await tx.drugData.update({
          where: { id: item.drugId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      await tx.pharmacyRecord.create({
        data: {
          patientId,
          pharmacistId: userId,
          recordType: 'DISPENSING',
          medications: items.map((item: any) => ({
            drugId: item.drugId,
            drugName: item.drugName,
            quantity: item.quantity,
            dosageInstructions: `${item.quantity} unit - sesuai resep`
          })),
          counselingNotes: notes || 'Tidak ada catatan khusus',
        }
      });

      if (prescriptionSource === 'DOCTOR_PRESCRIPTION' && patient.status === 'RAWAT_INAP') {
        const medicationList = items
          .map((item: any) => `- ${item.drugName}: ${item.quantity} unit`)
          .join('\n');

        await tx.alert.create({
          data: {
            type: 'INFO',
            message: `Obat dari resep dokter untuk pasien ${patient.name} (${patient.mrNumber}) sudah tersedia dan siap diberikan.\n\nDaftar Obat:\n${medicationList}\n\nTotal: ${items.length} jenis obat, ${items.reduce((sum: number, item: any) => sum + item.quantity, 0)} unit\n\nHarap segera diambil dan diberikan kepada pasien sesuai instruksi dokter.`,
            patientId,
            category: 'MEDICATION',
            priority: 'MEDIUM',
            targetRole: 'PERAWAT_RUANGAN',
            isRead: false
          }
        });
      }

      if (relatedPrescriptionAlertId) {
        await tx.alert.update({
          where: { id: relatedPrescriptionAlertId },
          data: { isRead: true }
        });
      }

      return {
        ...drugTransaction,
        items: transactionItems
      };
    });

    const completeTransaction = await prisma.drugTransaction.findUnique({
      where: { id: result.id },
      include: {
        patient: {
          select: {
            name: true,
            mrNumber: true,
            phone: true
          }
        },
        items: {
          include: {
            drug: {
              select: {
                name: true,
                strength: true,
                dosageForm: true,
                category: true
              }
            }
          }
        }
      }
    });

    const response = {
      id: completeTransaction!.id,
      patientId: completeTransaction!.patientId,
      patientName: completeTransaction!.patient.name,
      mrNumber: completeTransaction!.patient.mrNumber,
      items: completeTransaction!.items.map(item => ({
        id: item.id,
        drugId: item.drugId,
        drugName: item.drug.name,
        quantity: item.quantity
      })),
      status: completeTransaction!.status,
      createdAt: completeTransaction!.createdAt.toISOString(),
      completedAt: completeTransaction!.completedAt?.toISOString(),
      notes: completeTransaction!.notes
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating drug transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create drug transaction' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}