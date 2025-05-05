

import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Helper function to handle different error types
const handleErrors = (error) => {
  let errors = {};

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    Object.values(error.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
    return errors;
  }

  // Duplicate email error
  if (error.code === 11000) {
    errors.email = 'Email already in use';
    return errors;
  }

  // General error fallback
  return { general: 'Something went wrong. Please try again.' };
};

// Register

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, passwordConfirm } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !passwordConfirm) {
      return res.status(400).json({
        status: 'fail',
        message: 'All fields are required'
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already exists'
      });
    }

    // Create new user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      passwordConfirm
    });

    // Generate JWT
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES
    });

    // Sanitize response
    const userResponse = {
      _id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar
    };

    // Send response
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    console.error('Registration Error:', error); // Log the error
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



export const getAllUsers = async (req, res) => {
  try {
    // 1) Get all users from database
    const users = await User.find().select('-__v -password -passwordResetToken -passwordResetExpires');

    // 2) Check if any users exist
    if (!users || users.length === 0) {
      return res.status(404).json({
        status: 'success',
        results: 0,
        message: 'No users found'
      });
    }

    // 3) Send response
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};


// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // 1) Check if email and password exist
//     if (!email || !password) {
//       return res.status(400).json({
//         status: 'fail',
//         message: 'Please provide email and password'
//       });
//     }

//     // 2) Check if user exists and password is correct
//     const user = await User.findOne({ email }).select('+password');

//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return res.status(401).json({
//         status: 'fail',
//         message: 'Incorrect email or password'
//       });
//     }

//     // 3) Generate JWT token
//     const token = jwt.sign(
//       { id: user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRES }
//     );

//     // 4) Remove sensitive data from response
//     const userResponse = {
//       _id: user._id,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.email,
//       role: user.role,
//       avatar: user.avatar
//     };

//     // 5) Set HTTP-only cookie
//     res.cookie('jwt', token, {
//       expires: new Date(
//         Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
//       ),
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict'
//     });

//     // 6) Send response
//     res.status(200).json({
//       status: 'success',
//       token,
//       data: {
//         user: userResponse
//       }
//     });

//   } catch (error) {
//     res.status(400).json({
//       status: 'fail',
//       message: 'Login failed',
//       error: error.message
//     });
//   }
// };



// Update User


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      });
    }

    // 2) Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
    }

    // 3) Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '30d' }
    );

    // 4) Remove sensitive data from response
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    };

    // ✅ 5) Set HTTP-only cookie with fallback if env missing
    const cookieExpireDays = process.env.JWT_COOKIE_EXPIRES || 30;

    res.cookie('jwt', token, {
      expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    // 6) Send response
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: 'Login failed',
      error: error.message
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // 1) Check authorization
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized to update this user'
      });
    }

    // 2) Prevent role escalation for non-admins
    if (req.user.role !== 'admin' && updateData.role) {
      return res.status(403).json({
        status: 'fail',
        message: 'Only admins can change user roles'
      });
    }

    // 3) Handle password update separately
    if (updateData.password) {
      if (!updateData.passwordConfirm) {
        return res.status(400).json({
          status: 'fail',
          message: 'Please confirm your password'
        });
      }
      
      updateData.password = await bcrypt.hash(updateData.password, 12);
      updateData.passwordConfirm = undefined;
    }

    // 4) Find and update user
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v -password -passwordResetToken -passwordResetExpires');

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });

  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({
      status: 'fail',
      message: 'Update failed',
      errors
    });
  }
};



//Delete User


export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // 1) Check authorization
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized to delete this user'
      });
    }

    // 2) Soft delete (set active to false)
    const user = await User.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    ).select('-__v -password');

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Delete failed',
      error: error.message
    });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          toursCreated: { $sum: { $cond: [{ $eq: ['$role', 'tour-guide'] }, 1, 0] } }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get admin stats'
    });
  }
};