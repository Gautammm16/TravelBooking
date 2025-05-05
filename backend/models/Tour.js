import mongoose from 'mongoose';
import slugify from 'slugify';

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tour name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Tour name cannot exceed 100 characters']
  },
  slug: String,
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 day']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'Group size is required'],
    min: [1, 'Group size must be at least 1']
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty is required'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty must be easy, medium, or difficult'
    }
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be at least 1.0'],
    max: [5, 'Rating cannot exceed 5.0']
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function(val) {
        return val < this.price;
      },
      message: 'Discount price ({VALUE}) must be below regular price'
    }
  },
  summary: {
    type: String,
    required: [true, 'Summary is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, 'Cover image is required']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now()
  },
  startDates: [Date],
  startLocation: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String
  },
  locations: [
    {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number
    }
  ],
  guides: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  country: {
    type: String,
    required: [true, 'Country is required']
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug from name
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Virtual populate reviews
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

export default mongoose.model('Tour',tourSchema)