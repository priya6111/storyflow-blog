import express from 'express';
import {
  getPosts,
  getPostBySlugOrId,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost,
  toggleBookmarkPost
} from '../controllers/postController.js';
import { authRequired, optionalAuth } from '../middleware/auth.js';
import { getComments, createComment } from '../controllers/commentController.js';

const router = express.Router();

// Public routes (with optional auth to know if user liked/bookmarked)
router.get('/', optionalAuth, getPosts);
router.get('/:slugOrId', optionalAuth, getPostBySlugOrId);
router.get('/:postId/comments', optionalAuth, getComments);

// Protected routes (require login)
router.post('/', authRequired, createPost);
router.put('/:id', authRequired, updatePost);
router.delete('/:id', authRequired, deletePost);
router.post('/:id/like', authRequired, toggleLikePost);
router.post('/:id/bookmark', authRequired, toggleBookmarkPost);
router.post('/:postId/comments', authRequired, createComment);

export default router;
