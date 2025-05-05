import mongoose, { modelNames } from 'mongoose';

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a tour']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a user']
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit-card', 'paypal', 'bank-transfer'],
    required: [true, 'Payment method is required']
  },
  paymentId: String,
  participants: {
    type: Number,
    required: [true, 'Number of participants is required'],
    min: [1, 'Minimum 1 participant required']
  },
  startDate: {
    type: Date,
    required: [true, 'Tour start date is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Populate tour and user data by default
bookingSchema.pre(/^find/, function(next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name price duration imageCover'
  });
  next();
});
export default mongoose.model('Booking',bookingSchema)