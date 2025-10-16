// src/app/api/visitations/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const prismaLocal = new PrismaClient();
  
  try {
    console.log('=== POST VISITATION START ===');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', JSON.stringify(session, null, 2));
    
    if (!session?.user?.id) {
      console.log('ERROR: No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const userId = session.user.id;
    
    console.log('User ID:', userId);
    console.log('User role:', userRole);
    
    if (userRole !== 'PERAWAT_RUANGAN' && userRole !== 'SUPER_ADMIN') {
      console.log('ERROR: Invalid role');
      return NextResponse.json({
        error: 'Only room nurses can create visitation logs'
      }, { status: 403 });
    }

    const nurse = await prismaLocal.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, role: true }
    });

    if (!nurse) {
      console.log('ERROR: Nurse user not found in database');
      return NextResponse.json({ 
        error: 'User not found in database',
        details: `User ID ${userId} does not exist`
      }, { status: 404 });
    }

    console.log('Nurse found:', nurse);

    const body = await request.json();
    console.log('=== RECEIVED BODY ===');
    console.log(JSON.stringify(body, null, 2));

    const {
      patientId,
      shift,
      vitalSigns,
      medicationsGiven,
      education,
      complications,
      notes,
      dietCompliance,
      dietIssues
    } = body;

    if (!patientId || !shift) {
      console.log('ERROR: Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: patientId, shift' },
        { status: 400 }
      );
    }

    console.log('Finding patient:', patientId);
    const patient = await prismaLocal.patient.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        name: true,
        mrNumber: true,
        status: true
      }
    });

    if (!patient) {
      console.log('ERROR: Patient not found');
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    console.log('Patient found:', patient.name);

    const visitationData: any = {
      patientId,
      nurseId: nurse.id,
      shift,
      vitalSigns: vitalSigns || {},
      medicationsGiven: medicationsGiven || [],
      nextVisitNeeded: false,
      priority: 'NORMAL'
    };

    if (education !== null && education !== undefined) {
      visitationData.education = education;
    }

    if (complications !== null && complications !== undefined) {
      visitationData.complications = complications;
      visitationData.nextVisitNeeded = true;
      visitationData.priority = 'HIGH';
    }

    if (notes !== null && notes !== undefined) {
      visitationData.notes = notes;
    }

    if (dietCompliance !== null && dietCompliance !== undefined) {
      visitationData.dietCompliance = parseInt(dietCompliance);
    }

    if (dietIssues !== null && dietIssues !== undefined) {
      visitationData.dietIssues = dietIssues;
    }

    console.log('=== CREATING VISITATION ===');
    console.log(JSON.stringify(visitationData, null, 2));

    const visitation = await prismaLocal.$transaction(async (tx) => {
      console.log('Transaction start...');
      
      const newVisitation = await tx.visitation.create({
        data: visitationData,
        include: {
          patient: {
            select: {
              name: true,
              mrNumber: true
            }
          },
          nurse: {
            select: {
              name: true
            }
          }
        }
      });

      console.log('Visitation created:', newVisitation.id);

      if (visitationData.dietCompliance !== null && visitationData.dietCompliance !== undefined) {
        console.log('Updating patient diet compliance...');
        await tx.patient.update({
          where: { id: patientId },
          data: {
            dietCompliance: visitationData.dietCompliance
          }
        });
      }

      if (vitalSigns?.weight) {
        console.log('Updating patient weight...');
        await tx.patient.update({
          where: { id: patientId },
          data: {
            weight: parseFloat(vitalSigns.weight)
          }
        });
      }

      if (complications && complications.trim()) {
        console.log('Creating complication alert...');
        await tx.alert.create({
          data: {
            type: 'CRITICAL',
            category: 'VITAL_SIGNS',
            message: `Komplikasi terdeteksi pada pasien ${newVisitation.patient.name} (${newVisitation.patient.mrNumber}). Shift ${shift}: ${complications}`,
            patientId,
            priority: 'URGENT',
            targetRole: 'DOKTER_SPESIALIS',
            isRead: false
          }
        });
      }

      if (dietIssues && dietIssues.trim()) {
        console.log('Creating diet alert...');
        await tx.alert.create({
          data: {
            type: 'WARNING',
            category: 'NUTRITION',
            message: `Masalah diet pada pasien ${newVisitation.patient.name} (${newVisitation.patient.mrNumber}): ${dietIssues}${dietCompliance ? `. Kepatuhan diet: ${dietCompliance}%` : ''}`,
            patientId,
            priority: 'HIGH',
            targetRole: 'AHLI_GIZI',
            isRead: false
          }
        });
      }

      console.log('Transaction complete');
      return newVisitation;
    });

    console.log('=== POST VISITATION SUCCESS ===');
    return NextResponse.json(visitation, { status: 201 });
    
  } catch (error: any) {
    console.error('=== POST VISITATION ERROR ===');
    console.error('Error name:', error?.name);
    console.error('Error message:', error?.message);
    console.error('Error code:', error?.code);
    console.error('Error meta:', error?.meta);
    console.error('Full error:', error);
    
    return NextResponse.json({
      error: 'Internal server error',
      details: error?.message || 'Unknown error',
      code: error?.code,
      meta: error?.meta
    }, { status: 500 });
  } finally {
    await prismaLocal.$disconnect();
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const allowedRoles = ['PERAWAT_POLI', 'DOKTER_SPESIALIS', 'SUPER_ADMIN', 'PERAWAT_RUANGAN', 'ADMINISTRASI', 'FARMASI', 'AHLI_GIZI'];

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const visitations = await prisma.visitation.findMany({
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            mrNumber: true
          }
        },
        nurse: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(visitations);
  } catch (error) {
    console.error('Error fetching visitations:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch visitations',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'PERAWAT_RUANGAN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Visitation ID required' }, { status: 400 });
    }

    const body = await request.json();
    const {
      shift,
      complaints,
      vitalSigns,
      medicationsGiven,
      labResults,
      actions,
      complications,
      education,
      notes,
      dietCompliance,
      dietIssues
    } = body;

    // Check if visitation exists
    const existingVisitation = await prisma.visitation.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            name: true,
            mrNumber: true
          }
        }
      }
    });

    if (!existingVisitation) {
      return NextResponse.json({ error: 'Visitation not found' }, { status: 404 });
    }

    // Use transaction for update operations
    const updatedVisitation = await prisma.$transaction(async (tx) => {
      const updated = await tx.visitation.update({
        where: { id },
        data: {
          shift: shift || existingVisitation.shift,
          complaints: complaints !== undefined ? complaints : existingVisitation.complaints,
          vitalSigns: vitalSigns || existingVisitation.vitalSigns,
          medicationsGiven: medicationsGiven || existingVisitation.medicationsGiven,
          labResults: labResults !== undefined ? labResults : existingVisitation.labResults,
          actions: actions !== undefined ? actions : existingVisitation.actions,
          complications: complications !== undefined ? complications : existingVisitation.complications,
          education: education !== undefined ? education : existingVisitation.education,
          notes: notes !== undefined ? notes : existingVisitation.notes,
          dietCompliance: dietCompliance !== undefined ? (dietCompliance ? parseInt(dietCompliance) : null) : existingVisitation.dietCompliance,
          dietIssues: dietIssues !== undefined ? dietIssues : existingVisitation.dietIssues,
          nextVisitNeeded: complications ? true : existingVisitation.nextVisitNeeded,
          priority: complications ? 'HIGH' : existingVisitation.priority
        },
        include: {
          patient: {
            select: {
              name: true,
              mrNumber: true
            }
          },
          nurse: {
            select: {
              name: true
            }
          }
        }
      });

      // Update patient diet compliance if changed
      if (dietCompliance !== undefined && dietCompliance !== existingVisitation.dietCompliance) {
        await tx.patient.update({
          where: { id: existingVisitation.patientId },
          data: {
            dietCompliance: dietCompliance ? parseInt(dietCompliance) : null
          }
        });
      }

      // Update patient weight if changed
      if (vitalSigns?.weight) {
        const existingWeight = (existingVisitation.vitalSigns as any)?.weight;
        if (vitalSigns.weight !== existingWeight) {
          await tx.patient.update({
            where: { id: existingVisitation.patientId },
            data: {
              weight: parseFloat(vitalSigns.weight)
            }
          });
        }
      }


      // Create new alert if complications added/changed
      if (complications && complications !== existingVisitation.complications) {
        await tx.alert.create({
          data: {
            type: 'CRITICAL',
            category: 'VITAL_SIGNS',
            message: `Komplikasi diupdate pada pasien ${updated.patient.name} (${updated.patient.mrNumber}). Shift ${updated.shift}: ${complications}`,
            patientId: existingVisitation.patientId,
            priority: 'URGENT',
            targetRole: 'DOKTER_SPESIALIS',
            isRead: false
          }
        });
      }

      // Create new alert if diet issues added/changed
      if (dietIssues && dietIssues !== existingVisitation.dietIssues) {
        await tx.alert.create({
          data: {
            type: 'WARNING',
            category: 'NUTRITION',
            message: `Masalah diet diupdate pada pasien ${updated.patient.name} (${updated.patient.mrNumber}): ${dietIssues}${dietCompliance ? `. Kepatuhan diet: ${dietCompliance}%` : ''}`,
            patientId: existingVisitation.patientId,
            priority: 'HIGH',
            targetRole: 'AHLI_GIZI',
            isRead: false
          }
        });
      }

      return updated;
    });

    return NextResponse.json(updatedVisitation);
  } catch (error) {
    console.error('Error updating visitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'PERAWAT_RUANGAN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Visitation ID required' }, { status: 400 });
    }

    await prisma.visitation.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Visitation deleted successfully' });
  } catch (error) {
    console.error('Error deleting visitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}