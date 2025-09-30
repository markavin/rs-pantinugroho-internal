// src/app/api/drug-transactions/[id]/complete/route.ts
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
        items: {
          include: {
            drug: {
              select: {
                name: true,
                stock: true
              }
            }
          }
        },
        patient: {
          select: {
            name: true,
            mrNumber: true
          }
        }
      }
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only PENDING transactions can be completed' },
        { status: 400 }
      );
    }

    // Check stock availability before completing
    for (const item of transaction.items) {
      if (item.drug.stock < item.quantity) {
        return NextResponse.json(
          { 
            error: `Insufficient stock for ${item.drug.name}. Available: ${item.drug.stock}, Required: ${item.quantity}` 
          },
          { status: 400 }
        );
      }
    }

    // Complete transaction and reduce stock
    const result = await prisma.$transaction(async (tx) => {
      // Update transaction status and set completion time
      const updatedTransaction = await tx.drugTransaction.update({
        where: { id: params.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        },
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

      // Reduce drug stock for each item
      for (const item of transaction.items) {
        await tx.drugData.update({
          where: { id: item.drugId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      return updatedTransaction;
    });

    // Transform response
    const response = {
      id: result.id,
      patientId: result.patientId,
      patientName: result.patient.name,
      mrNumber: result.patient.mrNumber,
      items: result.items.map(item => ({
        id: item.id,
        drugId: item.drugId,
        drugName: item.drug.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal
      })),
      totalAmount: result.totalAmount,
      status: result.status,
      createdAt: result.createdAt.toISOString(),
      completedAt: result.completedAt?.toISOString(),
      notes: result.notes
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error completing drug transaction:', error);
    return NextResponse.json(
      { error: 'Failed to complete drug transaction' },
      { status: 500 }
    );
  }
}