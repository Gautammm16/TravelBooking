import express from 'express';

import { 
  register,
  login,
  getAllUsers,
  updateUser,
  deleteUser,
  getAdminStats
} from '../controllers/userController.js';

import { protect, restrictTo } from '../middleware/authMiddleware.js';

import upload from '../middleware/uploadMiddleware.js'; // <-- multer middleware

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get("/displayall", getAllUsers);

// Protected & file-upload enabled user update
// router.patch('/:id', protect, upload.single('photo'), updateUser);

router.patch('/:id',protect , updateUser)

// Protected user deletion
router.delete('/:id', protect, deleteUser);


// Protected admin stats
router.get('/admin-stats', protect, restrictTo('admin'), getAdminStats);

// Protected self-update (user updates their own profile)
router.patch('/update-me', protect, upload.single('photo'), updateUser);

export default router;
