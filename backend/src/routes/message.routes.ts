import { Router } from 'express';
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
} from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all conversations for the logged-in user
router.get('/conversations', getConversations);

// Get all messages in a specific conversation
router.get('/:conversationId', getMessages);

// Send a new message
router.post('/', sendMessage);

// Mark conversation as read
router.put('/:conversationId/read', markAsRead);

export default router;
