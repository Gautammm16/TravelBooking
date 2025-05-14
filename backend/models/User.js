

import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: function() {
      return !this.socialMedia?.googleId; // Not required for Google-authenticated users
    },
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: function() {
      return !this.socialMedia?.googleId; // Not required for Google-authenticated users
    },
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: function() {
      return !this.socialMedia?.googleId; // Not required for Google-authenticated users
    },
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  passwordConfirm: {
    type: String,
    validate: {
      validator: function(el) {
        // Skip validation if user is signing up with Google
        if (this.socialMedia?.googleId) return true;
        return el === this.password;
      },
      message: 'Passwords do not match!'
    },
    select: false
  },
  phoneNumber: {
    type: String,
    validate: {
      validator: function(v) {
        return /^\+?[1-9]\d{1,14}$/.test(v);
      },
      message: 'Please enter a valid phone number with country code'
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'tour-guide'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: function() {
      if (this.socialMedia?.googleId) {
        return this.socialMedia.googlePhoto; // Use Google photo if available
      }
      const hash = crypto.createHash('md5').update(this.email).digest('hex');
      return `https://www.gravatar.com/avatar/${hash}?d=retro`;
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  dob: {
    type: Date,
    validate: {
      validator: function(v) {
        return v < new Date();
      },
      message: 'Date of birth must be in the past'
    }
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say']
  },
  isVerified: {
    type: Boolean,
    default: function() {
      return !!this.socialMedia?.googleId; // Auto-verify Google-authenticated users
    }
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  socialMedia: {
    googleId: {
      type: String,
      select: false
    },
    googlePhoto: String,
    facebookId: {
      type: String,
      select: false
    }
  },
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TourBooking'
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour'
  }],
  preferences: {
    preferredLanguage: {
      type: String,
      default: 'en',
      enum: ['en', 'es', 'fr', 'de', 'other']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR', 'OTHER']
    },
    newsletter: {
      type: Boolean,
      default: false
    }
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Modified password hashing middleware to skip for Google-authenticated users
userSchema.pre('save', async function(next) {
  // Skip if password isn't modified or user is Google-authenticated
  if (!this.isModified('password') || this.socialMedia?.googleId) return next();
  
  // Only hash password if it exists (not Google-authenticated users)
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
  }
  next();
});

// Generate verification token (skip for Google-authenticated users)
userSchema.methods.createVerificationToken = function() {
  if (this.socialMedia?.googleId) return null; // Google users are auto-verified
  
  const verificationToken = crypto.randomBytes(32).toString('hex');
  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return verificationToken;
};

// Generate password reset token (works for all users)
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

// Compare password method (modified for Google-authenticated users)
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  // Google-authenticated users don't have passwords
  if (this.socialMedia?.googleId) return false;
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Admin role protection
userSchema.pre('save', function(next) {
  if (this.isModified('role') && this.email === 'admin@example.com') {
    return next(new Error('Admin role cannot be modified'));
  }
  next();
});

// Query middleware to exclude inactive users
userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

export default mongoose.model('User', userSchema);