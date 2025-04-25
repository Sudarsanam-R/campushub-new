import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword
    },
  });
  return NextResponse.json({ message: 'Password reset successful' });
}
