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
      temperature,
      bloodPressure,
      heartRate,
      respiratoryRate,
      oxygenSaturation,
      bloodSugar,
      weight,
      height,
      medicationsGiven,
      education,
      complications,
      notes,
      dietCompliance,
      dietIssues,
      energyRequirement,
      calculatedBMI,
      calculatedBBI,
      basalMetabolicRate,
      activityLevel,
      stressLevel,
      stressFactor,
      nutritionStatus,
      energyCalculationDetail
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
      temperature: temperature ? parseFloat(temperature) : null,
      bloodPressure: bloodPressure || null,
      heartRate: heartRate ? parseInt(heartRate) : null,
      respiratoryRate: respiratoryRate ? parseInt(respiratoryRate) : null,
      oxygenSaturation: oxygenSaturation ? parseInt(oxygenSaturation) : null,
      bloodSugar: bloodSugar ? parseInt(bloodSugar) : null,
      weight: weight ? parseFloat(weight) : null,
      height: height ? parseInt(height) : null,
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

    // ENERGY CALCULATION DATA
    if (energyRequirement) {
      visitationData.energyRequirement = energyRequirement;
    }
    if (calculatedBMI) {
      visitationData.calculatedBMI = calculatedBMI;
    }
    if (calculatedBBI) {
      visitationData.calculatedBBI = calculatedBBI;
    }
    if (basalMetabolicRate) {
      visitationData.basalMetabolicRate = basalMetabolicRate;
    }
    if (activityLevel) {
      visitationData.activityLevel = activityLevel;
    }
    if (stressLevel) {
      visitationData.stressLevel = stressLevel;
    }
    if (stressFactor) {
      visitationData.stressFactor = stressFactor;
    }
    if (nutritionStatus) {
      visitationData.nutritionStatus = nutritionStatus;
    }
    if (energyCalculationDetail) {
      visitationData.energyCalculationDetail = energyCalculationDetail;
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
        }
      });

      console.log('Visitation created:', newVisitation.id);

      // UPDATE PATIENT DATA
      const patientUpdateData: any = {};

      if (visitationData.weight) {
        patientUpdateData.weight = visitationData.weight;
        patientUpdateData.lastWeightUpdate = new Date();
      }

      if (visitationData.height) {
        patientUpdateData.height = visitationData.height;
        patientUpdateData.lastHeightUpdate = new Date();
      }

      if (visitationData.calculatedBMI) {
        patientUpdateData.latestBMI = visitationData.calculatedBMI;
        patientUpdateData.bmi = visitationData.calculatedBMI;
      }

      if (visitationData.energyRequirement) {
        patientUpdateData.latestEnergyRequirement = visitationData.energyRequirement;
        patientUpdateData.lastEnergyCalculation = visitationData.energyCalculationDetail;
      }

      if (visitationData.dietCompliance !== null) {
        patientUpdateData.dietCompliance = visitationData.dietCompliance;
      }

      // Update patient jika ada data yang perlu diupdate
      if (Object.keys(patientUpdateData).length > 0) {
        console.log('Updating patient with:', patientUpdateData);
        await tx.patient.update({
          where: { id: patientId },
          data: patientUpdateData
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

        let alertPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'HIGH';

        if (dietCompliance !== null) {
          const compliance = parseInt(dietCompliance);
          if (compliance < 50) {
            alertPriority = 'URGENT';
          } else if (compliance >= 80) {
            alertPriority = 'MEDIUM';
          }
        } 

        const alertType: 'CRITICAL' | 'WARNING' | 'INFO' =
          dietCompliance && parseInt(dietCompliance) < 50 ? 'CRITICAL' : 'WARNING';

        await tx.alert.create({
          data: {
            type: alertType,
            category: 'NUTRITION',
            message: `Masalah diet dilaporkan oleh ${nurse.name} pada pasien ${newVisitation.patient.name} (${newVisitation.patient.mrNumber}) - Shift ${shift}: ${dietIssues}${dietCompliance ? `. Kepatuhan: ${dietCompliance}%` : ''}`,
            patientId,
            priority: alertPriority,
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

    // TAMBAH INI: Ambil patientId dari query parameter
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    // UBAH INI: Tambahkan filter where jika ada patientId
    const whereClause = patientId ? { patientId } : {};

    const visitations = await prisma.visitation.findMany({
      where: whereClause, // TAMBAH filter ini
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
      temperature,
      bloodPressure,
      heartRate,
      respiratoryRate,
      oxygenSaturation,
      bloodSugar,
      weight,
      height,
      medicationsGiven,
      labResults,
      actions,
      complications,
      education,
      notes,
      dietCompliance,
      dietIssues,
      energyRequirement,
      calculatedBMI,
      calculatedBBI,
      basalMetabolicRate,
      activityLevel,
      stressLevel,
      stressFactor,
      nutritionStatus,
      energyCalculationDetail
    } = body;

    // Check if visitation exists
    const existingVisitation = await prisma.visitation.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
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

          // VITAL SIGNS - Field terpisah
          temperature: temperature !== undefined ? (temperature ? parseFloat(temperature) : null) : existingVisitation.temperature,
          bloodPressure: bloodPressure !== undefined ? bloodPressure : existingVisitation.bloodPressure,
          heartRate: heartRate !== undefined ? (heartRate ? parseInt(heartRate) : null) : existingVisitation.heartRate,
          respiratoryRate: respiratoryRate !== undefined ? (respiratoryRate ? parseInt(respiratoryRate) : null) : existingVisitation.respiratoryRate,
          oxygenSaturation: oxygenSaturation !== undefined ? (oxygenSaturation ? parseInt(oxygenSaturation) : null) : existingVisitation.oxygenSaturation,
          bloodSugar: bloodSugar !== undefined ? (bloodSugar ? parseInt(bloodSugar) : null) : existingVisitation.bloodSugar,
          weight: weight !== undefined ? (weight ? parseFloat(weight) : null) : existingVisitation.weight,
          height: height !== undefined ? (height ? parseInt(height) : null) : existingVisitation.height,

          medicationsGiven: medicationsGiven || existingVisitation.medicationsGiven,
          labResults: labResults !== undefined ? labResults : existingVisitation.labResults,
          actions: actions !== undefined ? actions : existingVisitation.actions,
          complications: complications !== undefined ? complications : existingVisitation.complications,
          education: education !== undefined ? education : existingVisitation.education,
          notes: notes !== undefined ? notes : existingVisitation.notes,
          dietCompliance: dietCompliance !== undefined ? (dietCompliance ? parseInt(dietCompliance) : null) : existingVisitation.dietCompliance,
          dietIssues: dietIssues !== undefined ? dietIssues : existingVisitation.dietIssues,

          // ENERGY CALCULATION
          energyRequirement: energyRequirement !== undefined ? energyRequirement : existingVisitation.energyRequirement,
          calculatedBMI: calculatedBMI !== undefined ? calculatedBMI : existingVisitation.calculatedBMI,
          calculatedBBI: calculatedBBI !== undefined ? calculatedBBI : existingVisitation.calculatedBBI,
          basalMetabolicRate: basalMetabolicRate !== undefined ? basalMetabolicRate : existingVisitation.basalMetabolicRate,
          activityLevel: activityLevel !== undefined ? activityLevel : existingVisitation.activityLevel,
          stressLevel: stressLevel !== undefined ? stressLevel : existingVisitation.stressLevel,
          stressFactor: stressFactor !== undefined ? stressFactor : existingVisitation.stressFactor,
          nutritionStatus: nutritionStatus !== undefined ? nutritionStatus : existingVisitation.nutritionStatus,
          energyCalculationDetail: energyCalculationDetail !== undefined ? energyCalculationDetail : existingVisitation.energyCalculationDetail,

          nextVisitNeeded: complications ? true : existingVisitation.nextVisitNeeded,
          priority: complications ? 'HIGH' : existingVisitation.priority
        },
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
        }
      });

      // UPDATE PATIENT DATA
      const patientUpdateData: any = {};

      // Update weight if changed
      if (weight !== undefined && weight) {
        const newWeight = parseFloat(weight);
        if (newWeight !== existingVisitation.weight) {
          patientUpdateData.weight = newWeight;
          patientUpdateData.lastWeightUpdate = new Date();
        }
      }

      // Update height if changed
      if (height !== undefined && height) {
        const newHeight = parseInt(height);
        if (newHeight !== existingVisitation.height) {
          patientUpdateData.height = newHeight;
          patientUpdateData.lastHeightUpdate = new Date();
        }
      }

      // Update BMI if changed
      if (calculatedBMI !== undefined && calculatedBMI !== existingVisitation.calculatedBMI) {
        patientUpdateData.latestBMI = calculatedBMI;
        patientUpdateData.bmi = calculatedBMI;
      }

      // Update energy requirement if changed
      if (energyRequirement !== undefined && energyRequirement !== existingVisitation.energyRequirement) {
        patientUpdateData.latestEnergyRequirement = energyRequirement;
        patientUpdateData.lastEnergyCalculation = energyCalculationDetail || existingVisitation.energyCalculationDetail;
      }

      // Update diet compliance if changed
      if (dietCompliance !== undefined && dietCompliance !== existingVisitation.dietCompliance) {
        patientUpdateData.dietCompliance = dietCompliance ? parseInt(dietCompliance) : null;
      }

      // Update patient if there's data to update
      if (Object.keys(patientUpdateData).length > 0) {
        await tx.patient.update({
          where: { id: existingVisitation.patientId },
          data: patientUpdateData
        });
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