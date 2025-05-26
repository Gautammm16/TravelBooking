// import User from '../models/User.js';
// import AppError from '../utils/appError.js';
// import catchAsync from '../utils/catchAsync.js';
// import jwt from 'jsonwebtoken';
// import cloudinary from '../utils/cloudinary.js';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// const signToken = id => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES || '30d'
//   });
// };


// export const googleLogin = catchAsync(async (req, res, next) => {
//   const { token } = req.body;
//   if (!token) return next(new AppError('Google token is required', 400));

//   const ticket = await client.verifyIdToken({
//     idToken: token,
//     audience: [
//       process.env.GOOGLE_CLIENT_ID,
//       process.env.VITE_GOOGLE_CLIENT_ID
//     ]
//   });

//   const payload = ticket.getPayload();
//   if (!['accounts.google.com', 'https://accounts.google.com'].includes(payload.iss)) {
//     return next(new AppError('Invalid token issuer', 401));
//   }

//   if (payload.exp * 1000 < Date.now()) {
//     return next(new AppError('Google token has expired', 401));
//   }

//   const { email, given_name, family_name, picture, sub: googleId } = payload;

//   let user = await User.findOne({ email });

//   if (!user) {
//     // Create user with names from Google if they exist
//     user = await User.create({
//       email,
//       firstName: given_name || '',
//       lastName: family_name || '',
//       avatar: picture,
//       socialMedia: {
//         googleId,
//         googlePhoto: picture
//       },
//       isVerified: true
//     });
//   } else {
//     // Update user if needed
//     user.socialMedia = user.socialMedia || {};

//     if (!user.socialMedia.googleId) user.socialMedia.googleId = googleId;
//     if (!user.socialMedia.googlePhoto) user.socialMedia.googlePhoto = picture;
//     if (!user.avatar) user.avatar = picture;
//     if (!user.firstName && given_name) user.firstName = given_name;
//     if (!user.lastName && family_name) user.lastName = family_name;
//     if (!user.isVerified) user.isVerified = true;

//     await user.save({ validateBeforeSave: false });
//   }

//   const authToken = signToken(user._id);
//   res.status(200).json({
//     status: 'success',
//     token: authToken,
//     data: { user }
//   });
// });


// // Register (for local users only)
// export const register = catchAsync(async (req, res, next) => {
//   if (req.body.email === 'admin@example.com') {
//     return next(new AppError('Admin registration is not allowed', 403));
//   }

//   const newUser = await User.create(req.body);
//   const token = signToken(newUser._id);

//   res.status(201).json({
//     status: 'success',
//     token,
//     data: { user: newUser }
//   });
// });

// // Local login
// export const login = catchAsync(async (req, res, next) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return next(new AppError('Please provide email and password!', 400));
//   }

//   const user = await User.findOne({ email }).select('+password');

//   if (!user || !(await user.correctPassword(password, user.password))) {
//     return next(new AppError('Incorrect email or password', 401));
//   }

//   if (email === 'admin@example.com' && user.role !== 'admin') {
//     return next(new AppError('Admin access denied', 403));
//   }

//   if (email === 'admin@example.com' && password !== 'admin123') {
//     return next(new AppError('Invalid admin credentials', 401));
//   }

//   const token = signToken(user._id);
//   res.status(200).json({
//     status: 'success',
//     token,
//     data: { user }
//   });
// });

// // Get all users
// export const getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();
//   res.status(200).json({
//     status: 'success',
//     results: users.length,
//     data: { users }
//   });
// });

// // Update user profile
// export const updateUser = catchAsync(async (req, res, next) => {
//   const disallowedFields = [
//     'password', 'passwordConfirm', 'role', 'verificationToken',
//     'verificationTokenExpires', 'passwordResetToken', 'passwordResetExpires',
//     'bookings', 'wishlist', 'active', 'createdAt', 'socialMedia'
//   ];

//   const fieldMap = {
//     firstname: 'firstName',
//     lastname: 'lastName',
//     email: 'email',
//     phone: 'phoneNumber',
//     dob: 'dob',
//     gender: 'gender',
//     address: 'address',
//     preferences: 'preferences'
//   };

