import express from 'express';
import { deleteComment, toggleLikeComment } from '../controllers/commentController.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

router.delete('/:commentId', authRequired, deleteComment);
router.post('/:commentId/like', authRequired, toggleLikeComment);

export default router;
