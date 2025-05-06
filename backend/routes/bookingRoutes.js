// bookingRoutes.js
import express from 'express';
import {
  createBooking,
  getBooking,
  getAllBookings,
  getUserBookings,
  updateBooking,
  deleteBooking
} from '../controllers/bookingController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getUserBookings)
  .post(createBooking);

router.route('/admin')
  .get(restrictTo('admin'), getAllBookings);

router.route('/:id')
  .get(getBooking)
  .patch(updateBooking)
  .delete(deleteBooking);

export default router;