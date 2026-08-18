import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import TenantSettings from '../models/TenantSettings.js';
import redisClient from '../lib/redis.js';
import { getTenantSettings,updateTenantSettings } from '../controllers/tenantSettings.controller.js';
// import { getTenantSettings, updateTenantSettings } from '../controllers/tenantSettingsController.js';

let mongoServer;

// Mock Response & Request Objects for Express Controller Testing
const mockRequest = (params = {}, body = {}) => ({
  params,
  body,
});

const mockResponse = () => {
  const res = {};
  res.headers = {};
  res.statusCode = 200;
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.setHeader = (key, val) => {
    res.headers[key] = val;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

describe('Tenant Settings Redis Caching & Invalidation Test Suite', () => {
  beforeAll(async () => {
    // 1. Setup In-Memory Mongo DB
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    if (redisClient && redisClient.status === 'ready') {
      await redisClient.quit();
    }
  });

  afterEach(async () => {
    await TenantSettings.deleteMany({});
    if (redisClient && redisClient.status === 'ready') {
      await redisClient.flushall(); // Clear Redis keys after each test
    }
  });

  // -------------------------------------------------------------
  // TEST 1: Cache Miss followed by Cache Hit
  // -------------------------------------------------------------
  test('Should fetch from DB on first call (Cache Miss) and from Redis on second call (Cache Hit)', async () => {
    const subdomain = 'test_tenant_1';
    const req = mockRequest({ subdomain });

    // 1st Hit - Cache Miss (Fetches from DB and populates Redis)
    const res1 = mockResponse();
    await getTenantSettings(req, res1);

    expect(res1.statusCode).toBe(200);
    expect(res1.body.source).toBe('db');
    expect(res1.body.data.subdomain).toBe(subdomain);

    // 2nd Hit - Cache Hit (Should return directly from Redis)
    const res2 = mockResponse();
    await getTenantSettings(req, res2);

    expect(res2.statusCode).toBe(200);
    expect(res2.body.source).toBe('cache');
    expect(res2.body.data.subdomain).toBe(subdomain);
  });

  // -------------------------------------------------------------
  // TEST 2: Cache Invalidation on Settings Update
  // -------------------------------------------------------------
  test('Should invalidate Redis cache when tenant settings are updated', async () => {
    const subdomain = 'test_tenant_2';

    // Populate Cache first
    const getReq = mockRequest({ subdomain });
    const getRes = mockResponse();
    await getTenantSettings(getReq, getRes);
    expect(getRes.body.source).toBe('db');

    // Update Settings (e.g., Change App Name & Theme Color)
    const updateReq = mockRequest(
      { subdomain },
      { appName: 'Updated SaaS Name', themeColor: '#10b981' }
    );
    const updateRes = mockResponse();
    await updateTenantSettings(updateReq, updateRes);

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.data.appName).toBe('Updated SaaS Name');
    expect(updateRes.body.data.themeColor).toBe('#10b981');

    // Read again - Should retrieve the newly updated data from updated cache
    const freshGetRes = mockResponse();
    await getTenantSettings(getReq, freshGetRes);

    expect(freshGetRes.body.source).toBe('cache');
    expect(freshGetRes.body.data.appName).toBe('Updated SaaS Name');
    expect(freshGetRes.body.data.themeColor).toBe('#10b981');
  });

  // -------------------------------------------------------------
  // TEST 3: Graceful Degradation (DB Fallback if Redis fails)
  // -------------------------------------------------------------
  test('Should seamlessly fall back to MongoDB if Redis connection fails or is offline', async () => {
    const subdomain = 'test_tenant_3';

    // Simulate Redis Disconnection
    if (redisClient) {
      await redisClient.disconnect();
    }

    const req = mockRequest({ subdomain });
    const res = mockResponse();
    await getTenantSettings(req, res);

    // Should return DB Fallback instead of crashing
    expect(res.statusCode).toBe(200);
    expect(res.body.source).toBe('db');
    expect(res.body.data.subdomain).toBe(subdomain);
  });
});