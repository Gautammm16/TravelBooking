// tourRoutes.js
import express from 'express';
import {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour
} from '../controllers/tourController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import reviewRouter from './reviewRoutes.js';

const router = express.Router();

// Define nested routes first
router.use('/:tourId/reviews', reviewRouter);

// Tour routes
router.route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin'), createTour);

router.route('/:tourId')
  .get(getTour)
  .patch(protect, restrictTo('admin'), updateTour)
  .delete(protect, restrictTo('admin'), deleteTour);

export default router;
