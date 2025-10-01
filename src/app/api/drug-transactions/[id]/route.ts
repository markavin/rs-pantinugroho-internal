// src/app/api/drug-transactions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET - Get transaction detail
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const allowedRoles = ['FARMASI', 'SUPER_ADMIN', 'MANAJER'];

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const transaction = await prisma.drugTransaction.findUnique({
      where: { id: params.id },
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
                id: true,
                name: true,
                strength: true,
                dosageForm: true,
                category: true,
                manufacturer: true,
                stock: true
              }
            }
          }
        }
      }
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const response = {
      id: transaction.id,
      patientId: transaction.patientId,
      patientName: transaction.patient.name,
      mrNumber: transaction.patient.mrNumber,
      patientPhone: transaction.patient.phone,
      items: transaction.items.map(item => ({
        id: item.id,
        drugId: item.drugId,
        drugName: item.drug.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal
      })),
      totalAmount: transaction.totalAmount,
      status: transaction.status,
      createdAt: transaction.createdAt.toISOString(),
      completedAt: transaction.completedAt?.toISOString(),
      notes: transaction.notes
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching transaction detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction detail' },
      { status: 500 }
    );
  }
}

// PUT - Edit transaction
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

    const existingTransaction = await prisma.drugTransaction.findUnique({
      where: { id: params.id },
      include: {
        items: true
      }
    });

    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (existingTransaction.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Cannot edit cancelled transaction' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { items, totalAmount, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      );
    }

    const calculatedTotal = items.reduce((sum: number, item: any) => sum + item.subtotal, 0);
    if (Math.abs(totalAmount - calculatedTotal) > 0.01) {
      return NextResponse.json(
        { error: 'Total amount does not match sum of item subtotals' },
        { status: 400 }
      );
    }

    // Validate drugs and check stock availability
    for (const item of items) {
      const drug = await prisma.drugData.findUnique({
        where: { id: item.drugId }
      });

      if (!drug) {
        return NextResponse.json(
          { error: `Drug with ID ${item.drugId} not found` },
          { status: 404 }
        );
      }

      // Calculate stock difference for this drug
      const oldItem = existingTransaction.items.find(i => i.drugId === item.drugId);
      const oldQuantity = oldItem?.quantity || 0;
      const stockDiff = item.quantity - oldQuantity;

      // If we need more stock than before, check availability
      if (stockDiff > 0 && drug.stock < stockDiff) {
        return NextResponse.json(
          { error: `Insufficient stock for ${drug.name}. Available: ${drug.stock}, Required additional: ${stockDiff}` },
          { status: 400 }
        );
      }
    }

    // Update transaction with stock adjustment
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Return stock from old items
      for (const oldItem of existingTransaction.items) {
        await tx.drugData.update({
          where: { id: oldItem.drugId },
          data: {
            stock: {
              increment: oldItem.quantity
            }
          }
        });
      }

      // Step 2: Delete old items
      await tx.drugTransactionItem.deleteMany({
        where: { transactionId: params.id }
      });

      // Step 3: Create new items
      await Promise.all(
        items.map((item: any) =>
          tx.drugTransactionItem.create({
            data: {
              transactionId: params.id,
              drugId: item.drugId,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.subtotal
            }
          })
        )
      );

      // Step 4: Deduct stock for new items
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

      // Step 5: Update transaction
      const updatedTransaction = await tx.drugTransaction.update({
        where: { id: params.id },
        data: {
          totalAmount,
          notes: notes?.trim() || null
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

      return updatedTransaction;
    });

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
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}