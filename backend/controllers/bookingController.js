// // bookingController.js
// import Booking from '../models/Booking.js';


// // Get all bookings (admin only)
// export const getAllBookings = async (req, res) => {
//   try {
//     // const bookings = await Booking.find();
//     const bookings = await Booking.find().populate('tour user'); // Add this

    
//     res.status(200).json({
//       status: 'success',
//       results: bookings.length,
//       data: { bookings }
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'fail',
//       message: err.message
//     });
//   }
// };

// // Get current user's bookings
// export const getUserBookings = async (req, res) => {
//   try {
//     const bookings = await Booking.find({ user: req.user.id });
    
//     res.status(200).json({
//       status: 'success',
//       results: bookings.length,
//       data: { bookings }
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'fail',
//       message: err.message
//     });
//   }
// };

// // Get single booking (admin or booking owner)
// export const getBooking = async (req, res) => {
//   try {
//     let booking;
    
//     if (req.user.role === 'admin') {
//       booking = await Booking.findById(req.params.id);
//     } else {
//       booking = await Booking.findOne({
//         _id: req.params.id,
//         user: req.user.id
//       });
//     }

//     if (!booking) {
//       return res.status(404).json({
//         status: 'fail',
//         message: 'No booking found with that ID'
//       });
//     }
    
//     res.status(200).json({
//       status: 'success',
//       data: { booking }
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'fail',
//       message: err.message
//     });
//   }
// };

// // Create a booking

// export const createBooking = async (req, res) => {
//   try {
//     console.log('Headers:', req.headers); // Debug log
    
//     // 1) Verify authentication
//     if (!req.headers.authorization) {
//       return res.status(401).json({
//         status: 'fail',
//         message: 'No authorization token provided'
//       });
//     }

//     const token = req.headers.authorization.split(' ')[1];
//     if (!token) {
//       return res.status(401).json({
//         status: 'fail',
//         message: 'No token found in authorization header'
//       });
//     }

//     // 2) Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log('Decoded token:', decoded); // Debug log

//     // 3) Create booking
//     const bookingData = {
//       ...req.body,
//       user: decoded.id // Use ID from token
//     };

//     const newBooking = await Booking.create(bookingData);
    
//     res.status(201).json({
//       status: 'success',
//       data: { booking: newBooking }
//     });
//   } catch (err) {
//     console.error('Booking error:', err);
    
//     if (err.name === 'JsonWebTokenError') {
//       return res.status(401).json({
//         status: 'fail',
//         message: 'Invalid token. Please log in again.'
//       });
//     }
    
//     res.status(400).json({
//       status: 'fail',
//       message: err.message
//     });
//   }
// };

// // Update a booking
// export const updateBooking = async (req, res) => {
//   try {
//     const booking = await Booking.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     );
    
//     if (!booking) {
//       return res.status(404).json({
//         status: 'fail',
//         message: 'No booking found with that ID'
//       });
//     }
    
//     res.status(200).json({
//       status: 'success',
//       data: { booking }
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'fail',
//       message: err.message
//     });
//   }
// };

// // Delete a booking
// export const deleteBooking = async (req, res) => {
//   try {
//     const booking = await Booking.findByIdAndDelete(req.params.id);
    
//     if (!booking) {
//       return res.status(404).json({
//         status: 'fail', 
//         message: 'No booking found with that ID'
//       });
//     }
    
//     res.status(204).json({
//       status: 'success',
//       data: null
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'fail',
//       message: err.message
//     });
//   }
// };


// bookingController.js
import Booking from '../models/Booking.js';
import Tour from '../models/Tour.js';
import User from '../models/User.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

// @desc    Create a new booking
// @route   POST /api/v1/bookings
// @access  Private
export const createBooking = catchAsync(async (req, res, next) => {
  const { tour, price, paymentMethod, participants, startDate } = req.body;
  
  // Validate required fields
  if (!tour || !price || !paymentMethod || !participants || !startDate) {
    return next(new AppError('Please provide all required fields', 400));
  }

  // Check if tour exists
  const tourExists = await Tour.findById(tour);
  if (!tourExists) {
    return next(new AppError('No tour found with that ID', 404));
  }

  // Check if start date is valid (at least 1 day in the future)
  const startDateObj = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (startDateObj < today) {
    return next(new AppError('Start date must be in the future', 400));
  }

  // Create booking
  const booking = await Booking.create({
    tour,
    user: req.user.id,
    price,
    paymentMethod,
    participants,
    startDate: startDateObj,
    status: 'confirmed' // or 'pending' if you want to confirm payment first
  });

  // Populate the booking data
  const populatedBooking = await Booking.findById(booking._id)
    .populate('user')
    .populate({
      path: 'tour',
      select: 'name price duration imageCover'
    });

  res.status(201).json({
    status: 'success',
    data: {
      booking: populatedBooking
    }
  });
});

// @desc    Get all bookings (admin only)
// @route   GET /api/v1/bookings
// @access  Private/Admin
export const getAllBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find()
    .populate('user')
    .populate({
      path: 'tour',
      select: 'name price duration imageCover'
    });

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings
    }
  });
});

// @desc    Get a single booking
// @route   GET /api/v1/bookings/:id
// @access  Private/Admin
export const getBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('user')
    .populate({
      path: 'tour',
      select: 'name price duration imageCover'
    });

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  // Check if user is admin or the booking belongs to them
  if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to view this booking', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      booking
    }
  });
});

// @desc    Get bookings for the logged-in user
// @route   GET /api/v1/bookings/my-bookings
// @access  Private
export const getUserBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id })
    .populate('user')
    .populate({
      path: 'tour',
      select: 'name price duration imageCover'
    });

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings
    }
  });
});

// @desc    Update a booking
// @route   PATCH /api/v1/bookings/:id
// @access  Private/Admin
export const updateBooking = catchAsync(async (req, res, next) => {
  const { status, participants, startDate } = req.body;

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  // Update fields if they exist in the request
  if (status) booking.status = status;
  if (participants) booking.participants = participants;
  if (startDate) {
    const startDateObj = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDateObj < today) {
      return next(new AppError('Start date must be in the future', 400));
    }
    booking.startDate = startDateObj;
  }

  const updatedBooking = await booking.save();

  // Populate the updated booking data
  const populatedBooking = await Booking.findById(updatedBooking._id)
    .populate('user')
    .populate({
      path: 'tour',
      select: 'name price duration imageCover'
    });

  res.status(200).json({
    status: 'success',
    data: {
      booking: populatedBooking
    }
  });
});

// @desc    Delete a booking
// @route   DELETE /api/v1/bookings/:id
// @access  Private/Admin
export const deleteBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});