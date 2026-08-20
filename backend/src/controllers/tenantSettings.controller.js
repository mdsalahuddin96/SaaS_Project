
import redisClient, { checkRedisHealth } from '../lib/redis.js';
import TenantSettings from '../models/TenantSettings.js';

const CACHE_TTL = 3600; 
// Unique key per tenant
const getCacheKey = (subdomain) => `tenant:${subdomain}:settings`;

// GET /api/tenant-settings/:subdomain
export const getTenantSettings = async (req, res) => {
  try {
    const { subdomain } = req.params;

    if (!subdomain) {
      return res.status(400).json({ error: 'Subdomain is required' });
    }

    const cacheKey = getCacheKey(subdomain);
    const isRedisActive = checkRedisHealth();

    // 1. Try fetching from Redis Cache (Cache-Aside Pattern)
    if (isRedisActive) {
      try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          res.setHeader('X-Data-Source', 'cache');
          return res.status(200).json({
            source: 'cache',
            data: JSON.parse(cachedData),
          });
        }
      } catch (err) {
        console.warn(`[Redis Read Error for ${subdomain}]: Falling back to DB`, err.message);
      }
    }

    // 2. Fetch from MongoDB (Cache Miss or Redis Down)
    let settings = await TenantSettings.findOne({ subdomain });

    if (!settings) {
      settings = await TenantSettings.create({ subdomain });
    }

    const plainData = settings.toObject();

    // 3. Write to Redis if Redis is active
    if (isRedisActive) {
      try {
        await redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(plainData));
      } catch (err) {
        console.warn(`[Redis Write Error for ${subdomain}]:`, err.message);
      }
    }

    const source = isRedisActive ? 'db' : 'db-fallback';
    res.setHeader('X-Data-Source', source);

    return res.status(200).json({
      source,
      data: plainData,
    });
  } catch (error) {
    console.error('[GET Tenant Settings Error]:', error);
    return res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

// PUT /api/tenant-settings/:subdomain
export const updateTenantSettings = async (req, res) => {
  try {
    const { subdomain } = req.params;
    const updates = req.body;

    if (!subdomain) {
      return res.status(400).json({ error: 'Subdomain is required' });
    }

    const cacheKey = getCacheKey(subdomain);
    const isRedisActive = checkRedisHealth();

    // 1. Database Update (Source of Truth)
    const updatedSettings = await TenantSettings.findOneAndUpdate(
      { subdomain },
      { $set: updates },
      { upsert: true, returnDocument: 'after', runValidators: true }
    ).lean();

    // 2. Cache Invalidation Strategy
    if (isRedisActive) {
      try {
        // Invalidate old cache and set updated value
        await redisClient.del(cacheKey);
        await redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(updatedSettings));
        console.log(`🧹 [Cache Invalidated & Updated] Key: ${cacheKey}`);
      } catch (err) {
        console.warn(`[Redis Invalidation Error for ${subdomain}]:`, err.message);
      }
    }

    const source = isRedisActive ? 'cache-updated' : 'db-updated';
    res.setHeader('X-Data-Source', source);

    return res.status(200).json({
      source,
      data: updatedSettings,
    });
  } catch (error) {
    console.error('[UPDATE Tenant Settings Error]:', error);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
};