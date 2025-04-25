import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Map frontend camelCase to backend snake_case for Django
  const payload = {
    first_name: body.firstName,
    last_name: body.lastName,
    email: body.email,
    password: body.password,
    security_question: body.securityQuestion,
    security_answer: body.securityAnswer,
  };

  try {
    const response = await fetch('http://localhost:8000/api/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify(data), { status: response.status });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
