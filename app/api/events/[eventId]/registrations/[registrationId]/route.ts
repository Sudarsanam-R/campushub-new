import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { RegistrationStatus, AttendanceStatus } from '@prisma/client';

// Validation schemas
const updateRegistrationSchema = z.object({
  status: z.nativeEnum(RegistrationStatus).optional(),
  attendanceStatus: z.nativeEnum(AttendanceStatus).optional(),
  notes: z.string().optional(),
});

// GET /api/events/[eventId]/registrations/[registrationId]
// Get a specific registration
export async function GET(
  request: Request,
  { params }: { params: { eventId: string; registrationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const eventId = parseInt(params.eventId);
    const registrationId = parseInt(params.registrationId);

    if (isNaN(eventId) || isNaN(registrationId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid event or registration ID' },
        { status: 400 }
      );
    }

    // Get the registration with event and user details
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            location: true,
            creatorId: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            Profile: {
              select: {
                profilePicture: true,
                stream: true,
              },
            },
          },
        },
      },
    });

    if (!registration) {
      return NextResponse.json(
        { success: false, message: 'Registration not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role);
    const isEventOrganizer = registration.event.creatorId === parseInt(session.user.id);
    const isOwnRegistration = registration.userId === parseInt(session.user.id);

    if (!isAdmin && !isEventOrganizer && !isOwnRegistration) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to view this registration' },
        { status: 403 }
      );
    }

    // Format the response
    const formattedRegistration = {
      id: registration.id,
      status: registration.status,
      attendanceStatus: registration.attendanceStatus,
      registrationDate: registration.registrationDate.toISOString(),
      checkInTime: registration.checkInTime?.toISOString(),
      checkOutTime: registration.checkOutTime?.toISOString(),
      notes: registration.notes,
      event: {
        id: registration.event.id,
        title: registration.event.title,
        startDate: registration.event.startDate.toISOString(),
        endDate: registration.event.endDate.toISOString(),
        location: registration.event.location,
      },
      user: {
        id: registration.user.id,
        name: `${registration.user.firstName || ''} ${registration.user.lastName || ''}`.trim(),
        email: registration.user.email,
        role: registration.user.role,
        profilePicture: registration.user.Profile?.profilePicture,
        stream: registration.user.Profile?.stream,
      },
    };

    return NextResponse.json({
      success: true,
      data: formattedRegistration,
    });
  } catch (error) {
    console.error('Error fetching registration:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch registration',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// PATCH /api/events/[eventId]/registrations/[registrationId]
// Update a registration (status, attendance, etc.)
export async function PATCH(
  request: Request,
  { params }: { params: { eventId: string; registrationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const eventId = parseInt(params.eventId);
    const registrationId = parseInt(params.registrationId);

    if (isNaN(eventId) || isNaN(registrationId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid event or registration ID' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const json = await request.json();
    const validation = updateRegistrationSchema.safeParse(json);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Get the current registration
    const currentRegistration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        event: {
          select: {
            creatorId: true,
            startDate: true,
            endDate: true,
          },
        },
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!currentRegistration) {
      return NextResponse.json(
        { success: false, message: 'Registration not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role);
    const isEventOrganizer = currentRegistration.event.creatorId === parseInt(session.user.id);
    const isOwnRegistration = currentRegistration.userId === parseInt(session.user.id);

    // Only allow users to update their own registration status (e.g., cancel)
    // Only admins and event organizers can update attendance and other fields
    if (
      (data.status && !isOwnRegistration && !isAdmin && !isEventOrganizer) ||
      (data.attendanceStatus && !isAdmin && !isEventOrganizer)
    ) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to update this registration' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: any = { ...data };
    const now = new Date();

    // Handle check-in/check-out
    if (data.attendanceStatus === 'PRESENT' && !currentRegistration.checkInTime) {
      updateData.checkInTime = now;
    } else if (data.attendanceStatus === 'LATE' && !currentRegistration.checkInTime) {
      updateData.checkInTime = now;
      // Check if user is late (after event start time)
      if (now > currentRegistration.event.startDate) {
        updateData.attendanceStatus = 'LATE';
      }
    } else if (data.attendanceStatus === 'ABSENT' && currentRegistration.checkInTime) {
      updateData.checkOutTime = now;
    }

    // Update the registration
    const updatedRegistration = await prisma.registration.update({
      where: { id: registrationId },
      data: updateData,
      include: {
        event: {
          select: {
            title: true,
            startDate: true,
            endDate: true,
            location: true,
          },
        },
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // TODO: Send notification/email for status changes

    return NextResponse.json({
      success: true,
      data: {
        id: updatedRegistration.id,
        status: updatedRegistration.status,
        attendanceStatus: updatedRegistration.attendanceStatus,
        checkInTime: updatedRegistration.checkInTime?.toISOString(),
        checkOutTime: updatedRegistration.checkOutTime?.toISOString(),
        notes: updatedRegistration.notes,
        event: {
          title: updatedRegistration.event.title,
          startDate: updatedRegistration.event.startDate.toISOString(),
          endDate: updatedRegistration.event.endDate.toISOString(),
          location: updatedRegistration.event.location,
        },
      },
      message: 'Registration updated successfully',
    });
  } catch (error) {
    console.error('Error updating registration:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update registration',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[eventId]/registrations/[registrationId]
// Cancel/delete a registration
export async function DELETE(
  request: Request,
  { params }: { params: { eventId: string; registrationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const eventId = parseInt(params.eventId);
    const registrationId = parseInt(params.registrationId);

    if (isNaN(eventId) || isNaN(registrationId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid event or registration ID' },
        { status: 400 }
      );
    }

    // Get the current registration
    const currentRegistration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        event: {
          select: {
            creatorId: true,
            startDate: true,
          },
        },
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!currentRegistration) {
      return NextResponse.json(
        { success: false, message: 'Registration not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role);
    const isEventOrganizer = currentRegistration.event.creatorId === parseInt(session.user.id);
    const isOwnRegistration = currentRegistration.userId === parseInt(session.user.id);

    // Only allow users to delete their own registration or admins/organizers
    if (!isOwnRegistration && !isAdmin && !isEventOrganizer) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to delete this registration' },
        { status: 403 }
      );
    }

    // Don't allow deletion if the event has already started
    if (new Date() > currentRegistration.event.startDate) {
      return NextResponse.json(
        { success: false, message: 'Cannot cancel registration after the event has started' },
        { status: 400 }
      );
    }

    // Delete the registration
    await prisma.registration.delete({
      where: { id: registrationId },
    });

    // TODO: Send cancellation email/notification

    return NextResponse.json({
      success: true,
      message: 'Registration cancelled successfully',
    });
  } catch (error) {
    console.error('Error deleting registration:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to cancel registration',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
