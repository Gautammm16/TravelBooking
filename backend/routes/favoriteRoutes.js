import express from 'express';
import {
  addFavorite,
  removeFavorite,
  getFavorites
} from '../controllers/favoriteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all favorite routes
router.use(protect);

router.route('/')
  .post(addFavorite)
  .get(getFavorites);

router.route('/:tourId')
  .delete(removeFavorite);

export default router;