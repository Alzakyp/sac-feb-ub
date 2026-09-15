import Redis, { RedisOptions } from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
  isReady: boolean;
};

const redisOptions: RedisOptions = {
  maxRetriesPerRequest: 1,
  connectTimeout: 2000,
  enableReadyCheck: true,
  lazyConnect: true,
  retryStrategy(times: number) {
    // Retry up to 5 times with exponential backoff, max 3 seconds delay
    if (times > 5) {
      return null; // stop retrying
    }
    return Math.min(times * 300, 3000);
  },
};

export const redis =
  globalForRedis.redis ??
  new Redis(REDIS_URL, redisOptions);

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

let isConnected = false;

redis.on('connect', () => {
  isConnected = true;
  globalForRedis.isReady = true;
  console.log('[Redis] Connected to Redis instance:', REDIS_URL);
});

redis.on('ready', () => {
  isConnected = true;
  globalForRedis.isReady = true;
});

redis.on('error', (err) => {
  isConnected = false;
  globalForRedis.isReady = false;
  // Non-blocking log so application does not crash
  console.warn('[Redis] Warning (Redis is unreachable or down):', err.message);
});

redis.on('close', () => {
  isConnected = false;
  globalForRedis.isReady = false;
});

// Auto connect if not already connected
if (redis.status === 'wait') {
  redis.connect().catch((err) => {
    console.warn('[Redis] Initial connect deferred or failed:', err.message);
  });
}

/**
 * Check if Redis is currently connected and responsive
 */
export function isRedisReady(): boolean {
  return isConnected || redis.status === 'ready' || redis.status === 'connect';
}

/**
 * Get cached JSON data by key. Returns null on cache miss or when Redis is offline.
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    if (!isRedisReady() && redis.status !== 'ready') {
      return null;
    }
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    console.warn(`[Redis] getCache error for key "${key}":`, (error as Error).message);
    return null;
  }
}

/**
 * Set cached JSON data with TTL (Time To Live) in seconds. Defaults to 600s (10 minutes).
 */
export async function setCache(
  key: string,
  data: unknown,
  ttlSeconds: number = 600
): Promise<boolean> {
  try {
    if (!isRedisReady() && redis.status !== 'ready') {
      return false;
    }
    const payload = JSON.stringify(data);
    await redis.set(key, payload, 'EX', ttlSeconds);
    return true;
  } catch (error) {
    console.warn(`[Redis] setCache error for key "${key}":`, (error as Error).message);
    return false;
  }
}

/**
 * Delete a cache key or keys matching pattern
 */
export async function delCache(key: string): Promise<boolean> {
  try {
    if (!isRedisReady() && redis.status !== 'ready') {
      return false;
    }
    await redis.del(key);
    return true;
  } catch (error) {
    console.warn(`[Redis] delCache error for key "${key}":`, (error as Error).message);
    return false;
  }
}
