// userRoutes.js
import express from 'express';

import { 
    register,
    login,
    getAllUsers,
    updateUser,
    deleteUser,
    getAdminStats // Add this import
  } from '../controllers/userController.js';

import { protect, restrictTo } from '../middleware/authMiddleware.js';


const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get("/displayall",getAllUsers)
router.patch('/:id', protect, updateUser);
router.delete('/:id', protect, deleteUser);

// Example protected admin route
router.get(
  '/admin-stats',
  protect,
  restrictTo('admin'),
  getAdminStats
);

// Example protected user route
router.patch(
  '/update-me',
  protect,
  updateUser
);

export default router;