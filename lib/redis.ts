import { createClient } from 'redis';

let redisClient: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error', err);
    });

    await redisClient.connect();
    console.log('Connected to Redis');
    return redisClient;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    throw error;
  }
}

export async function closeRedisClient() {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
  }
}

// Cache helper functions
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const client = await getRedisClient();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

export async function setCached<T>(
  key: string,
  value: T,
  ttlSeconds: number = 3600
): Promise<boolean> {
  try {
    const client = await getRedisClient();
    await client.setEx(key, ttlSeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Redis set error:', error);
    return false;
  }
}

export async function deleteCached(key: string): Promise<boolean> {
  try {
    const client = await getRedisClient();
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Redis delete error:', error);
    return false;
  }
}

export async function invalidatePattern(pattern: string): Promise<number> {
  try {
    const client = await getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
      return keys.length;
    }
    return 0;
  } catch (error) {
    console.error('Redis invalidate pattern error:', error);
    return 0;
  }
}