//   const updateData = {};
//   Object.keys(req.body).forEach(key => {
//     const normalizedKey = fieldMap[key] || key;
//     if (!disallowedFields.includes(normalizedKey)) {
//       updateData[normalizedKey] = req.body[key];
//     }
//   });

//   if (req.file) {
//     const result = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { folder: 'users' },
//         (error, result) => {
//           if (error) reject(error);
//           else resolve(result);
//         }
//       );
//       stream.end(req.file.buffer);
//     });
//     updateData.avatar = result.secure_url;
//   }

//   const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
//     new: true,
//     runValidators: true
//   });

//   if (!updatedUser) {
//     return next(new AppError('No user found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: { user: updatedUser }
//   });
// });

// // Delete user
// export const deleteUser = catchAsync(async (req, res, next) => {
//   const user = await User.findByIdAndDelete(req.params.id);
//   if (!user) return next(new AppError('No user found with that ID', 404));
//   res.status(204).json({ status: 'success', data: null });
// });

// // Admin stats by role
// export const getAdminStats = catchAsync(async (req, res, next) => {
//   const stats = await User.aggregate([
//     { $group: { _id: '$role', numUsers: { $sum: 1 } } }
//   ]);
//   res.status(200).json({ status: 'success', data: { stats } });
// });

// // Get current user info
// export const getMe = (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     data: { user: req.user }
//   });
// };



import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { promisify } from 'util';
import User from '../models/User.js';
import AppError from '../utils/appError.js';

// Helper to sign JWT
const signToken = id => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN
});

// Send token and response
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };
  res.cookie('jwt', token, cookieOptions);

  user.password = undefined; // hide password in response

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user }
  });
};

// Register User
// export const register = async (req, res, next) => {
//   try {
//     const newUser = await User.create(req.body);

//     if (!newUser.socialMedia?.googleId) {
//       const otp = newUser.createEmailVerificationOTP();
//       await newUser.save({ validateBeforeSave: false });
//       // Send OTP via email here
//       console.log('Email OTP:', otp);
//     }

//     createSendToken(newUser, 201, res);
//   } catch (err) {
//     next(err);
//   }
// };

import { sendOTPEmail } from '../utils/emailService.js';

export const register = async (req, res, next) => {
  try {
    const newUser = await User.create(req.body);

    if (!newUser.socialMedia?.googleId) {
      const otp = newUser.createEmailVerificationOTP();
      await newUser.save({ validateBeforeSave: false });
      
      // Send OTP via email
      await sendOTPEmail(newUser.email, otp);
    }

    res.status(201).json({
      status: 'success',
      message: 'User registered. OTP sent to email.',
      data: { user: newUser }
    });

  } catch (err) {
    // Handle errors
     next(err);
  }
};

// Login User
// export const login = async (req, res, next) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return next(new AppError('Please provide email and password', 400));
//   }

//   const user = await User.findOne({ email }).select('+password');

//   if (!user || !(await user.correctPassword(password, user.password))) {
//     return next(new AppError('Incorrect email or password', 401));
//   }

//   if (!user.isVerified) {
//     return next(new AppError('Please verify your email first.', 401));
//   }

//   createSendToken(user, 200, res);
// };
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ email }).select('+password +isVerified +role');
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // 2. Skip verification check for admin
    const isAdmin = email === 'admin@example.com' && user.role === 'admin';
    
    if (!user.isVerified && !isAdmin) {
      return res.status(401).json({
        status: 'unverified',
        message: 'Please verify your email first',
        email: user.email
      });
    }

    // 3. Proceed with login
    const token = signToken(user._id);
    res.status(200).json({
      status: 'success',
      token,
      data: { user }
    });

  } catch (err) {
    next(err);
  }
};

// Google Login
// export const googleLogin = async (req, res, next) => {
//   const { googleId, email, googlePhoto } = req.body;

//   let user = await User.findOne({ email });

//   if (!user) {
//     user = await User.create({
//       email,
//       isVerified: true,
//       socialMedia: { googleId, googlePhoto }
//     });
//   }

//   createSendToken(user, 200, res);
// };





