import IdempotencyKey from '../models/IdempotencyKey.js';

export const idempotency = async (req, res, next) => {
  // Check idempotency only for non-safe HTTP methods (POST, PUT, PATCH, DELETE, etc.)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const idempotencyKey = req.headers['x-idempotency-key'];

  // If no idempotency key is provided by the client, proceed with the request normally
  if (!idempotencyKey) {
    return next();
  }

  try {
    const compositeKey = `${req.tenantId}_${idempotencyKey}`;

    // 1. Check if a request with this key has already been successfully processed
    const existingKey = await IdempotencyKey.findOne({ key: compositeKey });

    if (existingKey) {
      // If previously processed, return the cached response without creating a new entry in the database
      return res.status(existingKey.statusCode).json(existingKey.responseBody);
    }

    // 2. Override the original res.json method to cache the response before sending it
    const originalJson = res.json;

    res.json = function (body) {
      // Cache only successful responses (2xx Status Codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        IdempotencyKey.create({
          key: compositeKey,
          tenantId: req.tenantId,
          statusCode: res.statusCode,
          responseBody: body,
        }).catch((err) => {
          console.error('Failed to save idempotency key:', err.message);
        });
      }

      return originalJson.call(this, body);
    };

    next();
  } catch (error) {
    next(error);
  }
};