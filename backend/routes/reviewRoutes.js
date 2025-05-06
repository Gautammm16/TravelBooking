// reviewRoutes.js
import express from 'express';
import {
  getAllReviews,
  createReview,
  getReview,
  updateReview,
  deleteReview
} from '../controllers/reviewController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getAllReviews)
  .post(protect, createReview);

router.route('/:reviewId')
  .get(getReview)
  .patch(protect, updateReview)
  .delete(protect, deleteReview);

export default router;