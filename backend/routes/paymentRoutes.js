import express from 'express';
import {
  createOrder,
  verifyPayment,
  getAllPayments,
  getPaymentsByUser,
  getPaymentById,
  deletePayment,
} from '../controllers/paymentController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Specific routes first
router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);
router.get('/user/:userId', getPaymentsByUser);
router.get('/all', restrictTo('admin'), getAllPayments);

// Generic routes last
router.get('/:paymentId', getPaymentById);
router.delete('/:paymentId', restrictTo('admin'), deletePayment);

export default router;