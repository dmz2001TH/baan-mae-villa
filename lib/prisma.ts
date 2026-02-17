import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrisma() {
  const url = process.env.DATABASE_URL;
  const adapter = url ? new PrismaPg({ connectionString: url }) : undefined;
  return new PrismaClient({
    ...(adapter && { adapter }),
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

// Clear cached client so new models (e.g. Article) are available after schema changes
if (globalForPrisma.prisma && !(globalForPrisma.prisma as any).article) {
  globalForPrisma.prisma = undefined as any;
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
