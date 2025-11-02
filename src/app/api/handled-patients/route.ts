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

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const userRole = (session.user as any).role;

        const allowedRoles = ['PERAWAT_POLI', 'DOKTER_SPESIALIS', 'SUPER_ADMIN'];
        if (!allowedRoles.includes(userRole)) {
            return NextResponse.json({
                error: 'Insufficient permissions. Only nurses and doctors can handle patients.'
            }, { status: 403 });
        }

        const body = await request.json();
        const {
            patientId,
            diagnosis,
            treatmentPlan,
            notes,
            status,
            priority,
            nextVisitDate,
            estimatedDuration,
            specialInstructions,
            requestLabTests,
            labTestsRequested
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

        const handledPatient = await prisma.handledPatient.create({
            data: {
                patientId,
                handledBy: userId,
                handledDate: new Date(),
                diagnosis: diagnosis || null,
                treatmentPlan: treatmentPlan || null,
                notes: notes || null,
                status: status || 'ANTRIAN',
                priority: priority || 'NORMAL',
                nextVisitDate: nextVisitDate ? new Date(nextVisitDate) : null,
                estimatedDuration: estimatedDuration || null,
                specialInstructions: specialInstructions || null
            },
            include: {
                patient: true,
                handler: {
                    select: {
                        name: true,
                        role: true,
                        employeeId: true
                    }
                }
            }
        });


        if (requestLabTests && labTestsRequested && Array.isArray(labTestsRequested) && labTestsRequested.length > 0) {
            console.log('Checking for existing lab request alerts...');

            const existingAlerts = await prisma.alert.findMany({
                where: {
                    patientId: patient.id,
                    category: 'LAB_RESULT',
                    targetRole: 'PERAWAT_POLI',
                    isRead: false,
                    message: {
                        contains: 'Permintaan pemeriksaan lab ulang'
                    }
                }
            });

            if (existingAlerts.length === 0) {
                console.log('No existing unread lab request found, creating new alert...');
                console.log('Lab tests requested:', labTestsRequested);

                try {
                    const labRequestAlert = await prisma.alert.create({
                        data: {
                            type: 'INFO',
                            message: `Permintaan pemeriksaan lab ulang untuk ${patient.name} (${patient.mrNumber}).\n\nPemeriksaan yang diminta:\n${labTestsRequested.map((test: string) => `- ${test}`).join('\n')}\n\nSegera lakukan pemeriksaan lab.`,
                            patientId: patient.id,
                            category: 'LAB_RESULT',
                            priority: 'HIGH',
                            targetRole: 'PERAWAT_POLI',
                            isRead: false
                        }
                    });

                    console.log('Lab request notification created:', {
                        alertId: labRequestAlert.id,
                        patientName: patient.name,
                        mrNumber: patient.mrNumber,
                        testsCount: labTestsRequested.length,
                        targetRole: 'PERAWAT_POLI'
                    });
                } catch (alertError) {
                    console.error('Failed to create lab request alert:', alertError);
                }
            } else {
                console.log(`Skipped creating duplicate alert. Found ${existingAlerts.length} existing unread lab request(s)`);
            }
        }

        return NextResponse.json(handledPatient, { status: 201 });
    } catch (error) {
        console.error('Error creating handled patient:', error);

        if ((error as any).code === 'P2002') {
            return NextResponse.json({
                error: 'Patient is already being handled'
            }, { status: 400 });
        }

        if ((error as any).code === 'P2003') {
            return NextResponse.json({
                error: 'Invalid reference data provided'
            }, { status: 400 });
        }

        return NextResponse.json({
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        }, { status: 500 });
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
        const patientId = searchParams.get('patientId');

        let whereClause: any = {};

        if (patientId) {
            whereClause.patientId = patientId;
        } else {
            if (userRole === 'DOKTER_SPESIALIS') {
                whereClause.OR = [
                    { status: 'ANTRIAN' },
                    { handledBy: userId }
                ];
            } else if (userRole !== 'SUPER_ADMIN') {
                whereClause.handledBy = userId;
            }
        }

        if (status) {
            whereClause.status = status;
        }

        if (handledBy && userRole === 'SUPER_ADMIN') {
            whereClause.handledBy = handledBy;
        }

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
            orderBy: [
                { handledDate: 'desc' }
            ]
        });

        return NextResponse.json(handledPatients);
    } catch (error) {
        console.error('Error fetching handled patients:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}