import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } }) as any;
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Optionally: create a session or JWT here for real authentication
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, isFirstLogin: user.isFirstLogin } });
}
