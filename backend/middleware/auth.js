import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication failed: Please login to continue',
      requiredAction: 'LOGIN'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    // attach full user record for role checks
    req.user = await User.findById(req.userId).select('-password');
    if (!req.user) return res.status(401).json({ 
      success: false, 
      message: 'User session expired. Please login again',
      requiredAction: 'RE_LOGIN'
    });
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Your session has expired. Please login again',
        requiredAction: 'RE_LOGIN'
      });
    }
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token. Please login again',
      requiredAction: 'RE_LOGIN'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication failed: Please login to continue',
        requiredAction: 'LOGIN'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied: Only ${roles.join(' or ')} can perform this action. Your role is: ${req.user.role}`,
        requiredAction: 'INSUFFICIENT_PERMISSIONS',
        userRole: req.user.role,
        requiredRoles: roles
      });
    }
    next();
  };
};

export default protect;
