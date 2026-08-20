import Redis from 'ioredis';

let redisClient = null;
let isRedisReady = false;

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

try {
  redisClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1, 
    enableOfflineQueue: false, 
    retryStrategy(times) {
      if (times > 3) {
        console.warn('⚠️ [Redis] Reached max connection retries. Degrading to DB Mode.');
        return null; 
      }
      return Math.min(times * 200, 1000);
    },
  });

  redisClient.on('connect', () => {
    isRedisReady = true;
    console.log('[Redis] Connected successfully.');
  });

  redisClient.on('ready', () => {
    isRedisReady = true;
    console.log('[Redis] Client is ready for queries.');
  });

  redisClient.on('error', (err) => {
    isRedisReady = false;
    console.error('[Redis Error]:', err.message);
  });

  redisClient.on('end', () => {
    isRedisReady = false;
    console.warn('[Redis] Connection closed. Falling back to DB.');
  });
} catch (error) {
  isRedisReady = false;
  console.error('[Redis Client Init Failed]:', error);
}

export const checkRedisHealth = () => isRedisReady;
export default redisClient;