export const googleLogin = async (req, res, next) => {
  const { token } = req.body;
  if (!token) return next(new AppError('Google token is required', 400));

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: [
      process.env.GOOGLE_CLIENT_ID,
      process.env.VITE_GOOGLE_CLIENT_ID
    ]
  });

  const payload = ticket.getPayload();
  if (!['accounts.google.com', 'https://accounts.google.com'].includes(payload.iss)) {
    return next(new AppError('Invalid token issuer', 401));
  }

  if (payload.exp * 1000 < Date.now()) {
    return next(new AppError('Google token has expired', 401));
  }

  const { email, given_name, family_name, picture, sub: googleId } = payload;

  let user = await User.findOne({ email });

  if (!user) {
    // Create user with names from Google if they exist
    user = await User.create({
      email,
      firstName: given_name || '',
      lastName: family_name || '',
      avatar: picture,
      socialMedia: {
        googleId,
        googlePhoto: picture
      },
      isVerified: true
    });
  } else {
    // Update user if needed
    user.socialMedia = user.socialMedia || {};

    if (!user.socialMedia.googleId) user.socialMedia.googleId = googleId;
    if (!user.socialMedia.googlePhoto) user.socialMedia.googlePhoto = picture;
    if (!user.avatar) user.avatar = picture;
    if (!user.firstName && given_name) user.firstName = given_name;
    if (!user.lastName && family_name) user.lastName = family_name;
    if (!user.isVerified) user.isVerified = true;

    await user.save({ validateBeforeSave: false });
  }

  const authToken = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token: authToken,
    data: { user }
  });
};

// Verify Email OTP
// export const verifyEmailOTP = async (req, res, next) => {
//   const { email, otp } = req.body;

//   const user = await User.findOne({ email }).select('+emailVerificationOTP +emailVerificationOTPExpires +otpAttempts +otpBlockedUntil');

//   if (!user) return next(new AppError('User not found', 404));

//   try {
//     const success = user.verifyEmailOTP(otp);
//     await user.save({ validateBeforeSave: false });

//     if (success) {
//       res.status(200).json({ status: 'success', message: 'Email verified successfully.' });
//     } else {
//       return next(new AppError('Invalid OTP', 400));
//     }
//   } catch (err) {
//     return next(new AppError(err.message, 400));
//   }
// };


export const verifyEmailOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // 1. Find user by email (no auth required)
    const user = await User.findOne({ email })
      .select('+emailVerificationOTP +emailVerificationOTPExpires +isVerified');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // 2. Verify OTP using model method
    const isValid = user.verifyEmailOTP(otp);
    if (!isValid) {
      return next(new AppError('Invalid OTP', 400));
    }

    await user.save({ validateBeforeSave: false });

    // 3. Generate token after verification
    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      data: { user }
    });

  } catch (err) {
    next(err);
  }
};

// Resend Email OTP
export const resendEmailOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Validate email input
    if (!email) {
      return next(new AppError('Please provide an email address', 400));
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+emailVerificationOTP +emailVerificationOTPExpires +otpAttempts +otpBlockedUntil');
    
    if (!user) {
      return next(new AppError('No user found with this email address', 404));
    }

    // Check if already verified
    if (user.isVerified) {
      return next(new AppError('This email is already verified', 400));
    }

    // Check if user is blocked from requesting OTPs
    if (user.otpBlockedUntil && user.otpBlockedUntil > Date.now()) {
      const timeLeft = Math.ceil((user.otpBlockedUntil - Date.now()) / (60 * 1000));
      return next(new AppError(`Too many attempts. Try again in ${timeLeft} minutes`, 429));
    }

    // Generate new OTP
    const otp = user.createEmailVerificationOTP();
    await user.save({ validateBeforeSave: false });

    // Send OTP via email (replace with your actual email service)
    await sendOTPEmail(user.email, otp);
    console.log('Resent Email OTP:', otp); // Remove in production

    res.status(200).json({ 
      status: 'success', 
      message: 'OTP resent successfully',
      email: user.email // Return email for frontend confirmation
    });

  } catch (err) {
    console.error('Error resending OTP:', err);
    return next(new AppError('Failed to resend OTP. Please try again.', 500));
  }
};
// Forgot Password (OTP)
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) return next(new AppError('User not found', 404));

  const otp = user.createPasswordResetOTP();
  await user.save({ validateBeforeSave: false });

  // Send OTP via email
  console.log('Password reset OTP:', otp);

  res.status(200).json({ status: 'success', message: 'Password reset OTP sent.' });
};

