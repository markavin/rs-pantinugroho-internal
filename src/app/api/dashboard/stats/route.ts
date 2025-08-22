import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    let stats: any = {};

    switch (session.user.role) {
      case 'DOCTOR':
        stats = await getDoctorStats(session.user.id, startOfDay, endOfDay);
        break;
      case 'PATIENT':
        stats = await getPatientStats(session.user.id, startOfDay, endOfDay);
        break;
      case 'ADMIN':
        stats = await getAdminStats(startOfDay, endOfDay);
        break;
      default:
        stats = { message: 'Role not implemented yet' };
    }

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getDoctorStats(doctorId: string, startOfDay: Date, endOfDay: Date) {
  try {
    const [
      totalPatients,
      todayAppointments,
      highRiskPatients,
      pendingAlerts
    ] = await Promise.all([
      // Count all patients
      prisma.patient.count(),
      
      // Count today's appointments for this doctor
      prisma.appointment.count({
        where: {
          doctorId,
          appointmentDate: { 
            gte: startOfDay, 
            lte: endOfDay 
          }
        }
      }),
      
      // Count high risk patients (those with recent high blood glucose)
      prisma.patient.count({
        where: {
          vitalSigns: {
            some: {
              bloodGlucose: { gt: 200 },
              recordDate: { 
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
              }
            }
          }
        }
      }),
      
      // Mock pending alerts for now
      Promise.resolve(2)
    ]);

    return {
      totalPatients,
      todayAppointments,
      highRiskPatients,
      pendingAlerts
    };
  } catch (error) {
    console.error('Error in getDoctorStats:', error);
    return {
      totalPatients: 0,
      todayAppointments: 0,
      highRiskPatients: 0,
      pendingAlerts: 0
    };
  }
}

async function getPatientStats(userId: string, startOfDay: Date, endOfDay: Date) {
  try {
    // Find patient created by this user
    const patient = await prisma.patient.findFirst({
      where: { createdBy: userId }
    });

    if (!patient) {
      return { error: 'Patient not found' };
    }

    const [
      todayVitalSigns,
      activeMedications,
      upcomingAppointments,
      lastVitalSign
    ] = await Promise.all([
      // Count today's vital signs
      prisma.vitalSign.count({
        where: {
          patientId: patient.id,
          recordDate: { gte: startOfDay, lte: endOfDay }
        }
      }),
      
      // Count active medications
      prisma.medication.count({
        where: {
          patientId: patient.id,
          isActive: true
        }
      }),
      
      // Count upcoming appointments
      prisma.appointment.count({
        where: {
          patientId: patient.id,
          appointmentDate: { gte: new Date() },
          status: 'SCHEDULED'
        }
      }),
      
      // Get latest vital sign
      prisma.vitalSign.findFirst({
        where: { patientId: patient.id },
        orderBy: { recordDate: 'desc' },
        select: { 
          bloodGlucose: true,
          systolicBP: true,
          diastolicBP: true,
          heartRate: true
        }
      })
    ]);

    return {
      todayVitalSigns,
      activeMedications,
      upcomingAppointments,
      lastBloodGlucose: lastVitalSign?.bloodGlucose || null,
      lastBloodPressure: lastVitalSign ? 
        `${lastVitalSign.systolicBP || 0}/${lastVitalSign.diastolicBP || 0}` : null,
      lastHeartRate: lastVitalSign?.heartRate || null
    };
  } catch (error) {
    console.error('Error in getPatientStats:', error);
    return {
      todayVitalSigns: 0,
      activeMedications: 0,
      upcomingAppointments: 0,
      lastBloodGlucose: null,
      lastBloodPressure: null,
      lastHeartRate: null
    };
  }
}

async function getAdminStats(startOfDay: Date, endOfDay: Date) {
  try {
    const [
      totalUsers,
      totalPatients,
      todayAppointments,
      systemAlerts
    ] = await Promise.all([
      prisma.user.count(),
      prisma.patient.count(),
      prisma.appointment.count({
        where: {
          appointmentDate: { 
            gte: startOfDay, 
            lte: endOfDay 
          }
        }
      }),
      // Mock system alerts for now
      Promise.resolve(1)
    ]);

    return {
      totalUsers,
      totalPatients,
      todayAppointments,
      systemAlerts
    };
  } catch (error) {
    console.error('Error in getAdminStats:', error);
    return {
      totalUsers: 0,
      totalPatients: 0,
      todayAppointments: 0,
      systemAlerts: 0
    };
  }
}