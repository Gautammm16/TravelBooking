// authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/appError.js'; // Create this error class (see below)

// Protect routes from unauthorized access
// export const protect = async (req, res, next) => {
//   try {
//     let token;
    
//     // 1) Get token from header or cookie
//     if (
//       req.headers.authorization &&
//       req.headers.authorization.startsWith('Bearer')
//     ) {
//       token = req.headers.authorization.split(' ')[1];
//     } else if (req.cookies.jwt) {
//       token = req.cookies.jwt;
//     }

//     // 2) Check if token exists
//     if (!token) {
//       return next(new AppError('Not authorized! Please log in.', 401));
//     }

//     // 3) Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // 4) Check if user still exists
//     const currentUser = await User.findById(decoded.id).select('+password');
//     if (!currentUser) {
//       return next(new AppError('User no longer exists.', 401));
//     }

//     // 5) Check if user changed password after token was issued
//     if (currentUser.changedPasswordAfter(decoded.iat)) {
//       return next(
//         new AppError('Password recently changed! Please log in again.', 401)
//       );
//     }

//     // 6) Check if account is active
//     if (!currentUser.active) {
//       return next(new AppError('Account is deactivated.', 403));
//     }

//     // Grant access
//     req.user = currentUser;
//     next();
//   } catch (err) {
//     next(err);
//   }
// };


export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (user.isActive === false) {
        return res.status(403).json({ message: 'Account is deactivated.' });
      }

      req.user = user;
      next();
    } catch (err) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'No token, authorization denied' });
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

// Restrict access to specific roles
// export const restrictTo = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return next(
//         new AppError('You do not have permission to perform this action.', 403)
//       );
//     }
//     next();
//   };
// };

// Add this to User model methods
// userModel.js
