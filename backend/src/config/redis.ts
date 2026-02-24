import Redis from "ioredis";

let redisClient: Redis | null = null;

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

const getRedisClient = (): Redis | null => {
  if (!redisClient) {
    redisClient = createRedisClient();
  }

  return redisClient;
};

export { getRedisClient };
