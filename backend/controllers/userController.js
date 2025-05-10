import User from '../models/User.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import jwt from 'jsonwebtoken';
import cloudinary from '../utils/cloudinary.js'; // make sure this file is configured correctly

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || '30d'
  });
};

export const register = catchAsync(async (req, res, next) => {
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

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
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
