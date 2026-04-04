import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);

declare global {
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;