// server.js
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import tourRouter from './routes/tourRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import paymentRoutes from "./routes/paymentRoutes.js";
dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/tours/:tourId/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/payments', paymentRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});