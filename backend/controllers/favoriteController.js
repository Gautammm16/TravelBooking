import Tour from '../models/Tour.js';
import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

export const addFavorite = async (req, res, next) => {
  const { tourId } = req.body;
  
  const tour = await Tour.findById(tourId);
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  if (req.user.favorites.includes(tourId)) {
    return next(new AppError('Tour already in favorites', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $addToSet: { favorites: tourId } },
    { new: true }
  ).populate('favorites');

  res.status(200).json({
    status: 'success',
    data: {
      favorites: user.favorites
    }
  });
};

export const removeFavorite = async (req, res, next) => {
  const { tourId } = req.params;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $pull: { favorites: tourId } },
    { new: true }
  ).populate('favorites');

  res.status(200).json({
    status: 'success',
    data: {
      favorites: user.favorites
    }
  });
};


export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("favorites");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      status: "success",
      favorites: user.favorites, // this will be full tour objects
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};