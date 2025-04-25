import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import axios from 'axios';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // For security, don't reveal if user exists
    return NextResponse.json({ message: 'If this email exists, a reset link will be sent.' });
  }
  // Generate token and expiry
  const token = crypto.randomBytes(32).toString('hex');
  const tokenExpiry = new Date(Date.now() + 1000 * 60 * 30); // 30 min
  await prisma.user.update({
    where: { email },
    data: { resetToken: token, resetTokenExpiry: tokenExpiry } as any,
  });

  // Send email via Brevo
  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  try {
    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: 'CampusHub', email: 'noreply@campushub.com' },
        to: [{ email }],
        subject: 'CampusHub Password Reset',
        htmlContent: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 30 minutes.</p>`
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY || '',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (e) {
    console.error('Error sending Brevo email:', e);
  }
  return NextResponse.json({ message: 'If this email exists, a reset link will be sent.' });
}
