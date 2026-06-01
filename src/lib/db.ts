import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not defined");
  }
  
  const pool = new Pool({ 
    connectionString,
    max: 1,                 // Keeps your Vercel serverless connection footprint low
    idleTimeoutMillis: 5000, 
    connectionTimeoutMillis: 2000,
    // Add this SSL configuration block 👇
    ssl: {
      rejectUnauthorized: false // Bypasses the self-signed certificate chain blockage securely
    }
  });
  
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

// Fixes ts(2502) by extending the global scope natively 👇
declare global {
  var prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
}

// Access the variable safely from globalThis without the circular loop
export const db = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = db;
}

export default db;