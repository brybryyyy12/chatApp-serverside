import express from 'express';
import {authMiddleware} from '../middleware/auth.middleware.js';
import {getCurrentUserController, getAllUsers,  updateProfile } from '../controllers/user.controller.js';
const router = express.Router();

router.use(authMiddleware);// apply auth middleware to all routes below


router.get('/me', getCurrentUserController);
router.get('/', getAllUsers);
router.put('/profile', updateProfile);



export default router;