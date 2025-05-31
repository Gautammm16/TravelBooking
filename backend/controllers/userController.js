import User from '../models/User.js';
import AppError from '../utils/appError.js';
import jwt from 'jsonwebtoken';
import cloudinary from '../utils/cloudinary.js';
import { OAuth2Client } from 'google-auth-library';
import { sendEmail } from '../utils/emailService.js';


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);



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

// 1. Send OTP to email
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError('Please provide your email address', 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Security: don't reveal if user exists
      return res.status(200).json({
        status: 'success',
        message: 'If an account exists with this email, an OTP has been sent',
      });
    }

    // Check if user is blocked from OTP attempts
    if (user.otpBlockedUntil && user.otpBlockedUntil > Date.now()) {
      const timeLeft = Math.ceil((user.otpBlockedUntil - Date.now()) / (60 * 1000));
      return next(new AppError(`Too many attempts. Please try again in ${timeLeft} minutes`, 429));
    }

    // Check for recent OTP request
    if (user.passwordResetOTPExpires && user.passwordResetOTPExpires > Date.now()) {
      const timeLeft = Math.ceil((user.passwordResetOTPExpires - Date.now()) / (60 * 1000));
      return next(new AppError(`Please wait ${timeLeft} minutes before requesting a new OTP`, 429));
    }

    const otp = user.createPasswordResetOTP();
    await user.save({ validateBeforeSave: false });

    try {
      await sendOTPEmail(user.email, otp);

      res.status(200).json({
        status: 'success',
        message: 'Password reset OTP sent to your email address',
      });
    } catch (err) {
      user.clearPasswordResetOTP();
      await user.save({ validateBeforeSave: false });
      
      console.error('Email sending failed:', err);
      return next(new AppError('Failed to send OTP. Please try again later.', 500));
    }
  } catch (err) {
    next(err);
  }
};

// 2. Verify password reset OTP
export const verifyResetOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(new AppError('Please provide both email and OTP', 400));
    }

    const user = await User.findOne({ email })
      .select('+passwordResetOTP +passwordResetOTPExpires +otpAttempts +otpBlockedUntil');

    if (!user) {
      return next(new AppError('Invalid OTP', 400));
    }

    // Check if user is blocked from OTP attempts
    if (user.otpBlockedUntil && user.otpBlockedUntil > Date.now()) {
      const timeLeft = Math.ceil((user.otpBlockedUntil - Date.now()) / (60 * 1000));
      return next(new AppError(`Too many attempts. Please try again in ${timeLeft} minutes`, 429));
    }

    try {
      const isValid = user.verifyPasswordResetOTP(otp);
      if (!isValid) {
        user.otpAttempts += 1;
        
        if (user.otpAttempts >= 5) {
          user.otpBlockedUntil = Date.now() + 30 * 60 * 1000;
          await user.save({ validateBeforeSave: false });
          return next(new AppError('Too many failed attempts. Account blocked for 30 minutes.', 429));
        }
        
        await user.save({ validateBeforeSave: false });
        return next(new AppError('Invalid OTP', 400));
      }

      // Clear OTP fields
      user.clearPasswordResetOTP();
      user.otpAttempts = 0;
      user.otpBlockedUntil = undefined;
      await user.save({ validateBeforeSave: false });

      const resetToken = jwt.sign(
        { id: user._id, purpose: 'password_reset' },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      res.status(200).json({
        status: 'success',
        message: 'OTP verified successfully',
        resetToken,
      });
    } catch (err) {
      return next(new AppError(err.message, 400));
    }
  } catch (err) {
    next(err);
  }
};

// 3. Reset password using verified OTP
export const resetPasswordWithOTP = async (req, res, next) => {
  try {
    const { resetToken, newPassword, passwordConfirm } = req.body;

    if (!resetToken || !newPassword || !passwordConfirm) {
      return next(new AppError('Please provide all required fields', 400));
    }

    if (newPassword !== passwordConfirm) {
      return next(new AppError('Passwords do not match', 400));
    }

    // Verify the reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
      if (decoded.purpose !== 'password_reset') {
        throw new Error('Invalid token purpose');
      }
    } catch (err) {
      return next(new AppError('Invalid or expired token', 401));
    }

    const user = await User.findById(decoded.id).select('+password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    user.password = newPassword;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpires = undefined;
    user.otpAttempts = 0;
    user.otpBlockedUntil = undefined;

    await user.save();

    // Send password changed notification
    await sendEmail({
      email: user.email,
      subject: 'Password Changed Successfully',
      html: `<p>Your password was successfully changed.</p>`
    });

    res.status(200).json({
      status: 'success',
      message: 'Password has been reset successfully',
    });
  } catch (err) {
    next(err);
  }
};

