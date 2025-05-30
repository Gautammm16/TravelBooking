// // bookingController.js
// import Booking from '../models/Booking.js';
// import Tour from '../models/Tour.js';
// import AppError from '../utils/appError.js';
// import catchAsync from '../utils/catchAsync.js';
// import crypto from 'crypto';
// import Razorpay from 'razorpay';

// // Initialize Razorpay instance
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// // @desc    Create a booking
// // @route   POST /api/v1/bookings
// // @access  Private

// // In your bookingController.js
// export const createBooking = catchAsync(async (req, res, next) => {
//   const { tour, price, paymentMethod, participants, startDate, cardInfo } = req.body;
  
//   // Validate required fields
//   if (!tour || !price || !participants || !startDate) {
//     return next(new AppError('Please provide all required fields', 400));
//   }

//   // Check if tour exists
//   const tourExists = await Tour.findById(tour);
//   if (!tourExists) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   // Check if start date is valid
//   const startDateObj = new Date(startDate);
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   if (startDateObj < today) {
//     return next(new AppError('Start date must be in the future', 400));
//   }

//   // For direct payments, validate card info
//   if (paymentMethod !== 'razorpay' && cardInfo) {
//     const { cardNumber, expiry, cvv } = cardInfo;
    
//     if (!cardNumber || !expiry || !cvv) {
//       return next(new AppError('Card details are required for direct payments', 400));
//     }

//     // Add your card validation logic here
//     const cardNumberRegex = /^\d{16}$/;
//     const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
//     const cvvRegex = /^\d{3,4}$/;

//     if (!cardNumberRegex.test(cardNumber)) {
//       return next(new AppError('Invalid card number', 400));
//     }

//     if (!expiryRegex.test(expiry)) {
//       return next(new AppError('Invalid expiry date format (MM/YY)', 400));
//     }

//     if (!cvvRegex.test(cvv)) {
//       return next(new AppError('Invalid CVV', 400));
//     }
//   }

//   // Create booking
//   const bookingData = {
//     tour,
//     user: req.user.id,
//     price,
//     paymentMethod,
//     participants,
//     startDate: startDateObj,
//     status: paymentMethod === 'razorpay' ? 'confirmed' : 'pending'
//   };

//   const booking = await Booking.create(bookingData);

//   // Populate and return the booking
//   const populatedBooking = await Booking.findById(booking._id)
//     .populate('user')
//     .populate({
//       path: 'tour',
//       select: 'name price duration imageCover'
//     });

//   res.status(201).json({
//     status: 'success',
//     data: {
//       booking: populatedBooking
//     }
//   });
// });


















// // @desc    Create Razorpay order
// // @route   POST /api/v1/bookings/create-order
// // @access  Private
// export const createRazorpayOrder = catchAsync(async (req, res, next) => {
//   const { amount, currency = 'INR', tourId, participants, startDate } = req.body;

//   if (!amount || !tourId || !participants || !startDate) {
//     return next(new AppError('Amount, tour ID, participants and start date are required', 400));
//   }

//   const options = {
//     amount: amount * 100, // amount in the smallest currency unit (paise for INR)
//     currency,
//     receipt: `order_${Date.now()}`,
//     notes: {
//       tourId,
//       participants,
//       startDate,
//       userId: req.user.id
//     }
//   };

//   try {
//     const order = await razorpay.orders.create(options);
    
//     res.status(200).json({
//       status: 'success',
//       data: {
//         order,
//         key: process.env.RAZORPAY_KEY_ID
//       }
//     });
//   } catch (err) {
//     console.error('Razorpay error:', err);
//     return next(new AppError('Error creating Razorpay order', 500));
//   }
// });

// // @desc    Verify Razorpay payment and create booking
// // @route   POST /api/v1/bookings/verify-payment
// // @access  Private
// export const verifyPayment = catchAsync(async (req, res, next) => {
//   const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tourId, price, participants, startDate } = req.body;

//   // Verify payment signature
//   const generatedSignature = crypto
//     .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//     .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//     .digest('hex');

//   if (generatedSignature !== razorpay_signature) {
//     return next(new AppError('Payment verification failed', 400));
//   }

//   // Create booking
//   const bookingData = {
//     tour: tourId,
//     user: req.user.id,
//     price,
//     paymentMethod: 'razorpay',
//     participants,
//     startDate: new Date(startDate),
//     status: 'confirmed',
//     paymentId: razorpay_payment_id
//   };

//   const booking = await Booking.create(bookingData);

//   // Populate the booking data
//   const populatedBooking = await Booking.findById(booking._id)
//     .populate('user')
//     .populate({
//       path: 'tour',
//       select: 'name price duration imageCover'
//     });

//   res.status(201).json({
//     status: 'success',
//     data: {
//       booking: populatedBooking
//     }
//   });
// });

// // Admin Only: Get all bookings
// export const getAllBookings = catchAsync(async (req, res, next) => {
//   const limit = parseInt(req.query.limit) || 0; // 0 = no limit
//   const sort = req.query.sort || '-createdAt';

//   const bookings = await Booking.find()
//     .populate('user')
//     .populate({
//       path: 'tour',
//       select: 'name price duration imageCover'
//     })
//     .sort(sort)
//     .limit(limit);

//   res.status(200).json({
//     status: 'success',
//     results: bookings.length,
//     data: {
//       bookings
//     }
//   });
// });

// export const getBookingsCount = catchAsync(async (req, res, next) => {
//   const count = await Booking.countDocuments();
//   res.status(200).json({
//     status: 'success',
//     data: {
//       count
//     }
//   });
// });

// // @desc    Get a single booking
// // @route   GET /api/v1/bookings/:id
// // @access  Private/Admin
// export const getBooking = catchAsync(async (req, res, next) => {
//   const booking = await Booking.findById(req.params.id)
//     .populate('user')
//     .populate({
//       path: 'tour',
//       select: 'name price duration imageCover'
//     });

//   if (!booking) {
//     return next(new AppError('No booking found with that ID', 404));
//   }

//   // Check if user is admin or the booking belongs to them
//   if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user.id) {
//     return next(new AppError('You are not authorized to view this booking', 403));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       booking
//     }
//   });
// });

// // @desc    Get bookings for the logged-in user
// // @route   GET /api/v1/bookings/my-bookings
// // @access  Private
// export const getUserBookings = catchAsync(async (req, res, next) => {
//   const bookings = await Booking.find({ user: req.user.id })
//     .populate('user')
//     .populate({
//       path: 'tour',
//       select: 'name price duration imageCover'
//     });

//   res.status(200).json({
//     status: 'success',
//     results: bookings.length,
//     data: {
//       bookings
//     }
//   });
// });

// // @desc    Update a booking
// // @route   PATCH /api/v1/bookings/:id
// // @access  Private/Admin
// export const updateBooking = catchAsync(async (req, res, next) => {
//   const { status, participants, startDate } = req.body;

//   const booking = await Booking.findById(req.params.id);
//   if (!booking) {
//     return next(new AppError('No booking found with that ID', 404));
//   }

//   // Update fields if they exist in the request
//   if (status) booking.status = status;
//   if (participants) booking.participants = participants;
//   if (startDate) {
//     const startDateObj = new Date(startDate);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     if (startDateObj < today) {
//       return next(new AppError('Start date must be in the future', 400));
//     }
//     booking.startDate = startDateObj;
//   }

//   const updatedBooking = await booking.save();

//   // Populate the updated booking data
//   const populatedBooking = await Booking.findById(updatedBooking._id)
//     .populate('user')
//     .populate({
//       path: 'tour',
//       select: 'name price duration imageCover'
//     });

//   res.status(200).json({
//     status: 'success',
//     data: {
//       booking: populatedBooking
//     }
//   });
// });

// // @desc    Delete a booking
// // @route   DELETE /api/v1/bookings/:id
// // @access  Private/Admin
// export const deleteBooking = catchAsync(async (req, res, next) => {
//   const booking = await Booking.findByIdAndDelete(req.params.id);

//   if (!booking) {
//     return next(new AppError('No booking found with that ID', 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null
//   });
// });



// bookingController.js
import Booking from '../models/Booking.js';
import Tour from '../models/Tour.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import crypto from 'crypto';
import Razorpay from 'razorpay';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create a booking
// @route   POST /api/v1/bookings
// @access  Private
export const createBooking = catchAsync(async (req, res, next) => {
  const { tour, price, paymentMethod, participants, startDate, cardInfo } = req.body;
  
  // Validate required fields
  if (!tour || !price || !participants || !startDate) {
    return next(new AppError('Please provide all required fields', 400));
  }

  // Check if tour exists
  const tourExists = await Tour.findById(tour);
  if (!tourExists) {
    return next(new AppError('No tour found with that ID', 404));
  }

  // Validate start date
  const startDateObj = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (startDateObj < today) {
    return next(new AppError('Start date must be in the future', 400));
  }

  // For direct payments, validate card info
  if (paymentMethod !== 'razorpay' && cardInfo) {
    const { cardNumber, expiry, cvv } = cardInfo;
    
    if (!cardNumber || !expiry || !cvv) {
      return next(new AppError('Card details are required for direct payments', 400));
    }

    // Card validation
    const cardNumberRegex = /^\d{16}$/;
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cvvRegex = /^\d{3,4}$/;

    if (!cardNumberRegex.test(cardNumber)) {
      return next(new AppError('Invalid card number', 400));
    }

    if (!expiryRegex.test(expiry)) {
      return next(new AppError('Invalid expiry date format (MM/YY)', 400));
    }

    if (!cvvRegex.test(cvv)) {
      return next(new AppError('Invalid CVV', 400));
    }
  }

  // Create booking
  const bookingData = {
    tour,
    user: req.user.id,
    price,
    paymentMethod,
    participants,
    startDate: startDateObj,
    status: paymentMethod === 'razorpay' ? 'confirmed' : 'pending'
  };

  const booking = await Booking.create(bookingData);

  // Populate and return the booking
  const populatedBooking = await Booking.findById(booking._id)
    .populate('user', 'name email')
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

// @desc    Create Razorpay order
// @route   POST /api/v1/bookings/create-order
// @access  Private
export const createRazorpayOrder = catchAsync(async (req, res, next) => {
  const { amount, currency = 'INR', tourId, participants, startDate } = req.body;

  if (!amount || !tourId || !participants || !startDate) {
    return next(new AppError('Amount, tour ID, participants and start date are required', 400));
  }

  const options = {
    amount: amount * 100, // amount in the smallest currency unit (paise for INR)
    currency,
    receipt: `order_${Date.now()}`,
    notes: {
      tourId,
      participants,
      startDate,
      userId: req.user.id
    }
  };

  try {
    const order = await razorpay.orders.create(options);
    
    res.status(200).json({
      status: 'success',
      data: {
        order,
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (err) {
    console.error('Razorpay error:', err);
    return next(new AppError('Error creating Razorpay order', 500));
  }
});

// @desc    Verify Razorpay payment and create booking
// @route   POST /api/v1/bookings/verify-payment
// @access  Private
export const verifyPayment = catchAsync(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tourId, price, participants, startDate } = req.body;

  // Verify payment signature
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    return next(new AppError('Payment verification failed', 400));
  }

  // Create booking
  const bookingData = {
    tour: tourId,
    user: req.user.id,
    price,
    paymentMethod: 'razorpay',
    participants,
    startDate: new Date(startDate),
    status: 'confirmed',
    paymentId: razorpay_payment_id
  };

  const booking = await Booking.create(bookingData);

  // Populate the booking data
  const populatedBooking = await Booking.findById(booking._id)
    .populate('user', 'name email')
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

// @desc    Get all bookings (Admin only)
// @route   GET /api/v1/bookings
// @access  Private/Admin
export const getAllBookings = catchAsync(async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Sorting
  const sort = req.query.sort || '-createdAt';

  // Filtering
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.tour) filter.tour = req.query.tour;
  if (req.query.user) filter.user = req.query.user;

  // Count total documents
  const total = await Booking.countDocuments(filter);

  // Query with pagination, sorting, and filtering
  const bookings = await Booking.find(filter)
    .skip(skip)
    .limit(limit)
    .sort(sort)
    .populate('user', 'name email')
    .populate({
      path: 'tour',
      select: 'name price duration imageCover'
    });

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: {
      bookings
    }
  });
});

// @desc    Get bookings count (Admin only)
// @route   GET /api/v1/bookings/count
// @access  Private/Admin
export const getBookingsCount = catchAsync(async (req, res, next) => {
  const count = await Booking.countDocuments();
  res.status(200).json({
    status: 'success',
    data: {
      count
    }
  });
});

// @desc    Get a single booking
// @route   GET /api/v1/bookings/:id
// @access  Private
export const getBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('user', 'name email')
    .populate({
      path: 'tour',
      select: 'name price duration imageCover'
    });

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  // Authorization check
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
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Count total documents
  const total = await Booking.countDocuments({ user: req.user.id });

  const bookings = await Booking.find({ user: req.user.id })
    .skip(skip)
    .limit(limit)
    .sort('-createdAt')
    .populate('user', 'name email')
    .populate({
      path: 'tour',
      select: 'name price duration imageCover'
    });

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    total,
    page,
    pages: Math.ceil(total / limit),
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

  // Update fields
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

  // Populate the updated booking
  const populatedBooking = await Booking.findById(updatedBooking._id)
    .populate('user', 'name email')
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