import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/authOptions';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Proxy to Django backend
  const response = await fetch('http://localhost:3001/me', {
    method: 'GET',
    headers: { ...req.headers },
  });
  if (!response.ok) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  const data = await response.json();
  return NextResponse.json(data);
}
