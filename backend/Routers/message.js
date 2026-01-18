import express from 'express';
import {
  sendMessage,
  getMessages,
  getConversations,
  startConversation,
  deleteConversation,
} from '../Controllers/message.js';
import { authMiddleware } from '../Middlewares/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Send a message
router.post('/send', sendMessage);

// Get messages for a conversation
router.get('/conversation/:conversationId', getMessages);

// Get all conversations for a user
router.get('/', getConversations);

// Start or get conversation
router.post('/start', startConversation);

// Delete conversation
router.delete('/conversation/:conversationId', deleteConversation);

export default router;
