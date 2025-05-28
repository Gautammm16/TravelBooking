import express from 'express';
import {
  createRequest,
  getAllRequests,
  updateRequestStatus,
  getUserRequests
} from '../controllers/customTourController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createRequest);
router.get('/my-requests', protect, getUserRequests);
router.get('/', protect, restrictTo('admin'), getAllRequests);
router.patch('/:id', protect, restrictTo('admin'), updateRequestStatus);

export default router;
