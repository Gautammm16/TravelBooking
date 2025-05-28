// authMiddleware.js
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import User from '../models/User.js';
import AppError from '../utils/appError.js';

// Protect middleware - requires token for access
export const protect = async (req, res, next) => {
  let token;

  // 1. Check for Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    console.warn('No token provided in headers');
    return next(new AppError('No token, authorization denied', 401));
  }

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find user by decoded ID
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      console.warn('User not found from decoded token');
      return next(new AppError('User not found', 401));
    }

    // 4. Check if user is deactivated
    if (user.isActive === false) {
      console.warn(`User ${user.email} is deactivated`);
      return next(new AppError('Account is deactivated', 403));
    }

    // 5. Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return next(new AppError('Not authorized, token failed', 401));
  }
};

// Role-based access control middleware
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.warn(
        `Access denied. User role "${req.user.role}" is not allowed. Required roles: ${roles.join(', ')}`
      );
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action.'
      });
    }
    next();
  };
};

// Middleware to check if user is logged in (used for rendering views)
export const isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1. Verify token from cookies
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2. Find user
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) return next();

      // 3. Check if password changed after token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) return next();

      // 4. User is logged in
      req.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};
