import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// Account activation endpoint removed: activation is no longer required.
export async function POST(req: NextRequest) {
  const response = await fetch('http://localhost:3001/activate-account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(await req.json()),
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
