const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email transporter setup
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });
};

// Generate reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Email templates
const emailTemplates = {
  resetPassword: (resetUrl, userEmail) => ({
    from: process.env.EMAIL_USER || 'noreply@yourapp.com',
    to: userEmail,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" 
           style="background-color: #007bff; color: white; padding: 10px 20px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `
  }),

  passwordChanged: (userEmail) => ({
    from: process.env.EMAIL_USER || 'noreply@yourapp.com',
    to: userEmail,
    subject: 'Password Changed Successfully',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Changed</h2>
        <p>Your password has been successfully changed.</p>
        <p>If you didn't make this change, please contact support immediately.</p>
      </div>
    `
  })
};

// Email utilities
const emailUtils = {
  // Send reset password email
  sendResetEmail: async (userEmail, resetToken) => {
    try {
      const transporter = createTransporter();
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      const mailOptions = emailTemplates.resetPassword(resetUrl, userEmail);
      
      const result = await transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email sending error:', error);
      return { success: false, error: error.message };
    }
  },

  // Send password changed confirmation
  sendPasswordChangedEmail: async (userEmail) => {
    try {
      const transporter = createTransporter();
      const mailOptions = emailTemplates.passwordChanged(userEmail);
      
      const result = await transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email sending error:', error);
      return { success: false, error: error.message };
    }
  },

  // Generate and hash reset token
  generateResetToken: () => {
    const token = generateResetToken();
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    return {
      token, // Send this to user
      hashedToken, // Store this in DB
      expiresAt
    };
  },

  // Verify reset token
  verifyResetToken: (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
};

module.exports = emailUtils;