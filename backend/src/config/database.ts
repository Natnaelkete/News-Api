import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const connectDatabase = async (): Promise<void> => {
  await prisma.$connect();
};

export { prisma, connectDatabase };
