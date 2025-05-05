import Booking from '../models/Booking.js';

export const createBooking = async (req, res) => {
  try {
    const booking = await Booking.create({
      ...req.body,
      user: req.user.id
    });

    res.status(201).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find();

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: {
        bookings
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'No bookings found'
    });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id });

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: {
        bookings
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'No bookings found'
    });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
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