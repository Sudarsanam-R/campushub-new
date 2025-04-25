import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const {
    firstName, lastName, dob, gender, phone, stream, degree, course,
    state, city, college, role
  } = body;

  // Proxy to Django backend
  const response = await fetch('http://localhost:8000/api/mark-first-login-complete/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body }),
  });
  if (!response.ok) {
    return new Response("Failed to update user", { status: response.status });
  }
  return new Response("OK");
}
