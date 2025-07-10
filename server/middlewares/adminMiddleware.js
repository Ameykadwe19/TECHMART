exports.isAdmin = (req, res, next) => {
  console.log('isAdmin middleware - User:', req.user);
  
  if (!req.user) {
    console.log('No user object in request');
    return res.status(403).json({ success: false, message: 'Authentication required' });
  }
  
  if (req.user.role === 'admin') {
    console.log('Admin access granted');
    return next();
  }
  
  console.log('Admin access denied - user role:', req.user.role);
  return res.status(403).json({ success: false, message: 'Admin access only' });
};
