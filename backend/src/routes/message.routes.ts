import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { Message, Conversation } from '../models/Message.model';
import { ApiResponse, getPaginationParams } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { notificationService } from '../services/notification.service';
import { emitToUser } from '../config/socket';

const router = Router();

// Get conversations
router.get('/conversations', authenticate, async (req: any, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .sort({ lastMessageAt: -1 })
      .populate('participants', 'firstName lastName profileImage role')
      .populate('lastMessage')
      .lean();

    ApiResponse.success(res, { conversations });
  } catch (error) { next(error); }
});

// Start or get conversation
router.post('/conversations', authenticate, async (req: any, res, next) => {
  try {
    const { recipientId, jobId } = req.body;

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId] },
      ...(jobId ? { job: jobId } : {}),
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipientId],
        job: jobId,
      });
    }

    await conversation.populate('participants', 'firstName lastName profileImage');

    ApiResponse.success(res, { conversation });
  } catch (error) { next(error); }
});

// Get messages in conversation
router.get('/conversations/:conversationId', authenticate, async (req: any, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user._id,
    });

    if (!conversation) throw ApiError.notFound('Conversation not found');

    const { limit, skip } = getPaginationParams(req.query);

    const messages = await Message.find({
      conversation: req.params.conversationId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'firstName lastName profileImage')
      .lean();

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: req.params.conversationId,
        recipient: req.user._id,
        isRead: false,
      },
      { isRead: true, readAt: new Date() }
    );

    ApiResponse.success(res, { messages: messages.reverse() });
  } catch (error) { next(error); }
});

// Send message
router.post('/conversations/:conversationId/messages', authenticate, async (req: any, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user._id,
    });

    if (!conversation) throw ApiError.notFound('Conversation not found');

    const recipientId = conversation.participants.find(
      (p) => p.toString() !== req.user._id.toString()
    );

    const message = await Message.create({
      conversation: req.params.conversationId,
      sender: req.user._id,
      recipient: recipientId,
      content: req.body.content,
      messageType: req.body.messageType || 'text',
    });

    // Update conversation
    await Conversation.findByIdAndUpdate(req.params.conversationId, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
    });

    await message.populate('sender', 'firstName lastName profileImage');

    // Real-time emit
    if (recipientId) {
      emitToUser(recipientId.toString(), 'newMessage', message);
      
      // Send notification
      await notificationService.create({
        recipientId: recipientId.toString(),
        senderId: req.user._id.toString(),
        type: 'message_received',
        title: `New message from ${req.user.firstName}`,
        message: req.body.content.substring(0, 100),
        link: `/messages/${req.params.conversationId}`,
        channel: 'in_app',
      });
    }

    ApiResponse.created(res, { message });
  } catch (error) { next(error); }
});

export default router;
