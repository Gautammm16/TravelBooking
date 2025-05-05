import express from 'express';
import {
  createBooking,
  getAllBookings,
  getUserBookings,
  deleteBooking
} from '../controllers/bookingController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createBooking);
router.get('/my-bookings', getUserBookings);

router.use(restrictTo('admin'));
router.get('/', getAllBookings);
router.delete('/:id', deleteBooking);

export default router;