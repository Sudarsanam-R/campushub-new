import { createTransport } from 'nodemailer';
import { render } from '@react-email/render';
import { RegistrationConfirmation } from '@/emails/RegistrationConfirmation';
import { RegistrationStatusUpdate } from '@/emails/RegistrationStatusUpdate';
import { RegistrationCancellation } from '@/emails/RegistrationCancellation';

// Email configuration
const emailConfig = {
  host: process.env.EMAIL_SERVER_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_SERVER_USER || 'your-email@example.com',
    pass: process.env.EMAIL_SERVER_PASSWORD || 'your-email-password',
  },
  from: process.env.EMAIL_FROM || 'noreply@campushub.app',
};

// Create a Nodemailer transporter
const transporter = createTransport(emailConfig);

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: any[];
}

/**
 * Send an email using Nodemailer
 */
export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string,
  text?: string,
  options: Partial<SendEmailOptions> = {}
) {
  try {
    const mailOptions: SendEmailOptions = {
      from: emailConfig.from,
      to,
      subject,
      text: text || stripHtml(html),
      html,
      ...options,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

/**
 * Send a registration confirmation email
 */
export async function sendRegistrationConfirmationEmail(
  to: string,
  data: {
    userName: string;
    eventName: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    qrCodeUrl: string;
  }
) {
  const emailHtml = render(
    RegistrationConfirmation({
      userName: data.userName,
      eventName: data.eventName,
      eventDate: data.eventDate,
      eventTime: data.eventTime,
      eventLocation: data.eventLocation,
      qrCodeUrl: data.qrCodeUrl,
    })
  );

  return sendEmail(
    to,
    `Registration Confirmation: ${data.eventName}`,
    emailHtml
  );
}

/**
 * Send a registration status update email
 */
export async function sendRegistrationStatusUpdateEmail(
  to: string,
  data: {
    userName: string;
    eventName: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    status: string;
  }
) {
  const emailHtml = render(
    RegistrationStatusUpdate({
      userName: data.userName,
      eventName: data.eventName,
      eventDate: data.eventDate,
      eventTime: data.eventTime,
      eventLocation: data.eventLocation,
      status: data.status,
    })
  );

  return sendEmail(
    to,
    `Registration Update: ${data.eventName}`,
    emailHtml
  );
}

/**
 * Send a registration cancellation email
 */
export async function sendRegistrationCancellationEmail(
  to: string,
  data: {
    userName: string;
    eventName: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
  }
) {
  const emailHtml = render(
    RegistrationCancellation({
      userName: data.userName,
      eventName: data.eventName,
      eventDate: data.eventDate,
      eventTime: data.eventTime,
      eventLocation: data.eventLocation,
    })
  );

  return sendEmail(
    to,
    `Registration Cancelled: ${data.eventName}`,
    emailHtml
  );
}

/**
 * Strip HTML tags from a string to create plain text
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '');
}

// Export the transporter for direct use if needed
export { transporter };
