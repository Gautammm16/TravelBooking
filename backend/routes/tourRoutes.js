

// tourRoutes.js
import express from 'express';
import {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  uploadTourImage,
  getTourStats,
  getCountriesCount,
  getToursCount
} from '../controllers/tourController.js';

import { protect, restrictTo } from '../middleware/authMiddleware.js';
import reviewRouter from './reviewRoutes.js';
import upload, { handleUploadErrors } from '../middleware/uploadMiddleware.js';
import cloudinary from '../utils/cloudinary.js';

const router = express.Router();

// Route to get tour statistics
router.get('/stats', getTourStats);

router.get('/countries', getCountriesCount);
router.get('/count', getToursCount);

// Nested review routes
router.use('/:tourId/reviews', reviewRouter);

// Test upload route (for manual image testing)
router.post(
  '/test-upload',
  protect,
  restrictTo('admin'),
  upload.single('image'),
  handleUploadErrors,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: 'fail',
          message: 'Please upload an image'
        });
      }

      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'test-uploads',
        resource_type: 'image'
      });

      res.status(200).json({
        status: 'success',
        data: {
          public_id: result.public_id,
          url: result.secure_url,
          original_filename: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err.message
      });
    }
  }
);

// Main CRUD routes for tours
router.route('/')
  .get(getAllTours)
  .post(
    protect,
    restrictTo('admin'),
    upload.single('imageCover'),   // Upload cover image
    handleUploadErrors,
    createTour                     // Uses req.file to upload to Cloudinary
  );

router.route('/:tourId')
  .get(getTour)
  .patch(protect, restrictTo('admin'), updateTour)
  .delete(protect, restrictTo('admin'), deleteTour);

// Optional route for uploading images separately (if needed)
router.post(
  '/upload/:tourId',
  protect,
  restrictTo('admin'),
  upload.single('image'),         // Accepts single image
  handleUploadErrors,
  uploadTourImage                 // You can remove this route if unused
);

export default router;
