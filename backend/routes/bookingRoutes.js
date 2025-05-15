import express from 'express';
import {
  createBooking,
  getBooking,
  getAllBookings,
  getUserBookings,
  updateBooking,
  deleteBooking,
  getBookingsCount
} from '../controllers/bookingController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes below this will require authentication
router.use(protect);
router.get('/count', getBookingsCount);

// User-specific routes
router.get('/my-bookings', getUserBookings);
router.post('/', protect, createBooking);

// Admin-only routes
router.use(restrictTo('admin'));

router.route('/')
  .get(getAllBookings);

router.route('/:id')
  .get(getBooking)
  .patch(updateBooking)
  .delete(deleteBooking);

export default router;