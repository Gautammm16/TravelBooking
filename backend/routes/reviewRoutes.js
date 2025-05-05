import express from 'express';
import {
  createReview,
  getAllReviews,
  updateReview,
  deleteReview
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .get(getAllReviews)
  .post(protect, createReview);

router
  .route('/:id')
  .patch(protect, updateReview)
  .delete(protect, deleteReview);

export default router;