import { prisma } from "../config/database";
import { getRedisClient } from "../config/redis";

const redisClient = getRedisClient();

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
