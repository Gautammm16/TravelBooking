import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Review cannot be empty'],
    trim: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  tour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour',
    required: [true, 'Review must belong to a tour']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user']
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Prevent duplicate reviews from same user
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Populate user data by default
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'firstName lastName avatar'
  });
  next();
});


export default  mongoose.model('Review',reviewSchema)