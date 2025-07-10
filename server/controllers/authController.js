const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const emailUtils = require('../utils/emailUtils');

const generateToken = (user) => {
  const payload = { 
    id: user.id, 
    email: user.email, 
    role: user.role, 
    name: user.name 
  };
  
  console.log('Token payload:', payload);
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

exports.registerUser = async (req, res) => {
  try {
  
    
    const { email, password, name } = req.body;
    console.log('Registration request:', { email, name: name || 'MISSING' });

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ 
      where: { email },
      attributes: ['id', 'email', 'password', 'role', 'name'] // name added
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

   
    const user = await User.create({ email, password, name });
    console.log('Created user:', { id: user.id, email: user.email, name: user.name, role: user.role });
    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    // ... (same error handling code)
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ 
      where: { email },
      attributes: ['id', 'email', 'password', 'role', 'name'] // name added
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    // console.log('User from DB:', user);
    console.log('User from DB:', { id: user.id, email: user.email, name: user.name, role: user.role });
    console.log('Password Match:', isValidPassword);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

exports.sendResetLink = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Return error for non-existent users
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Generate simple reset token (for demo)
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token to user
    await User.update(
      { 
        resetPasswordToken: resetToken,
        resetPasswordExpires: expiresAt 
      },
      { where: { id: user.id } }
    );

    console.log('Saved to DB - Token:', resetToken);
    console.log('Expires at:', expiresAt);

    // Send email
    const emailResult = await emailUtils.sendResetEmail(email, resetToken);
    
    if (!emailResult.success) {
      return res.status(500).json({ message: 'Error sending email' });
    }

    res.json({ 
      message: 'Reset link sent to email',
      success: true 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending reset link', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Find user with valid reset token (direct comparison)
    console.log('Token from request:', token);
    
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('DB token:', user.resetPasswordToken);
      console.log('Expires at:', user.resetPasswordExpires);
      console.log('Current time:', new Date());
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password and clear reset token
    await User.update(
      {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      },
      { where: { id: user.id } }
    );

    // Send confirmation email
    await emailUtils.sendPasswordChangedEmail(user.email);

    res.json({ 
      message: 'Password reset successfully',
      success: true 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};