const { Op } = require('sequelize');

// Debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Search utilities
const searchUtils = {
  // Create search conditions
  createSearchCondition: (searchTerm, fields) => {
    if (!searchTerm) return {};
    
    const conditions = fields.map(field => ({
      [field]: { [Op.iLike]: `%${searchTerm}%` }
    }));
    
    return { [Op.or]: conditions };
  },

  // Price range filter
  createPriceFilter: (minPrice, maxPrice) => {
    const priceFilter = {};
    
    if (minPrice) {
      priceFilter[Op.gte] = parseFloat(minPrice);
    }
    
    if (maxPrice) {
      priceFilter[Op.lte] = parseFloat(maxPrice);
    }
    
    return Object.keys(priceFilter).length > 0 ? { price: priceFilter } : {};
  },

  // Category filter
  createCategoryFilter: (categories) => {
    if (!categories || categories.length === 0) return {};
    
    return {
      category: {
        [Op.in]: Array.isArray(categories) ? categories : [categories]
      }
    };
  },

  // Sort options
  getSortOptions: (sortBy, sortOrder = 'ASC') => {
    const validSortFields = ['name', 'price', 'createdAt', 'rating'];
    const validSortOrders = ['ASC', 'DESC'];
    
    if (!validSortFields.includes(sortBy)) {
      sortBy = 'createdAt';
    }
    
    if (!validSortOrders.includes(sortOrder.toUpperCase())) {
      sortOrder = 'DESC';
    }
    
    return [[sortBy, sortOrder.toUpperCase()]];
  },

  // Pagination
  getPagination: (page = 1, limit = 10) => {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;
    
    return {
      limit: limitNum,
      offset: offset,
      page: pageNum
    };
  },

  // Build complete search query
  buildSearchQuery: (params) => {
    const { 
      search, 
      category, 
      minPrice, 
      maxPrice, 
      sortBy, 
      sortOrder, 
      page, 
      limit 
    } = params;

    const whereClause = {
      ...searchUtils.createSearchCondition(search, ['name', 'description']),
      ...searchUtils.createCategoryFilter(category),
      ...searchUtils.createPriceFilter(minPrice, maxPrice)
    };

    const orderClause = searchUtils.getSortOptions(sortBy, sortOrder);
    const pagination = searchUtils.getPagination(page, limit);

    return {
      where: whereClause,
      order: orderClause,
      ...pagination
    };
  }
};

// Debounced search function
const debouncedSearch = debounce(async (searchFunction, params, callback) => {
  try {
    const results = await searchFunction(params);
    callback(null, results);
  } catch (error) {
    callback(error, null);
  }
}, 300); // 300ms delay

module.exports = {
  searchUtils,
  debounce,
  debouncedSearch
};