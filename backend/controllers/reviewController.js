import Review from '../models/Review.js';
import Tour from '../models/Tour.js';

export const createReview = async (req, res) => {
  try {
    const { tourId } = req.params;
    
    const review = await Review.create({
      ...req.body,
      tour: tourId,
      user: req.user.id
    });

    // Update tour ratings
    await Tour.calcAverageRatings(tourId);

    res.status(201).json({
      status: 'success',
      data: {
        review
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ tour: req.params.tourId });

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'No reviews found'
    });
  }
};

export const updateReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    await Tour.calcAverageRatings(review.tour);

    res.status(200).json({
      status: 'success',
      data: {
        review
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    await Tour.calcAverageRatings(review.tour);
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