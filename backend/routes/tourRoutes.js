// tourRoutes.js
import express from 'express';
import {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  uploadTourImage
} from '../controllers/tourController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import reviewRouter from './reviewRoutes.js';
import upload, { handleUploadErrors } from '../middleware/uploadMiddleware.js';
import cloudinary from '../utils/cloudinary.js';
import { getTourStats } from '../controllers/tourController.js';

const router = express.Router();


  router.get('/stats', getTourStats);

// Nested reviews routes
router.use('/:tourId/reviews', reviewRouter);

// File upload routes (with proper error handling)
router.post(
  '/upload/:tourId',
  protect,
  restrictTo('admin'),
  upload.single('image'),
  handleUploadErrors, // Error handling middleware
  uploadTourImage
);

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

      // Convert buffer to base64
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {  // <-- Now using imported instance
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
router.route('/')
  .get(getAllTours)
  .post(
    protect,
    restrictTo('admin'),
    upload.single('imageCover'),  // Handle file upload
    handleUploadErrors,
    createTour
  );

router.route('/:tourId')
  .get(getTour)
  .patch(protect, restrictTo('admin'), updateTour)
  .delete(protect, restrictTo('admin'), deleteTour);



export default router;