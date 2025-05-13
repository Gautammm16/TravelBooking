import express from 'express';

import { 
  register,
  login,
  getAllUsers,
  updateUser,
  deleteUser,
  getAdminStats,
  getMe
} from '../controllers/userController.js';

import { protect, restrictTo } from '../middleware/authMiddleware.js';

import upload from '../middleware/uploadMiddleware.js'; // <-- multer middleware

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/me', protect, getMe);

router.get("/displayall", getAllUsers);



router.patch('/:id',protect , updateUser)

router.delete('/:id', protect, deleteUser);

router.get('/admin-stats', protect, restrictTo('admin'), getAdminStats);

export default router;
