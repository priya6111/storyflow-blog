import express from 'express';
import { getUserProfile, getUserBookmarks, getAuthors } from '../controllers/userController.js';
import { authRequired, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/authors', getAuthors);
router.get('/bookmarks', authRequired, getUserBookmarks);
router.get('/:username', optionalAuth, getUserProfile);

export default router;
