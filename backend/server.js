// server.js
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import tourRoutes from './routes/tourRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import AppError from './utils/appError.js';

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Basic route mounting - no parameters in the path
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/payments', paymentRoutes);



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export for testing purposes
export default app;