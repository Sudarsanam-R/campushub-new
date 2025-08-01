import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const { email, token, password } = await req.json();
  if (!email || !token || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  // Proxy to Django backend
  const response = await fetch('http://localhost:3001/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, token, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }
  return NextResponse.json(data);
}
