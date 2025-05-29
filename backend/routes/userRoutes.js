import express from 'express';
import {
  register,
  login,
  googleLogin,
  verifyEmailOTP,
  forgotPassword,
verifyResetOTP,
  resetPasswordWithOTP,
  updatePassword,
  getAllUsers,
  updateUser,
  deleteUser,
  getAdminStats,
  getMe,
  resendEmailOTP
} from '../controllers/userController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import {
  addFavorite,
  removeFavorite,
  getFavorites
} from '../controllers/favoriteController.js';

import upload from '../middleware/uploadMiddleware.js';
import { auth } from 'google-auth-library';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);

// Email verification routes
router.post('/verifyEmailOTP', verifyEmailOTP);
router.post('/resend-verification', resendEmailOTP);

router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPasswordWithOTP);
router.patch('/update-password', protect, updatePassword);

// Protected routes (require authentication)
router.get('/me',protect, getMe);
router.use(protect); // All routes after this middleware are protected

router.patch('/update-me/:id', upload.single('avatar'), updateUser);

// Admin only routes
router.use(restrictTo('admin'));

router.get('/displayall', getAllUsers);
router.delete('/:id', protect, deleteUser);
router.get('/admin/stats', getAdminStats);




export default router;
