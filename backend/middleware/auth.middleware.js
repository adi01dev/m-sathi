
const jwt = require('jsonwebtoken');
const { AppError } = require('./error.middleware');
const User = require('../models/user.model');

/**
 * Protect routes - validate JWT token and attach user to request
 */
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return next(new AppError('Not authorized to access this route', 401));
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new AppError('User not found', 404));
      }
      
      // Add user to request object
      req.user = user;
      next();
      
    } catch (error) {
      return next(new AppError('Not authorized to access this route', 401));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Rate limiting middleware for API endpoints
 */
exports.rateLimiter = (limit, timeWindow) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    
    // Clear old requests
    if (requests.has(ip)) {
      const userRequests = requests.get(ip).filter(time => now - time < timeWindow);
      if (userRequests.length >= limit) {
        return next(new AppError(`Too many requests. Please try again in ${Math.ceil((timeWindow - (now - userRequests[0])) / 1000)} seconds.`, 429));
      }
      userRequests.push(now);
      requests.set(ip, userRequests);
    } else {
      requests.set(ip, [now]);
    }
    
    next();
  };
};
