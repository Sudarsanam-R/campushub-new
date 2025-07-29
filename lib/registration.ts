import { prisma } from '@/lib/prisma';
import { RegistrationStatus, AttendanceStatus } from '@prisma/client';
import QRCode from 'qrcode';
import { sendEmail } from '@/lib/email';

interface RegistrationData {
  eventId: number;
  userId: number;
  status?: RegistrationStatus;
  notes?: string | null;
}

interface UpdateRegistrationData {
  status?: RegistrationStatus;
  attendanceStatus?: AttendanceStatus;
  notes?: string | null;
}

/**
 * Register a user for an event
 */
export async function registerForEvent(data: RegistrationData) {
  const { eventId, userId, status = 'PENDING', notes = null } = data;

  // Check if the event exists and is active
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      title: true,
      startDate: true,
      endDate: true,
      registrationDeadline: true,
      maxAttendees: true,
      isActive: true,
      _count: {
        select: { registrations: true },
      },
    },
  });

  if (!event) {
    throw new Error('Event not found');
  }

  if (!event.isActive) {
    throw new Error('This event is no longer active');
  }

  // Check registration deadline
  if (new Date() > event.registrationDeadline) {
    throw new Error('Registration deadline has passed');
  }

  // Check if event is at capacity
  if (event.maxAttendees && event._count.registrations >= event.maxAttendees) {
    throw new Error('This event is at capacity');
  }

  // Check if user is already registered
  const existingRegistration = await prisma.registration.findUnique({
    where: {
      eventId_userId: {
        eventId,
        userId,
      },
    },
  });

  if (existingRegistration) {
    throw new Error('User is already registered for this event');
  }

  // Create the registration
  const registration = await prisma.registration.create({
    data: {
      eventId,
      userId,
      status,
      notes,
      registrationDate: new Date(),
    },
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

  // Generate QR code for the registration
  const qrCodeData = {
    registrationId: registration.id,
    eventId: registration.eventId,
    userId: registration.userId,
  };

  const qrCodeUrl = await generateQRCode(JSON.stringify(qrCodeData));

  // Save QR code URL to the registration
  await prisma.registration.update({
    where: { id: registration.id },
    data: { qrCodeUrl },
  });

  // Send confirmation email with QR code
  await sendRegistrationConfirmation(registration, qrCodeUrl);

  return {
    ...registration,
    qrCodeUrl,
  };
}

/**
 * Update a registration
 */
export async function updateRegistration(
  registrationId: number,
  data: UpdateRegistrationData,
  currentUserId: number
) {
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
    throw new Error('Registration not found');
  }

  // Check permissions
  const isAdmin = await isUserAdmin(currentUserId);
  const isEventOrganizer = currentRegistration.event.creatorId === currentUserId;
  const isOwnRegistration = currentRegistration.userId === currentUserId;

  // Only allow users to update their own registration status (e.g., cancel)
  // Only admins and event organizers can update attendance and other fields
  if (
    (data.status && !isOwnRegistration && !isAdmin && !isEventOrganizer) ||
    (data.attendanceStatus && !isAdmin && !isEventOrganizer)
  ) {
    throw new Error('Unauthorized to update this registration');
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

  // Send notification for status changes
  if (data.status && data.status !== currentRegistration.status) {
    await sendRegistrationStatusUpdate(updatedRegistration);
  }

  return updatedRegistration;
}

/**
 * Cancel a registration
 */
export async function cancelRegistration(registrationId: number, currentUserId: number) {
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
    throw new Error('Registration not found');
  }

  // Check permissions
  const isAdmin = await isUserAdmin(currentUserId);
  const isEventOrganizer = currentRegistration.event.creatorId === currentUserId;
  const isOwnRegistration = currentRegistration.userId === currentUserId;

  // Only allow users to delete their own registration or admins/organizers
  if (!isOwnRegistration && !isAdmin && !isEventOrganizer) {
    throw new Error('Unauthorized to cancel this registration');
  }

  // Don't allow cancellation if the event has already started
  if (new Date() > currentRegistration.event.startDate) {
    throw new Error('Cannot cancel registration after the event has started');
  }

  // Update status to CANCELLED instead of deleting
  const cancelledRegistration = await prisma.registration.update({
    where: { id: registrationId },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
    },
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

  // Send cancellation email
  await sendRegistrationCancellation(cancelledRegistration);

  return cancelledRegistration;
}

/**
 * Generate a QR code for a registration
 */
async function generateQRCode(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H', // High error correction
      type: 'image/png',
      margin: 1,
      scale: 8,
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Check if a user is an admin
 */
async function isUserAdmin(userId: number): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user ? ['ADMIN', 'SUPER_ADMIN'].includes(user.role) : false;
}

/**
 * Send registration confirmation email
 */
async function sendRegistrationConfirmation(registration: any, qrCodeUrl: string) {
  const { user, event } = registration;
  const recipientEmail = user.email;
  const subject = `Registration Confirmation: ${event.title}`;

  // Format the email content
  const emailContent = `
    <h2>Registration Confirmation</h2>
    <p>Hello ${user.firstName || 'there'},</p>
    <p>Your registration for <strong>${event.title}</strong> has been confirmed!</p>
    
    <h3>Event Details:</h3>
    <p><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
    <p><strong>Time:</strong> ${new Date(event.startDate).toLocaleTimeString()} - ${new Date(event.endDate).toLocaleTimeString()}</p>
    <p><strong>Location:</strong> ${event.location || 'TBD'}</p>
    
    <p>Please show this QR code at the event check-in:</p>
    <img src="${qrCodeUrl}" alt="Registration QR Code" style="max-width: 200px;" />
    
    <p>We look forward to seeing you there!</p>
    <p>Best regards,<br>The CampusHub Team</p>
  `;

  await sendEmail(recipientEmail, subject, emailContent);
}

/**
 * Send registration status update email
 */
async function sendRegistrationStatusUpdate(registration: any) {
  const { user, event, status } = registration;
  const recipientEmail = user.email;
  const subject = `Registration Update: ${event.title}`;

  let statusMessage = '';
  switch (status) {
    case 'CONFIRMED':
      statusMessage = 'Your registration has been confirmed!';
      break;
    case 'WAITLISTED':
      statusMessage = 'You have been added to the waitlist.';
      break;
    case 'CANCELLED':
      statusMessage = 'Your registration has been cancelled.';
      break;
    default:
      statusMessage = `Your registration status has been updated to: ${status}`;
  }

  const emailContent = `
    <h2>Registration Status Update</h2>
    <p>Hello ${user.firstName || 'there'},</p>
    <p>${statusMessage}</p>
    
    <h3>Event Details:</h3>
    <p><strong>Event:</strong> ${event.title}</p>
    <p><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
    <p><strong>Time:</strong> ${new Date(event.startDate).toLocaleTimeString()} - ${new Date(event.endDate).toLocaleTimeString()}</p>
    <p><strong>Location:</strong> ${event.location || 'TBD'}</p>
    
    <p>If you have any questions, please contact the event organizer.</p>
    <p>Best regards,<br>The CampusHub Team</p>
  `;

  await sendEmail(recipientEmail, subject, emailContent);
}

/**
 * Send registration cancellation email
 */
async function sendRegistrationCancellation(registration: any) {
  const { user, event } = registration;
  const recipientEmail = user.email;
  const subject = `Registration Cancelled: ${event.title}`;

  const emailContent = `
    <h2>Registration Cancelled</h2>
    <p>Hello ${user.firstName || 'there'},</p>
    <p>Your registration for <strong>${event.title}</strong> has been cancelled.</p>
    
    <h3>Event Details:</h3>
    <p><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
    <p><strong>Time:</strong> ${new Date(event.startDate).toLocaleTimeString()} - ${new Date(event.endDate).toLocaleTimeString()}</p>
    <p><strong>Location:</strong> ${event.location || 'TBD'}</p>
    
    <p>If this was a mistake or you have any questions, please contact the event organizer.</p>
    <p>Best regards,<br>The CampusHub Team</p>
  `;

  await sendEmail(recipientEmail, subject, emailContent);
}
