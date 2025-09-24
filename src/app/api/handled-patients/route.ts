// src/app/api/handled-patients/route.ts
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
            return 'RAWAT_JALAN';
        case 'OBSERVASI':
        case 'EMERGENCY':
        case 'STABIL':
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

export async function GET(request: Request) {
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

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const handledBy = searchParams.get('handledBy');

        let whereClause: any = {};

        if (userRole !== 'SUPER_ADMIN') {
            whereClause.handledBy = userId;
        }

        if (status) {
            whereClause.status = status;
        }

        if (handledBy && userRole === 'SUPER_ADMIN') {
            whereClause.handledBy = handledBy;
        }

        // TAMBAHKAN KODE INI
        console.log('User ID from Session:', userId);
        console.log('Prisma WHERE Clause:', whereClause);
        // HINGGA SINI

        const handledPatients = await prisma.handledPatient.findMany({
            where: whereClause,
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
                        bmi: true,
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
            },
            orderBy: {
                handledDate: 'desc'
            }
        });

        return NextResponse.json(handledPatients);
    } catch (error) {
        console.error('Error fetching handled patients:', error);
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
        const userId = (session.user as any).id;
        const allowedRoles = ['PERAWAT_POLI', 'DOKTER_SPESIALIS', 'SUPER_ADMIN', 'PERAWAT_RUANGAN', 'AHLI_GIZI', 'FARMASI'];

        if (!allowedRoles.includes(userRole)) {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        const body = await request.json();
        const {
            patientId,
            diagnosis,
            treatmentPlan,
            notes,
            priority = 'NORMAL',
            nextVisitDate,
            estimatedDuration,
            specialInstructions,
            status = 'SEDANG_DITANGANI'
        } = body;

        if (!patientId) {
            return NextResponse.json(
                { error: 'Missing required field: patientId' },
                { status: 400 }
            );
        }

        const patient = await prisma.patient.findUnique({
            where: { id: patientId }
        });

        if (!patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
        }

        if (patient.status !== 'AKTIF') {
            return NextResponse.json({
                error: 'Only patients with AKTIF status can be added to handled patients'
            }, { status: 400 });
        }

        const existingHandled = await prisma.handledPatient.findFirst({
            where: {
                patientId,
                status: {
                    notIn: ['SELESAI', 'RUJUK_KELUAR', 'MENINGGAL']
                }
            }
        });

        if (existingHandled) {
            return NextResponse.json({
                error: 'Patient is already being handled'
            }, { status: 400 });
        }

        try {
            const result = await prisma.$transaction(async (tx) => {
                const newPatientStatus = mapHandledStatusToPatientStatus(status, notes);

                await tx.patient.update({
                    where: { id: patientId },
                    data: {
                        status: newPatientStatus as any
                    }
                });

                const handledPatient = await tx.handledPatient.create({
                    data: {
                        patientId,
                        handledBy: userId,
                        diagnosis: diagnosis || null,
                        treatmentPlan: treatmentPlan || null,
                        notes: notes || null,
                        status: status as any,
                        priority: priority as any,
                        nextVisitDate: nextVisitDate ? new Date(nextVisitDate) : null,
                        estimatedDuration: estimatedDuration || null,
                        specialInstructions: specialInstructions || null,
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

                return handledPatient;
            });

            return NextResponse.json(result, { status: 201 });
        } catch (error) {
            console.error('Transaction error:', error);
            return NextResponse.json({
                error: 'Failed to create handled patient record',
                details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Error creating handled patient:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}