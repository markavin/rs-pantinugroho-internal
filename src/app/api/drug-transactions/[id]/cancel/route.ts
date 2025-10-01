// src/app/api/drug-transactions/[id]/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const allowedRoles = ['FARMASI', 'SUPER_ADMIN'];

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Find the transaction
    const transaction = await prisma.drugTransaction.findUnique({
      where: { id: params.id },
      include: {
        patient: {
          select: {
            name: true,
            mrNumber: true
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

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Transaction is already cancelled' },
        { status: 400 }
      );
    }

    // FIX: Allow cancellation of COMPLETED transactions and restore stock
    if (transaction.status === 'COMPLETED') {
      // Restore stock for all items in the transaction
      await prisma.$transaction(async (tx) => {
        for (const item of transaction.items) {
          await tx.drugData.update({
            where: { id: item.drugId },
            data: {
              stock: {
                increment: item.quantity
              }
            }
          });
        }

        // Update transaction status to CANCELLED
        await tx.drugTransaction.update({
          where: { id: params.id },
          data: {
            status: 'CANCELLED'
          }
        });
      });
    } else {
      // For PENDING transactions, just update status (no stock to restore)
      await prisma.drugTransaction.update({
        where: { id: params.id },
        data: {
          status: 'CANCELLED'
        }
      });
    }

    // Fetch updated transaction
    const updatedTransaction = await prisma.drugTransaction.findUnique({
      where: { id: params.id },
      include: {
        patient: {
          select: {
            name: true,
            mrNumber: true
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

    // Transform response
    const response = {
      id: updatedTransaction!.id,
      patientId: updatedTransaction!.patientId,
      patientName: updatedTransaction!.patient.name,
      mrNumber: updatedTransaction!.patient.mrNumber,
      items: updatedTransaction!.items.map(item => ({
        id: item.id,
        drugId: item.drugId,
        drugName: item.drug.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal
      })),
      totalAmount: updatedTransaction!.totalAmount,
      status: updatedTransaction!.status,
      createdAt: updatedTransaction!.createdAt.toISOString(),
      completedAt: updatedTransaction!.completedAt?.toISOString(),
      notes: updatedTransaction!.notes
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error cancelling drug transaction:', error);
    return NextResponse.json(
      { error: 'Failed to cancel drug transaction' },
      { status: 500 }
    );
  }
}