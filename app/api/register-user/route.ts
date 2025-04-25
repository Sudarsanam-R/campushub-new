import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const activationToken = require('crypto').randomBytes(32).toString('hex');

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        activationToken,
        isActivated: false,
        isFirstLogin: true
      } as any,
    });
    // Send activation email via Brevo
    try {
      const axios = (await import('axios')).default;
      const activationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/activate?token=${activationToken}&email=${encodeURIComponent(email)}`;
      await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { name: 'CampusHub', email: 'noreply@campushub.com' },
          to: [{ email }],
          subject: 'Activate your CampusHub account',
          htmlContent: `<p>Welcome to CampusHub! Please <a href="${activationUrl}">activate your account</a> to get started.</p>`
        },
        {
          headers: {
            'api-key': process.env.BREVO_API_KEY || '',
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (e) {
      console.error('Error sending activation email:', e);
    }
    return NextResponse.json({ user });
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Unique constraint failed
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    if (process.env.NODE_ENV !== 'production') {
      // Log and return error for debugging
      console.error('Register User Error:', error);
      return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
