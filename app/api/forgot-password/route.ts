import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const fetchResponse = await fetch('http://localhost:8000/api/forgot-password/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await fetchResponse.json();
    return NextResponse.json(data, { status: fetchResponse.status });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to process request' }, { status: 500 });
  }
}
