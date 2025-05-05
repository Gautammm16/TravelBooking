import express from 'express';
import {
  createOrder,
  verifyPayment,
  getAllPayments,
  getPaymentsByUser,
} from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-order', createOrder);       // Create Razorpay order
router.post('/verify', verifyPayment);           // Verify payment
router.get('/', getAllPayments);
router.get('/user/:userId', getPaymentsByUser);

export default router;
