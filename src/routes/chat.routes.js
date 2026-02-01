import express from 'express';
import {authMiddleware} from '../middleware/auth.middleware.js';
import { createConversation, sendMessage, getMessages, getConversationDetails } from '../controllers/chat.controller.js';
const router = express.Router();

router.use(authMiddleware);// apply auth middleware to all routes below



router.post('/create', createConversation);
router.post('/send', sendMessage);
router.get('/:conversationId/messages', getMessages );
router.get('/conversation/:id', getConversationDetails);


export default router;