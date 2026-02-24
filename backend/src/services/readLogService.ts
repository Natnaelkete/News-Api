import { prisma } from "../config/database";
import Redis from "ioredis";

const createRedisClient = (): Redis | null => {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    return new Redis(redisUrl, { maxRetriesPerRequest: 3 });
  }

  const host = process.env.REDIS_HOST;
  const port = process.env.REDIS_PORT
    ? Number(process.env.REDIS_PORT)
    : undefined;

  if (host && port) {
    return new Redis({
      host,
      port,
      password: process.env.REDIS_PASSWORD || undefined,
    });
  }

  return null;
};

const redisClient = createRedisClient();

const shouldLogRead = async (key: string): Promise<boolean> => {
  if (!redisClient) {
    return true;
  }

  const result = await redisClient.set(key, "1", "EX", 300, "NX");
  return result === "OK";
};

const createReadLog = async (
  articleId: string,
  readerId?: string,
  readerKey?: string,
): Promise<void> => {
  const key = readerKey ? `read:${readerKey}:${articleId}` : null;

  if (key) {
    const allowed = await shouldLogRead(key);
    if (!allowed) {
      return;
    }
  }

  await prisma.readLog.create({
    data: {
      articleId,
      readerId: readerId || null,
    },
  });
};

export { createReadLog };
