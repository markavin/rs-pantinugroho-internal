import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET - Get appointments
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    let where: any = {};

    // Filter by user role
    if (session.user.role === 'PATIENT') {
      // Find patient created by this user
      const patient = await prisma.patient.findFirst({
        where: { createdBy: session.user.id }
      });
      if (patient) {
        where.patientId = patient.id;
      }
    } else if (session.user.role === 'DOCTOR') {
      where.doctorId = session.user.id;
    }

    // Add date filter - using appointmentDate from your schema
    if (date) {
      const targetDate = new Date(date);
      const startDate = new Date(targetDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(targetDate);
      endDate.setHours(23, 59, 59, 999);
      
      where.appointmentDate = {
        gte: startDate,
        lte: endDate
      };
    }

    // Add status filter
    if (status) {
      where.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: { name: true, mrNumber: true }
        },
        doctor: {
          select: { name: true }
        }
      },
      orderBy: [
        { appointmentDate: 'asc' },
        { appointmentTime: 'asc' }
      ]
    });

    return NextResponse.json(appointments);

  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new appointment
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      patientId,
      doctorId,
      appointmentDate,
      appointmentTime,
      type,
      notes
    } = body;

    if (!patientId || !doctorId || !appointmentDate || !appointmentTime || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if patient can only book for themselves
    if (session.user.role === 'PATIENT') {
      const patient = await prisma.patient.findFirst({
        where: { 
          createdBy: session.user.id,
          id: patientId 
        }
      });
      
      if (!patient) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Validate the appointment date
    const appointmentDateTime = new Date(appointmentDate);
    if (isNaN(appointmentDateTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid appointment date' },
        { status: 400 }
      );
    }

    // Validate appointment time format (assuming HH:MM format)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(appointmentTime)) {
      return NextResponse.json(
        { error: 'Invalid appointment time format. Use HH:MM' },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        appointmentDate: appointmentDateTime,
        appointmentTime,
        type,
        notes,
        status: 'SCHEDULED'
      },
      include: {
        patient: {
          select: { name: true, mrNumber: true }
        },
        doctor: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json(appointment, { status: 201 });

  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update appointment
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      id,
      appointmentDate,
      appointmentTime,
      type,
      status,
      notes
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    // Find the existing appointment
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true
      }
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (session.user.role === 'PATIENT') {
      const patient = await prisma.patient.findFirst({
        where: { 
          createdBy: session.user.id,
          id: existingAppointment.patientId 
        }
      });
      
      if (!patient) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (session.user.role === 'DOCTOR') {
      if (existingAppointment.doctorId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (appointmentDate !== undefined) {
      const appointmentDateTime = new Date(appointmentDate);
      if (isNaN(appointmentDateTime.getTime())) {
        return NextResponse.json(
          { error: 'Invalid appointment date' },
          { status: 400 }
        );
      }
      updateData.appointmentDate = appointmentDateTime;
    }

    if (appointmentTime !== undefined) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(appointmentTime)) {
        return NextResponse.json(
          { error: 'Invalid appointment time format. Use HH:MM' },
          { status: 400 }
        );
      }
      updateData.appointmentTime = appointmentTime;
    }

    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          select: { name: true, mrNumber: true }
        },
        doctor: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json(updatedAppointment);

  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}