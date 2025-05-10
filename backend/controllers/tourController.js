import Tour from '../models/Tour.js';
import APIFeatures from '../utils/apiFeatures.js';
import cloudinary from '../utils/cloudinary.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current module path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const getAllTours = async (req, res) => {
  try {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.query;

    res.status(200).json({
      status: 'success',
      results: tours.length,
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
    // Validate image path
    if (!req.body.imagePath) {
      return res.status(400).json({
        status: 'fail',
        message: 'Image path is required'
      });
    }

    // Resolve path relative to backend directory
    const backendDir = path.join(__dirname, '..');
    const fullPath = path.join(backendDir, req.body.imagePath);

    console.log('Attempting to access:', fullPath); // Debug log

    if (!fs.existsSync(fullPath)) {
      return res.status(400).json({
        status: 'fail',
        message: `Image not found at: ${req.body.imagePath}`
      });
    }

    // Read and convert image
    const imageBuffer = fs.readFileSync(fullPath);
    const b64 = imageBuffer.toString('base64');
    const ext = path.extname(fullPath).slice(1);
    const dataURI = `data:image/${ext};base64,${b64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'tours',
      resource_type: 'image'
    });

    // Create tour
    const newTour = await Tour.create({
      ...req.body,
      imageCover: result.secure_url
    });

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

export const getTour = async (req, res) => {
  try {
    // Change from req.params.id to req.params.tourId
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


export const updateTour = async (req, res) => {
  try {

    const tour = await Tour.findByIdAndUpdate(req.params.tourId, req.body, { // Changed to tourId
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

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

// New function for uploading tour images
export const uploadTourImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please upload an image'
      });
    }

    // Check if tour exists
    const tour = await Tour.findById(req.params.tourId);
    if (!tour) {
      return res.status(404).json({
        status: 'fail',
        message: 'Tour not found'
      });
    }

    // Convert buffer to base64 string for Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'tours',
      resource_type: 'image'
    });

    // Update tour with new image
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

