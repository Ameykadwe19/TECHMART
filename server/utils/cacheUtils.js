const redis = require('redis');

// Redis client setup
let redisClient = null;

const initRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 2000, // 2 second timeout
        lazyConnect: true
      }
    });
    
    // Set timeout for connection
    const connectPromise = redisClient.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Redis connection timeout')), 3000)
    );
    
    await Promise.race([connectPromise, timeoutPromise]);
    console.log('✅ Redis connected');
    return redisClient;
  } catch (error) {
    console.log('❌ Redis not available, using memory cache');
    redisClient = null;
    return null;
  }
};

// Memory cache fallback
const memoryCache = new Map();

// Cache utilities
const cacheUtils = {
  // Initialize cache
  init: async () => {
    await initRedis();
  },

  // Set cache
  set: async (key, value, ttl = 300) => {
    try {
      const data = JSON.stringify(value);
      
      if (redisClient) {
        await redisClient.setEx(key, ttl, data);
      } else {
        // Memory cache with TTL
        memoryCache.set(key, {
          data,
          expires: Date.now() + (ttl * 1000)
        });
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  // Get cache
  get: async (key) => {
    try {
      if (redisClient) {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
      } else {
        // Memory cache
        const cached = memoryCache.get(key);
        if (cached && cached.expires > Date.now()) {
          return JSON.parse(cached.data);
        } else if (cached) {
          memoryCache.delete(key);
        }
        return null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  // Delete cache
  del: async (key) => {
    try {
      if (redisClient) {
        await redisClient.del(key);
      } else {
        memoryCache.delete(key);
      }
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  },

  // Clear all cache
  clear: async () => {
    try {
      if (redisClient) {
        await redisClient.flushAll();
      } else {
        memoryCache.clear();
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  },

  // Generate cache keys
  keys: {
    products: (page = 1, limit = 10, filters = '') => `products:${page}:${limit}:${filters}`,
    search: (query) => `search:${Buffer.from(query).toString('base64')}`,
    userSession: (userId) => `session:${userId}`
  }
};

module.exports = cacheUtils;