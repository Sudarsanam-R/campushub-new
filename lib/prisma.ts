import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"], // Optional: logs SQL queries in dev mode
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma
