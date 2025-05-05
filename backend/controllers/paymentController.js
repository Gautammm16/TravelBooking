import razorpay from '../utils/razorpay.js';
import Payment from '../models/Payment.js';
import crypto from 'crypto';

// Create Razorpay Order
export const createOrder = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const options = {
      amount: amount * 100, // in paisa
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify Razorpay payment
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user,
      booking,
      amount,
      currency,
      paymentMethod,
    } = req.body;

    // Generate expected signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Save payment record
    const payment = await Payment.create({
      user,
      booking,
      amount,
      currency,
      paymentMethod,
      transactionId: razorpay_payment_id,
      provider: 'razorpay',
      paymentStatus: 'completed',
    });

    res.status(200).json({ success: true, message: 'Payment verified', data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
