import { PrismaClient } from '@prisma/client'

// A single Prisma instance, kept on globalThis so Vite's HMR does not open a
// new connection pool on every server reload.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
