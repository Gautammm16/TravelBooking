// authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/appError.js'; // Create this error class (see below)

export const protect = async (req, res, next) => {
  let token;

  // 1. Check if Authorization header is present
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 2. Extract and verify token
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Fetch user
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        console.log('User not found from decoded token');
        return next(new AppError('User not found', 401));
      }

      // 4. Check if user is deactivated
      if (user.isActive === false) {
        console.log('User account is deactivated');
        return next(new AppError('Account is deactivated', 403));
      }

      // 5. Attach user to request
      req.user = user;
      next();
    } catch (err) {
      console.error('Token verification failed:', err.message);
      return next(new AppError('Not authorized, token failed', 401));
    }
  } else {
    console.warn('No authorization header present');
    return next(new AppError('No token, authorization denied', 401));
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'You do not have permission to perform this action.'
      });
    }
    next();
  };
};


export const isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify the token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // There is a logged in user
      req.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};