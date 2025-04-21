import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";

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

  await prisma.user.update({
    where: { email: session.user.email },
    data: {
      isFirstLogin: false,
      name: firstName && lastName ? `${firstName} ${lastName}` : undefined,
      dob,
      gender,
      phone,
      stream,
      degree,
      course,
      state,
      city,
      college,
      role
    },
  });

  return new Response("OK");
}
