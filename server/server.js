const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

require('dotenv').config();

const sequelize = require('./config/db');
const db = require('./models');
const cacheUtils = require('./utils/cacheUtils');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS: Allow your frontend URL
app.use(cors());

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
// Public & Auth routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));

// Protected routes (user)
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Admin routes
app.use('/api/admin', require('./routes/adminRoutes'));

// File upload
app.use('/api/upload', require('./routes/uploadRoutes'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root route
app.get('/', (req, res) => {
  res.send('🛒 TechMart API is running!');
});

module.exports = app;

// Sync DB and Start Server (skip in test env)
if (process.env.NODE_ENV !== 'test') {
  (async () => {
    try {
      // First try to connect
      await sequelize.authenticate();
      console.log('✅ DB connected');

      // Sync database tables (normal sync)
      await db.sequelize.sync();
      console.log('✅ Database tables synced');

      // Initialize cache
      await cacheUtils.init();

      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });
    } catch (error) {
      console.error('❌ Unable to start server:', error);
    }
  })();
}
