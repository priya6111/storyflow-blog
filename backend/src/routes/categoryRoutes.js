import express from 'express';
import { getCategories, getPlatformStats } from '../controllers/categoryController.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/stats', getPlatformStats);

export default router;
