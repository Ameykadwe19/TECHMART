const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { registerUser, loginUser, sendResetLink, resetPassword } = require('../controllers/authController');
const router = express.Router();







router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', sendResetLink);
router.post('/reset-password', resetPassword);

// Add a route to get current user info
router.get('/me', protect, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      name: req.user.name
    }
  });
});






module.exports = router; 