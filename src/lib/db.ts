import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient;

const dbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";

if (dbUrl.includes("supabase") || dbUrl.startsWith("prisma+postgres") || dbUrl.startsWith("postgres")) {
  prismaInstance = new PrismaClient({
    log: ["error"],
  });
} else {
  // Local SQLite development with Prisma 7.x Driver Adapter
  const adapter = new PrismaBetterSqlite3({ url: dbUrl });
  prismaInstance = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? prismaInstance;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
export default db;
