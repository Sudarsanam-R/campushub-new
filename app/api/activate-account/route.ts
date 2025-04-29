import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// Account activation endpoint removed: activation is no longer required.
export async function POST(req: NextRequest) {
  return NextResponse.json({ error: 'Account activation is no longer required.' }, { status: 400 });
}
