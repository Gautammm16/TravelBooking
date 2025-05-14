import User from '../models/User.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import jwt from 'jsonwebtoken';
import cloudinary from '../utils/cloudinary.js';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || '30d'
  });
};

// Google OAuth login
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
//     user = await User.create({
//       email,
//       socialMedia: { googleId, googlePhoto: picture },
//       isVerified: true
//     });
//   } else {
//     user.socialMedia = user.socialMedia || {};
//     if (!user.socialMedia.googleId) user.socialMedia.googleId = googleId;
//     if (!user.socialMedia.googlePhoto) user.socialMedia.googlePhoto = picture;
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

export const googleLogin = catchAsync(async (req, res, next) => {
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
});


// Register (for local users only)
export const register = catchAsync(async (req, res, next) => {
  if (req.body.email === 'admin@example.com') {
    return next(new AppError('Admin registration is not allowed', 403));
  }

  const newUser = await User.create(req.body);
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: { user: newUser }
  });
});

// Local login
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (email === 'admin@example.com' && user.role !== 'admin') {
    return next(new AppError('Admin access denied', 403));
  }

  if (email === 'admin@example.com' && password !== 'admin123') {
    return next(new AppError('Invalid admin credentials', 401));
  }

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
    data: { user }
  });
});

// Get all users
export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users }
  });
});

// Update user profile
export const updateUser = catchAsync(async (req, res, next) => {
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
});

// Delete user
export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(new AppError('No user found with that ID', 404));
  res.status(204).json({ status: 'success', data: null });
});

// Admin stats by role
export const getAdminStats = catchAsync(async (req, res, next) => {
  const stats = await User.aggregate([
    { $group: { _id: '$role', numUsers: { $sum: 1 } } }
  ]);
  res.status(200).json({ status: 'success', data: { stats } });
});

// Get current user info
export const getMe = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { user: req.user }
  });
};
