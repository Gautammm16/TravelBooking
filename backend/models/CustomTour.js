import mongoose from 'mongoose';

const customTourRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  preferredDates: [{ type: Date }],
  groupSize: {
    type: Number,
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  preferences: String, // Activities, hotel types etc.
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('CustomTourRequest', customTourRequestSchema);
