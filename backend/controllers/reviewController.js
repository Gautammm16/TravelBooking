// reviewController.js
import Review from '../models/Review.js';
import Tour from '../models/Tour.js';

// Get all reviews
export const getAllReviews = async (req, res) => {
  try {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    
    const reviews = await Review.find(filter);
    
    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: { reviews }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get a single review
export const getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({
        status: 'fail',
        message: 'No review found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { review }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Create a new review
export const createReview = async (req, res) => {
  try {
    // Allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    
    const newReview = await Review.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: { review: newReview }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Update a review
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!review) {
      return res.status(404).json({
        status: 'fail',
        message: 'No review found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { review }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({
        status: 'fail',
        message: 'No review found with that ID'
      });
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};
