// src/app/api/handled-patients/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

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
        const allowedRoles = ['PERAWAT_POLI', 'DOKTER_SPESIALIS', 'SUPER_ADMIN', 'PERAWAT_RUANGAN', 'AHLI_GIZI', 'FARMASI'];

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
                        allergies: true, 
                        vitalSigns: {
                            orderBy: { recordDate: 'desc' },
                            take: 5
                        },
                        medications: {
                            where: { isActive: true }
                        },
                        complaints: {
                            where: { status: 'BARU' },
                            orderBy: { date: 'desc' }
                        }
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

        // Check if user has permission to view this handled patient
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
        const allowedRoles = ['PERAWAT_POLI', 'DOKTER_SPESIALIS', 'SUPER_ADMIN', 'PERAWAT_RUANGAN', 'AHLI_GIZI', 'FARMASI'];

        if (!allowedRoles.includes(userRole)) {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        // Check if handled patient exists and user has permission
        const existingHandledPatient = await prisma.handledPatient.findUnique({
            where: { id: params.id }
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
            status,
            priority,
            nextVisitDate,
            estimatedDuration,
            specialInstructions
        } = body;

        const updatedHandledPatient = await prisma.handledPatient.update({
            where: { id: params.id },
            data: {
                diagnosis: diagnosis || existingHandledPatient.diagnosis,
                treatmentPlan: treatmentPlan || existingHandledPatient.treatmentPlan,
                notes: notes || existingHandledPatient.notes,
                status: status || existingHandledPatient.status,
                priority: priority || existingHandledPatient.priority,
                nextVisitDate: nextVisitDate ? new Date(nextVisitDate) : existingHandledPatient.nextVisitDate,
                estimatedDuration: estimatedDuration || existingHandledPatient.estimatedDuration,
                specialInstructions: specialInstructions || existingHandledPatient.specialInstructions,
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
                        riskLevel: true
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

        return NextResponse.json(updatedHandledPatient);
    } catch (error) {
        console.error('Error updating handled patient:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        }, { status: 500 });
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
        const allowedRoles = ['PERAWAT_POLI', 'DOKTER_SPESIALIS', 'SUPER_ADMIN', 'PERAWAT_RUANGAN', 'AHLI_GIZI', 'FARMASI'];

        if (!allowedRoles.includes(userRole)) {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        // Check if handled patient exists and user has permission
        const existingHandledPatient = await prisma.handledPatient.findUnique({
            where: { id: params.id }
        });

        if (!existingHandledPatient) {
            return NextResponse.json({ error: 'Handled patient not found' }, { status: 404 });
        }

        if (userRole !== 'SUPER_ADMIN' && existingHandledPatient.handledBy !== userId) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        await prisma.handledPatient.delete({
            where: { id: params.id }
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