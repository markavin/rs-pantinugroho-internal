// src/app/api/drugs/route.ts
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
    const allowedRoles = ['FARMASI', 'SUPER_ADMIN', 'MANAJER', 'DOKTER_SPESIALIS'];

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const drugs = await prisma.drugData.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    // Transform to include price field for compatibility
    const transformedDrugs = drugs.map(drug => ({
      id: drug.id,
      name: drug.name,
      category: drug.category,
      categoryKehamilan: drug.categoryKehamilan,
      dosageForm: drug.dosageForm,
      strength: drug.strength,
      manufacturer: drug.manufacturer,
      stock: drug.stock,
      price: drug.price || 5000, // Default price if not set
      expiryDate: drug.expiryDate.toISOString(),
      interactions: drug.interactions,
      contraindications: drug.contraindications,
      sideEffects: drug.sideEffects,
      indications: drug.indications
    }));

    return NextResponse.json(transformedDrugs);
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
    
    // Validate required fields
    const requiredFields = ['name', 'category', 'dosageForm', 'strength', 'manufacturer', 'stock', 'expiryDate'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate price if provided
    if (body.price && (isNaN(body.price) || body.price <= 0)) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    // Validate stock
    if (isNaN(body.stock) || body.stock < 0) {
      return NextResponse.json(
        { error: 'Stock must be a non-negative number' },
        { status: 400 }
      );
    }

    // Validate expiry date
    const expiryDate = new Date(body.expiryDate);
    if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
      return NextResponse.json(
        { error: 'Expiry date must be a valid future date' },
        { status: 400 }
      );
    }

    const drug = await prisma.drugData.create({
      data: {
        name: body.name.trim(),
        category: body.category,
        categoryKehamilan: body.categoryKehamilan,
        dosageForm: body.dosageForm,
        strength: body.strength.trim(),
        manufacturer: body.manufacturer.trim(),
        stock: parseInt(body.stock),
        price: body.price ? parseInt(body.price) : 5000, // Default price
        expiryDate: expiryDate,
        interactions: Array.isArray(body.interactions) ? body.interactions : [],
        contraindications: Array.isArray(body.contraindications) ? body.contraindications : [],
        sideEffects: Array.isArray(body.sideEffects) ? body.sideEffects : [],
        indications: Array.isArray(body.indications) ? body.indications : []
      }
    });

    // Transform response
    const response = {
      id: drug.id,
      name: drug.name,
      category: drug.category,
      categoryKehamilan: drug.categoryKehamilan,
      dosageForm: drug.dosageForm,
      strength: drug.strength,
      manufacturer: drug.manufacturer,
      stock: drug.stock,
      price: drug.price,
      expiryDate: drug.expiryDate.toISOString(),
      interactions: drug.interactions,
      contraindications: drug.contraindications,
      sideEffects: drug.sideEffects,
      indications: drug.indications
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating drug:', error);

    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'Drug with this name already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create drug' },
      { status: 500 }
    );
  }
}

// src/app/api/drugs/[id]/route.ts - This should be in a separate file
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

    const body = await request.json();

    // Check if drug exists
    const existingDrug = await prisma.drugData.findUnique({
      where: { id: params.id }
    });

    if (!existingDrug) {
      return NextResponse.json({ error: 'Drug not found' }, { status: 404 });
    }

    // Validate required fields
    const requiredFields = ['name', 'category', 'dosageForm', 'strength', 'manufacturer', 'stock', 'expiryDate'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate price if provided
    if (body.price && (isNaN(body.price) || body.price <= 0)) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    // Validate stock
    if (isNaN(body.stock) || body.stock < 0) {
      return NextResponse.json(
        { error: 'Stock must be a non-negative number' },
        { status: 400 }
      );
    }

    // Validate expiry date
    const expiryDate = new Date(body.expiryDate);
    if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
      return NextResponse.json(
        { error: 'Expiry date must be a valid future date' },
        { status: 400 }
      );
    }

    const updatedDrug = await prisma.drugData.update({
      where: { id: params.id },
      data: {
        name: body.name.trim(),
        category: body.category,
        categoryKehamilan: body.categoryKehamilan,
        dosageForm: body.dosageForm,
        strength: body.strength.trim(),
        manufacturer: body.manufacturer.trim(),
        stock: parseInt(body.stock),
        price: body.price ? parseInt(body.price) : existingDrug.price || 5000,
        expiryDate: expiryDate,
        interactions: Array.isArray(body.interactions) ? body.interactions : [],
        contraindications: Array.isArray(body.contraindications) ? body.contraindications : [],
        sideEffects: Array.isArray(body.sideEffects) ? body.sideEffects : [],
        indications: Array.isArray(body.indications) ? body.indications : []
      }
    });

    // Transform response
    const response = {
      id: updatedDrug.id,
      name: updatedDrug.name,
      category: updatedDrug.category,
      categoryKehamilan: updatedDrug.categoryKehamilan,
      dosageForm: updatedDrug.dosageForm,
      strength: updatedDrug.strength,
      manufacturer: updatedDrug.manufacturer,
      stock: updatedDrug.stock,
      price: updatedDrug.price,
      expiryDate: updatedDrug.expiryDate.toISOString(),
      interactions: updatedDrug.interactions,
      contraindications: updatedDrug.contraindications,
      sideEffects: updatedDrug.sideEffects,
      indications: updatedDrug.indications
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating drug:', error);

    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'Drug with this name already exists' },
        { status: 400 }
      );
    }

    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Drug not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to update drug' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Check if drug exists
    const existingDrug = await prisma.drugData.findUnique({
      where: { id: params.id },
      include: {
        transactionItems: true
      }
    });

    if (!existingDrug) {
      return NextResponse.json({ error: 'Drug not found' }, { status: 404 });
    }

    // Check if drug has transaction history
    if (existingDrug.transactionItems.length > 0) {
      return NextResponse.json({
        error: 'Cannot delete drug with existing transaction history. Consider deactivating instead.'
      }, { status: 400 });
    }

    await prisma.drugData.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Drug deleted successfully' });
  } catch (error) {
    console.error('Error deleting drug:', error);

    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Drug not found' }, { status: 404 });
    }

    if ((error as any).code === 'P2003') {
      return NextResponse.json({
        error: 'Cannot delete drug due to existing related data. Consider deactivating instead.'
      }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to delete drug' },
      { status: 500 }
    );
  }
}