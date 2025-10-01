// src/app/api/drug-transactions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET() {
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

    const transactions = await prisma.drugTransaction.findMany({
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

    // Transform the data to match frontend expectations
    const transformedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      patientId: transaction.patientId,
      patientName: transaction.patient.name,
      mrNumber: transaction.patient.mrNumber,
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

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      patientId,
      items,
      totalAmount,
      notes
    } = body;

    // Validate required fields
    if (!patientId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: patientId, items' },
        { status: 400 }
      );
    }

    // Validate totalAmount matches calculated total
    const calculatedTotal = items.reduce((sum: number, item: any) => sum + item.subtotal, 0);
    if (Math.abs(totalAmount - calculatedTotal) > 0.01) {
      return NextResponse.json(
        { error: 'Total amount does not match sum of item subtotals' },
        { status: 400 }
      );
    }

    // Validate patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Validate all drugs exist and have sufficient stock
    for (const item of items) {
      if (!item.drugId || !item.quantity || !item.price) {
        return NextResponse.json(
          { error: 'All items must have drugId, quantity, and price' },
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

      // Validate price is reasonable (should be > 0)
      if (item.price <= 0) {
        return NextResponse.json(
          { error: `Price for ${drug.name} must be greater than 0` },
          { status: 400 }
        );
      }

      // Validate subtotal calculation
      const expectedSubtotal = item.quantity * item.price;
      if (Math.abs(item.subtotal - expectedSubtotal) > 0.01) {
        return NextResponse.json(
          { error: `Subtotal calculation error for ${drug.name}` },
          { status: 400 }
        );
      }
    }

    // Create transaction with items and REDUCE STOCK IMMEDIATELY
    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();
      
      // Create the drug transaction with COMPLETED status and reduce stock
      const drugTransaction = await tx.drugTransaction.create({
        data: {
          patientId,
          totalAmount,
          status: 'COMPLETED', // Langsung COMPLETED
          notes: notes?.trim() || null,
          createdAt: now,
          completedAt: now, // Set completedAt juga
        }
      });

      // Create transaction items
      const transactionItems = await Promise.all(
        items.map((item: any) => 
          tx.drugTransactionItem.create({
            data: {
              transactionId: drugTransaction.id,
              drugId: item.drugId,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.subtotal
            }
          })
        )
      );

      // REDUCE STOCK for all items
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

      return {
        ...drugTransaction,
        items: transactionItems
      };
    });

    // Fetch the complete transaction with relations for response
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

    // Transform response
    const response = {
      id: completeTransaction!.id,
      patientId: completeTransaction!.patientId,
      patientName: completeTransaction!.patient.name,
      mrNumber: completeTransaction!.patient.mrNumber,
      items: completeTransaction!.items.map(item => ({
        id: item.id,
        drugId: item.drugId,
        drugName: item.drug.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal
      })),
      totalAmount: completeTransaction!.totalAmount,
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
  }
}