// Update password for logged-in users
export const updatePassword = async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is incorrect', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log user in, send JWT
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


// export const updateUser = async (req, res, next) => {
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
// };

// export const getMe = async (req, res, next) => {
//   console.log('getMe called, req.user:', req.user); // Debug log

//   // Sanity check: Make sure protect middleware set req.user
//   if (!req.user || !req.user.id) {
//     console.log('No user found in request'); // Debug log
//     return next(new AppError('You are not logged in.', 401));
//   }

//   try {
//     // Fetch user excluding sensitive fields
//     const user = await User.findById(req.user.id)
//       .select('-password -passwordConfirm -__v -emailVerificationOTP -emailVerificationOTPExpires -otpAttempts -otpBlockedUntil -passwordResetOTP -passwordResetOTPExpires -verificationToken -verificationTokenExpires -passwordResetToken -passwordResetExpires')
//       .populate({
//         path: 'bookings',
//         select: 'tour status createdAt totalAmount',
//         populate: {
//           path: 'tour',
//           select: 'name price duration images'
//         }
//       })
//       .populate({
//         path: 'wishlist',
//         select: 'name price duration images rating'
//       });

//     if (!user) {
//       console.log('User not found in database'); // Debug log
//       return next(new AppError('User not found', 404));
//     }

//     console.log('User found:', user.email); // Debug log

//     // Success response
//     res.status(200).json({
//       status: 'success',
//       data: { user }
//     });
//   } catch (err) {
//     console.error('Error in getMe controller:', err);
//     return next(new AppError('Error fetching user data', 500));
//   }
// };


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
  
  // Handle regular fields
  Object.keys(req.body).forEach(key => {
    const normalizedKey = fieldMap[key] || key;
    if (!disallowedFields.includes(normalizedKey)) {
      updateData[normalizedKey] = req.body[key];
    }
  });

  // Handle nested preferences
  if (req.body.preferences) {
    try {
      updateData.preferences = typeof req.body.preferences === 'string' 
        ? JSON.parse(req.body.preferences)
        : req.body.preferences;
    } catch (err) {
      return next(new AppError('Invalid preferences format', 400));
    }
  }

  // Handle favorites array (convert string IDs to ObjectIds)
  if (req.body.favorites) {
    try {
      // First parse the JSON string if it's a string
      const favoritesArray = typeof req.body.favorites === 'string'
        ? JSON.parse(req.body.favorites)
        : req.body.favorites;
      
      // Then convert each ID to ObjectId
      updateData.favorites = favoritesArray.map(id => mongoose.Types.ObjectId(id));
    } catch (err) {
      return next(new AppError('Invalid favorites format', 400));
    }
  }

  // Handle file upload
  if (req.file) {
    try {
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
    } catch (err) {
      return next(new AppError('Error uploading image', 500));
    }
  }

  try {
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
  } catch (err) {
    // Handle CastError specifically
    if (err.name === 'CastError') {
      return next(new AppError(`Invalid data format for ${err.path}: ${err.value}`, 400));
    }
    next(err);
  }
};


export const getMe = async (req, res, next) => {
  try {
    // Debug logging
    console.log('getMe called, user ID:', req.user?.id);
    
    if (!req.user?.id) {
      console.warn('Unauthorized access attempt - no user in request');
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please authenticate.'
      });
    }

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
      })
      .lean(); // Convert to plain JavaScript object

    if (!user) {
      console.error(`User not found with ID: ${req.user.id}`);
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    console.log(`Successfully fetched user: ${user.email}`);

    res.status(200).json({
      status: 'success',
      data: { user }
    });

  } catch (error) {
    console.error('Error in getMe controller:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching user data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};