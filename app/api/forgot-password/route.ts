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


  return NextResponse.json({ message: 'If this email exists, a reset link will be sent.' });
}
