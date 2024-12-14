import { createClient } from 'redis';

const requiredEnvVars = [
  "REDIS_URL",
];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
  process.exit(1);
}

const redisUrl = process.env.REDIS_URL;

let redisClient: ReturnType<typeof createClient> | null = null;

async function connectToRedis() {
  if (!redisClient) {
    redisClient = createClient({
      url: redisUrl,
    });

    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    await redisClient.connect();
    console.log('Connected to Redis');
  }

  return redisClient;
}

async function getRedisInstance(): Promise<ReturnType<typeof createClient>> {
  if (!redisClient) {
    await connectToRedis();
  }

  if (!redisClient) {
    throw new Error('Redis client is not connected');
  }

  return redisClient;
}

export { connectToRedis, getRedisInstance };
