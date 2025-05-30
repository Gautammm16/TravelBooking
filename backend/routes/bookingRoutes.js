// import express from 'express';
// import {
//   createBooking,
//   getBooking,
//   getAllBookings,
//   getUserBookings,
//   updateBooking,
//   deleteBooking,
//   getBookingsCount
// } from '../controllers/bookingController.js';
// import { protect, restrictTo } from '../middleware/authMiddleware.js';

// const router = express.Router();

// // All routes below this will require authentication
// router.use(protect);
// router.get('/count', getBookingsCount);

// // User-specific routes
// router.get('/my-bookings', getUserBookings);
// router.post('/', protect, createBooking);

// // Admin-only routes
// router.use(restrictTo('admin'));

// router.route('/')
//   .get(getAllBookings);

// router.route('/:id')
//   .get(getBooking)
//   .patch(updateBooking)
//   .delete(deleteBooking);

// export default router;



import express from 'express';
import {
  createBooking,
  getBooking,
  getAllBookings,
  getUserBookings,
  updateBooking,
  deleteBooking,
  getBookingsCount,
  createRazorpayOrder,
  verifyPayment
} from '../controllers/bookingController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes below this will require authentication
router.use(protect);

// Payment related routes
router.post('/create-order', createRazorpayOrder);
router.post('/verify-payment', verifyPayment);

// User-specific routes
router.get('/my-bookings', getUserBookings);
router.get('/count', getBookingsCount);
router.post('/', createBooking);

// Admin-only routes
router.use(restrictTo('admin'));
router.route('/')
  .get(getAllBookings);

router.route('/:id')
  .get(getBooking)
  .patch(updateBooking)
  .delete(deleteBooking);

export default router;