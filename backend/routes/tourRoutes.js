import express from 'express';
import {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour
} from '../controllers/tourController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin'), createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin'), updateTour)
  .delete(protect, restrictTo('admin'), deleteTour);

export default router;