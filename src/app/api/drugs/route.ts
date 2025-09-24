// src/app/api/drugs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const drugs = await prisma.drugData.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(drugs);
  } catch (error) {
    console.error('Error fetching drugs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drugs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const drug = await prisma.drugData.create({
      data: {
        name: body.name,
        category: body.category,
        dosageForm: body.dosageForm,
        strength: body.strength,
        manufacturer: body.manufacturer,
        stock: parseInt(body.stock),
        expiryDate: new Date(body.expiryDate),
        interactions: body.interactions || [],
        contraindications: body.contraindications || [],
        sideEffects: body.sideEffects || [],
        indications: body.indications || []
      }
    });

    return NextResponse.json(drug);
  } catch (error) {
    console.error('Error creating drug:', error);
    return NextResponse.json(
      { error: 'Failed to create drug' },
      { status: 500 }
    );
  }
}