// Reset Password via OTP
// export const resetPassword = async (req, res, next) => {
//   const { email, otp, newPassword } = req.body;

//   const user = await User.findOne({ email }).select('+password +passwordResetOTP +passwordResetOTPExpires');

//   if (!user) return next(new AppError('User not found', 404));

//   try {
//     const isValid = user.verifyPasswordResetOTP(otp);
//     if (!isValid) return next(new AppError('Invalid OTP', 400));
//   } catch (err) {
//     return next(new AppError(err.message, 400));
//   }

//   user.password = newPassword;
//   user.passwordConfirm = newPassword;
//   user.passwordResetOTP = undefined;
//   user.passwordResetOTPExpires = undefined;

//   await user.save();

//   createSendToken(user, 200, res);
// };

// Update Password (Logged In User)
export const updatePassword = async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  const { currentPassword, newPassword } = req.body;

  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError('Current password is incorrect', 401));
  }

  user.password = newPassword;
  user.passwordConfirm = newPassword;
  await user.save();

  createSendToken(user, 200, res);
};

export const deleteUser = async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(new AppError('No user found with that ID', 404));
  res.status(204).json({ status: 'success', data: null });
};

// Admin stats by role
export const getAdminStats = async (req, res, next) => {
  const stats = await User.aggregate([
    { $group: { _id: '$role', numUsers: { $sum: 1 } } }
  ]);
  res.status(200).json({ status: 'success', data: { stats } });
};


 export const getAllUsers = async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users }
  });
};

// Logout
export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ status: 'success' });
};


export const updateUser = async (req, res, next) => {
  const disallowedFields = [
    'password', 'passwordConfirm', 'role', 'verificationToken',
    'verificationTokenExpires', 'passwordResetToken', 'passwordResetExpires',
    'bookings', 'wishlist', 'active', 'createdAt', 'socialMedia'
  ];

  const fieldMap = {
    firstname: 'firstName',
    lastname: 'lastName',
    email: 'email',
    phone: 'phoneNumber',
    dob: 'dob',
    gender: 'gender',
    address: 'address',
    preferences: 'preferences'
  };

  const updateData = {};
  Object.keys(req.body).forEach(key => {
    const normalizedKey = fieldMap[key] || key;
    if (!disallowedFields.includes(normalizedKey)) {
      updateData[normalizedKey] = req.body[key];
    }
  });

  if (req.file) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'users' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });
    updateData.avatar = result.secure_url;
  }

  const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });

  if (!updatedUser) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser }
  });
};

// export const getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();
//   res.status(200).json({
//     status: 'success',
//     results: users.length,
//     data: { users }
//   });
// });
export const getMe = async (req, res, next) => {
  console.log('getMe called, req.user:', req.user); // Debug log

  // Sanity check: Make sure protect middleware set req.user
  if (!req.user || !req.user.id) {
    console.log('No user found in request'); // Debug log
    return next(new AppError('You are not logged in.', 401));
  }

  try {
    // Fetch user excluding sensitive fields
    const user = await User.findById(req.user.id)
      .select('-password -passwordConfirm -__v -emailVerificationOTP -emailVerificationOTPExpires -otpAttempts -otpBlockedUntil -passwordResetOTP -passwordResetOTPExpires -verificationToken -verificationTokenExpires -passwordResetToken -passwordResetExpires')
      .populate({
        path: 'bookings',
        select: 'tour status createdAt totalAmount',
        populate: {
          path: 'tour',
          select: 'name price duration images'
        }
      })
      .populate({
        path: 'wishlist',
        select: 'name price duration images rating'
      });

    if (!user) {
      console.log('User not found in database'); // Debug log
      return next(new AppError('User not found', 404));
    }

    console.log('User found:', user.email); // Debug log

    // Success response
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (err) {
    console.error('Error in getMe controller:', err);
    return next(new AppError('Error fetching user data', 500));
  }
};
