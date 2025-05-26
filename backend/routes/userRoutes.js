

import express from 'express';
import {
  register,
  login,
  googleLogin,
  verifyEmailOTP,
  forgotPassword,
  // verifyPasswordResetOTP,
  // resetPassword,
  getAllUsers,
  updateUser,
  deleteUser,
  getAdminStats,
  getMe,
  resendEmailOTP
} from '../controllers/userController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);

// Email verification routes
router.post('/verifyEmailOTP', verifyEmailOTP);
router.post('/resend-verification', resendEmailOTP);

// Password reset routes
router.post('/forgot-password', forgotPassword);
// router.post('/verify-reset-otp', resetPassword);
// router.patch('/reset-password', resetPassword);

// Protected routes (require authentication)
router.use(protect); // All routes after this middleware are protected

router.get('/me', getMe);
router.patch('/update-me/:id', upload.single('avatar'), updateUser);

// Admin only routes
router.use(restrictTo('admin'));

router.get('/displayall', getAllUsers);
router.delete('/:id', protect, deleteUser);
router.get('/admin/stats', getAdminStats);

export default router;