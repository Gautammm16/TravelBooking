import Tour from '../models/Tour.js';
import Booking from '../models/Booking.js'; // ✅ Imported Booking model
import APIFeatures from '../utils/apiFeatures.js';
import cloudinary from '../utils/cloudinary.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current module path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const getToursCount = async (req, res, next) => {
  const count = await Tour.countDocuments();
  res.status(200).json({
    status: 'success',
    data: {
      count
    }
  });
};
export const getCountriesCount = async (req, res, next) => {
  const countries = await Tour.distinct('country');
  res.status(200).json({
    status: 'success',
    data: {
      count: countries.length
    }
  })
};


export const getTourStats = async (req, res) => {
  try {
    const tourCount = await Tour.countDocuments();
    const bookingCount = await Booking.countDocuments();

    // Total revenue (assuming booking has a price field)
    const revenueStats = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$price' }
        }
      }
    ]);
    const totalRevenue = revenueStats[0]?.totalRevenue || 0;

    // Average rating of all tours
    const avgRatingData = await Tour.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$ratingsAverage' }
        }
      }
    ]);
    const avgRating = avgRatingData[0]?.avgRating || 0;

    // Monthly tour creation
    const monthlyStats = await Tour.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          tours: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const formattedMonthlyStats = monthlyStats.map(item => ({
      month: new Date(2000, item._id - 1).toLocaleString('default', { month: 'short' }),
      tours: item.tours
    }));

    // Yearly tour creation
    const yearlyStats = await Tour.aggregate([
      {
        $group: {
          _id: { $year: '$createdAt' },
          tours: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top 5 most booked tours
    const mostBookedTours = await Booking.aggregate([
      {
        $group: {
          _id: '$tour',
          bookings: { $sum: 1 }
        }
      },
      { $sort: { bookings: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'tours',
          localField: '_id',
          foreignField: '_id',
          as: 'tourInfo'
        }
      },
      {
        $unwind: '$tourInfo'
      },
      {
        $project: {
          _id: 0,
          tourId: '$tourInfo._id',
          name: '$tourInfo.name',
          bookings: 1
        }
      }
    ]);

    // Top 5 highest rated tours
    const topRatedTours = await Tour.find()
      .sort({ ratingsAverage: -1 })
      .limit(5)
      .select('name ratingsAverage');

    res.status(200).json({
      status: 'success',
      data: {
        tourCount,
        bookingCount,
        totalRevenue,
        avgRating,
        monthlyStats: formattedMonthlyStats,
        yearlyStats,
        mostBookedTours,
        topRatedTours
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message
    });
  }
};


export const getAllTours = async (req, res) => {
  try {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.query;

    // 🧮 Get total tour count (before pagination)
    const totalTours = await Tour.countDocuments();

    res.status(200).json({
      status: 'success',
      results: tours.length,
      total: totalTours, // ✅ Important for frontend pagination
      data: {
        tours
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};


export const createTour = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'Image file is required'
      });
    }

    // Convert image to base64 for Cloudinary upload
    const b64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype.split('/')[1];
    const dataURI = `data:image/${mimeType};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'tours',
      resource_type: 'image'
    });

    // 🔥 Parse the stringified JSON from the frontend
    const parsedData = JSON.parse(req.body.data);

    // Add the uploaded image URL
    parsedData.imageCover = result.secure_url;

    // Create the tour with parsed data
    const newTour = await Tour.create(parsedData);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    console.error('Error creating tour:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};



// ===========================
// Get Single Tour
// ===========================
export const getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.tourId).populate('reviews');

    res.status(200).json({
      status: 'success',
      data: { tour }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'Tour not found'
    });
  }
};

// ===========================
// Update Tour
// ===========================
export const updateTour = async (req, res) => {
  try {
    // Handle the priceDiscount validation manually
    if (req.body.priceDiscount !== undefined) {
      if (req.body.priceDiscount < 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'Discount price cannot be negative',
          field: 'priceDiscount'  // Add field information
        });
      }
      
      if (req.body.priceDiscount > 0 && req.body.priceDiscount >= req.body.price) {
        return res.status(400).json({
          status: 'fail',
          message: 'Discount price must be below regular price or 0',
          field: 'priceDiscount'  // Add field information
        });
      }
    }

    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!tour) {
      return res.status(404).json({
        status: 'fail',
        message: 'No tour found with that ID'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    // Improved error handling for Mongoose validation errors
    if (err.name === 'ValidationError') {
      const errors = {};
      Object.keys(err.errors).forEach((key) => {
        errors[key] = err.errors[key].message;
      });
      
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors  // Send detailed validation errors
      });
    }
    
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// ===========================
// Delete Tour
// ===========================
export const deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.tourId);
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

// ===========================
// Upload Tour Image
// ===========================
export const uploadTourImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please upload an image'
      });
    }

    const tour = await Tour.findById(req.params.tourId);
    if (!tour) {
      return res.status(404).json({
        status: 'fail',
        message: 'Tour not found'
      });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'tours',
      resource_type: 'image'
    });

    tour.imageCover = result.secure_url;
    tour.images = tour.images || [];
    tour.images.push(result.secure_url);
    await tour.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
        image: {
          public_id: result.public_id,
          url: result.secure_url
        }
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
