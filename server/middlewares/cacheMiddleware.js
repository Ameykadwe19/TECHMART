const cacheUtils = require('../utils/cacheUtils');

// Generic cache middleware
const cache = (keyGenerator, ttl = 300) => {
  return async (req, res, next) => {
    try {
      // Generate cache key
      const cacheKey = typeof keyGenerator === 'function' 
        ? keyGenerator(req) 
        : keyGenerator;

      // Try to get from cache
      const cachedData = await cacheUtils.get(cacheKey);
      
      if (cachedData) {
        console.log(`Cache HIT: ${cacheKey}`);
        return res.json(cachedData);
      }

      console.log(`Cache MISS: ${cacheKey}`);

      // Store original res.json
      const originalJson = res.json;

      // Override res.json to cache response
      res.json = function(data) {
        // Cache the response
        cacheUtils.set(cacheKey, data, ttl).catch(console.error);
        
        // Call original res.json
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Specific cache middlewares
const cacheMiddleware = {
  // Product listing cache (5 minutes)
  products: cache((req) => {
    const { page = 1, limit = 10, search = '', category = '', minPrice = '', maxPrice = '' } = req.query;
    const filters = `${search}-${category}-${minPrice}-${maxPrice}`;
    return cacheUtils.keys.products(page, limit, filters);
  }, 300),

  // Search results cache (2 minutes)
  search: cache((req) => {
    const queryString = JSON.stringify(req.query);
    return cacheUtils.keys.search(queryString);
  }, 120),

  // User session cache (24 hours)
  userSession: cache((req) => cacheUtils.keys.userSession(req.user?.id), 86400)
};

// Cache invalidation helpers
const invalidateCache = {
  // Invalidate product caches when product is updated
  products: async () => {
    // Clear all product listing caches
    const patterns = ['products:*', 'search:*'];
    for (const pattern of patterns) {
      await cacheUtils.del(pattern);
    }
  },

  // Invalidate user session cache
  userSession: async (userId) => {
    await cacheUtils.del(cacheUtils.keys.userSession(userId));
  }
};

module.exports = {
  cache,
  cacheMiddleware,
  invalidateCache
};