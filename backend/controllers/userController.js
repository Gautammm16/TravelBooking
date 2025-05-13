import User from '../models/User.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import jwt from 'jsonwebtoken';
import cloudinary from '../utils/cloudinary.js';
import { OAuth2Client } from 'google-auth-library';

// Initialize Google OAuth2 client
const client = new OAuth2Client(process.env.REACT_APP_GOOGLE_CLIENT_ID);

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || '30d'
  });
};

export const googleLogin = catchAsync(async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return next(new AppError('Google token is required', 400));
  }

  try {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        name,
        email,
        avatar: picture,
        googleId,
        isVerified: true, // Google-verified emails are automatically verified
        password: undefined, // No password for Google-authenticated users
        passwordConfirm: undefined
      });
    } else if (!user.googleId) {
      // Update existing user with Google ID if logging in with Google for first time
      user.googleId = googleId;
      if (!user.avatar) user.avatar = picture;
      if (!user.isVerified) user.isVerified = true;
      await user.save({ validateBeforeSave: false });
    }

    // Check if the user is trying to use Google login for admin account
    if (email === 'admin@example.com') {
      return next(new AppError('Admin must login with email/password', 403));
    }

    const authToken = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token: authToken,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Google authentication error:', error);
    return next(new AppError('Google authentication failed', 401));
  }
});

export const register = catchAsync(async (req, res, next) => {
  if (req.body.email === 'admin@example.com') {
    return next(new AppError('Admin registration is not allowed', 403));
  }
  
  const newUser = await User.create(req.body);
  const token = signToken(newUser._id);
  
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // Check for admin login attempt
  if (email === 'admin@example.com') {
    const adminUser = await User.findOne({ email }).select('+password');
    
    // Verify admin exists and has correct role
    if (!adminUser || adminUser.role !== 'admin') {
      return next(new AppError('Admin access denied', 403));
    }

    // Verify admin password strictly
    if (!(await adminUser.correctPassword(password, adminUser.password))) {
      return next(new AppError('Invalid admin credentials', 401));
    }

    // Additional check for hardcoded admin password
    if (password !== 'admin123') {
      return next(new AppError('Invalid admin credentials', 401));
    }

    const token = signToken(adminUser._id);
    return res.status(200).json({
      status: 'success',
      token,
      data: {
        user: adminUser
      }
    });
  }

  // Regular user login
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
});

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

export const updateUser = catchAsync(async (req, res, next) => {
  // Disallowed fields
  const disallowedFields = [
    'password',
    'passwordConfirm',
    'role',
    'verificationToken',
    'verificationTokenExpires',
    'passwordResetToken',
    'passwordResetExpires',
    'bookings',
    'wishlist',
    'active',
    'createdAt',
    'socialMedia'
  ];

  // Normalize field names (handle lowercase input like firstname → firstName)
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
    const normalizedKey = fieldMap[key] || key; // default to key if no mapping
    if (!disallowedFields.includes(normalizedKey)) {
      updateData[normalizedKey] = req.body[key];
    }
  });

  // Handle file upload
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

  // Update the user
  const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });

  if (!updatedUser) {
    return next(new AppError('No user found with that ID', 404));
  }

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});


export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

export const getAdminStats = catchAsync(async (req, res, next) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        numUsers: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

export const getMe = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
};
