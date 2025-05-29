import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: function () {
      return !this.socialMedia?.googleId;
    },
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters'],
  },
  lastName: {
    type: String,
    required: function () {
      return !this.socialMedia?.googleId;
    },
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
    set: function (email) {
      if (typeof email === 'object' && email.email) {
        return email.email.toLowerCase();
      }
      return email.toLowerCase();
    },
  },
  password: {
    type: String,
    required: function () {
      return !this.socialMedia?.googleId;
    },
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    validate: {
      validator: function (el) {
        if (this.socialMedia?.googleId) return true;
        return el === this.password;
      },
      message: 'Passwords do not match!',
    },
    select: false,
  },
  phoneNumber: {
    type: String,
    validate: {
      validator: function (v) {
        return /^\+?[1-9]\d{1,14}$/.test(v);
      },
      message: 'Please enter a valid phone number with country code',
    },
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'tour-guide'],
    default: 'user',
  },
  avatar: {
    type: String,
    default: function () {
      if (this.socialMedia?.googleId) {
        return this.socialMedia.googlePhoto;
      }
      const hash = crypto.createHash('md5').update(this.email).digest('hex');
      return `https://www.gravatar.com/avatar/${hash}?d=retro`;
    },
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
  },
  dob: {
    type: Date,
    validate: {
      validator: function (v) {
        return v < new Date();
      },
      message: 'Date of birth must be in the past',
    },
  },
  favorites: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
    },
  ],
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
  },
  isVerified: {
    type: Boolean,
    default: function () {
      return !!this.socialMedia?.googleId;
    },
  },
  emailVerificationOTP: {
    type: String,
    select: false,
  },
  emailVerificationOTPExpires: {
    type: Date,
    select: false,
  },
  otpAttempts: {
    type: Number,
    default: 0,
    select: false,
  },
  otpBlockedUntil: {
    type: Date,
    select: false,
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordResetOTP: {
    type: String,
    select: false,
  },
  passwordResetOTPExpires: {
    type: Date,
    select: false,
  },
  socialMedia: {
    googleId: {
      type: String,
      select: false,
    },
    googlePhoto: String,
    facebookId: {
      type: String,
      select: false,
    },
  },
  bookings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
  ],
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
    },
  ],
  preferences: {
    preferredLanguage: {
      type: String,
      default: 'en',
      enum: ['en', 'es', 'fr', 'de', 'other'],
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR', 'OTHER'],
    },
    newsletter: {
      type: Boolean,
      default: false,
    },
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Password hashing middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.socialMedia?.googleId) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// Prevent role change for specific admin email
userSchema.pre('save', function (next) {
  if (this.isModified('role') && this.email === 'admin@example.com') {
    return next(new Error('Admin role cannot be modified'));
  }
  next();
});

// Exclude inactive users from queries
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// Helper: Generate 6-digit OTP
userSchema.methods.generateOTP = function () {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create and hash email verification OTP
userSchema.methods.createEmailVerificationOTP = function () {
  if (this.socialMedia?.googleId) return null;

  const otp = this.generateOTP();
  this.emailVerificationOTP = crypto.createHash('sha256').update(otp).digest('hex');
  this.emailVerificationOTPExpires = Date.now() + 15 * 60 * 1000;
  this.otpAttempts = 0;
  this.otpBlockedUntil = undefined;
  return otp;
};

// Verify email OTP
userSchema.methods.verifyEmailOTP = function (candidateOTP) {
  if (this.otpBlockedUntil && this.otpBlockedUntil > Date.now()) {
    throw new Error('Too many failed attempts. Please try again later.');
  }

  if (this.emailVerificationOTPExpires < Date.now()) {
    throw new Error('OTP has expired. Please request a new one.');
  }

  const hashedCandidate = crypto.createHash('sha256').update(candidateOTP).digest('hex');

  const isValid = hashedCandidate === this.emailVerificationOTP;

  if (!isValid) {
    this.otpAttempts += 1;

    if (this.otpAttempts >= 5) {
      this.otpBlockedUntil = Date.now() + 30 * 60 * 1000;
      throw new Error('Too many failed attempts. Account blocked for 30 minutes.');
    }

    return false;
  }

  this.emailVerificationOTP = undefined;
  this.emailVerificationOTPExpires = undefined;
  this.otpAttempts = 0;
  this.otpBlockedUntil = undefined;
  this.isVerified = true;
  return true;
};

// Create verification token
userSchema.methods.createVerificationToken = function () {
  if (this.socialMedia?.googleId) return null;

  const verificationToken = crypto.randomBytes(32).toString('hex');
  this.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
  return verificationToken;
};

// Create password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// Password reset OTP
userSchema.methods.createPasswordResetOTP = function () {
  const otp = this.generateOTP();
  this.passwordResetOTP = otp;
  this.passwordResetOTPExpires = Date.now() + 10 * 60 * 1000;
  return otp;
};

userSchema.methods.verifyPasswordResetOTP = function (enteredOTP) {
  return (
    this.passwordResetOTP === enteredOTP &&
    this.passwordResetOTPExpires > Date.now()
  );
};

userSchema.methods.clearPasswordResetOTP = function () {
  this.passwordResetOTP = undefined;
  this.passwordResetOTPExpires = undefined;
};

// Compare password
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  if (this.socialMedia?.googleId) return false;
  return await bcrypt.compare(candidatePassword, userPassword);
};

// JWT password change check
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

export default mongoose.model('User', userSchema);
