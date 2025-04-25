import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const response = await axios.post('http://localhost:8000/api/forgot-password/', body, {
      headers: { 'Content-Type': 'application/json' },
    });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({ error: error?.response?.data || 'Failed to process request' }, { status: error?.response?.status || 500 });
  }
}
