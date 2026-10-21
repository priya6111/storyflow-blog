import express from 'express';
import { register, login, getCurrentUser, updateProfile } from '../controllers/authController.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authRequired, getCurrentUser);
router.put('/profile', authRequired, updateProfile);

export default router;
