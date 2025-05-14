// bookingController.js
import Booking from '../models/Booking.js';


// Get all bookings (admin only)
export const getAllBookings = async (req, res) => {
  try {
    // const bookings = await Booking.find();
    const bookings = await Booking.find().populate('tour user'); // Add this

    
    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: { bookings }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get current user's bookings
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id });
    
    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: { bookings }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get single booking (admin or booking owner)
export const getBooking = async (req, res) => {
  try {
    let booking;
    
    if (req.user.role === 'admin') {
      booking = await Booking.findById(req.params.id);
    } else {
      booking = await Booking.findOne({
        _id: req.params.id,
        user: req.user.id
      });
    }

    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'No booking found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { booking }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Create a booking

export const createBooking = async (req, res) => {
  try {
    console.log('Headers:', req.headers); // Debug log
    
    // 1) Verify authentication
    if (!req.headers.authorization) {
      return res.status(401).json({
        status: 'fail',
        message: 'No authorization token provided'
      });
    }

    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'No token found in authorization header'
      });
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Debug log

    // 3) Create booking
    const bookingData = {
      ...req.body,
      user: decoded.id // Use ID from token
    };

    const newBooking = await Booking.create(bookingData);
    
    res.status(201).json({
      status: 'success',
      data: { booking: newBooking }
    });
  } catch (err) {
    console.error('Booking error:', err);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid token. Please log in again.'
      });
    }
    
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Update a booking
export const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'No booking found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { booking }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Delete a booking
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        status: 'fail', 
        message: 'No booking found with that ID'
      });
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};