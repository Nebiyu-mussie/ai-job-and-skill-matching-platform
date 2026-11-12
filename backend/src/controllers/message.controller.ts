import { Response, NextFunction } from 'express';
import { Conversation } from '../models/Conversation.model';
import { Message } from '../models/Message.model';
import { User } from '../models/User.model';
import { Employer } from '../models/Employer.model';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth.middleware';
import mongoose from 'mongoose';

// Get all conversations for the logged-in user
export const getConversations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Determine which model to use based on role
    const userModel = userRole === 'employer' ? 'Employer' : 'User';

    // Find conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: userId,
    })
      .sort({ lastMessageAt: -1 })
      .lean();

    // Populate participant details
    const populatedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        // Find the other participant (not the current user)
        const otherParticipantIndex = conversation.participants.findIndex(
          (p) => p.toString() !== userId.toString()
        );
        
        if (otherParticipantIndex === -1) {
          return null; // Skip if no other participant found
        }

        const otherParticipantId = conversation.participants[otherParticipantIndex];
        const otherParticipantModel = conversation.participantModels[otherParticipantIndex];

        // Fetch participant details based on their model
        let participantDetails;
        if (otherParticipantModel === 'Employer') {
          const employer = await Employer.findById(otherParticipantId)
            .select('companyName logo')
            .lean();
          participantDetails = {
            _id: otherParticipantId,
            name: employer?.companyName || 'Unknown Company',
            avatar: employer?.logo || null,
            type: 'employer',
          };
        } else {
          const user = await User.findById(otherParticipantId)
            .select('firstName lastName profileImage')
            .lean();
          participantDetails = {
            _id: otherParticipantId,
            name: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
            avatar: user?.profileImage || null,
            type: 'jobseeker',
          };
        }

        // Get the last message in this conversation
        const lastMessage = await Message.findOne({
          conversationId: conversation._id,
        })
          .sort({ createdAt: -1 })
          .select('text createdAt isRead senderId')
          .lean();

        // Count unread messages for this user
        const unreadCount = await Message.countDocuments({
          conversationId: conversation._id,
          senderId: { $ne: userId },
          isRead: false,
        });

        return {
          _id: conversation._id,
          participant: participantDetails,
          lastMessage: lastMessage ? {
            text: lastMessage.text,
            createdAt: lastMessage.createdAt,
            isFromMe: lastMessage.senderId.toString() === userId.toString(),
          } : null,
          unreadCount,
          lastMessageAt: conversation.lastMessageAt,
          jobId: conversation.jobId,
        };
      })
    );

    // Filter out null values
    const validConversations = populatedConversations.filter(Boolean);

    ApiResponse.success(res, { conversations: validConversations });
  } catch (error) {
    next(error);
  }
};

// Get all messages in a specific conversation
export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      throw ApiError.notFound('Conversation not found or access denied');
    }

    // Get messages
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .lean();

    // Populate sender details for each message
    const populatedMessages = await Promise.all(
      messages.map(async (message) => {
        let senderDetails;
        
        if (message.senderModel === 'Employer') {
          const employer = await Employer.findById(message.senderId)
            .select('companyName logo')
            .lean();
          senderDetails = {
            _id: message.senderId,
            name: employer?.companyName || 'Unknown',
            avatar: employer?.logo || null,
          };
        } else {
          const user = await User.findById(message.senderId)
            .select('firstName lastName profileImage')
            .lean();
          senderDetails = {
            _id: message.senderId,
            name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
            avatar: user?.profileImage || null,
          };
        }

        return {
          _id: message._id,
          text: message.text,
          sender: senderDetails,
          isFromMe: message.senderId.toString() === userId.toString(),
          isRead: message.isRead,
          createdAt: message.createdAt,
        };
      })
    );

    // Mark messages as read (messages sent by others)
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        isRead: false,
      },
      { isRead: true }
    );

    ApiResponse.success(res, { messages: populatedMessages });
  } catch (error) {
    next(error);
  }
};

// Send a new message
export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const { conversationId, recipientId, text, jobId } = req.body;
    const senderId = req.user._id;
    const senderRole = req.user.role;
    const senderModel = senderRole === 'employer' ? 'Employer' : 'User';

    if (!text || text.trim().length === 0) {
      throw ApiError.badRequest('Message text is required');
    }

    let conversation;

    if (conversationId) {
      // Use existing conversation
      conversation = await Conversation.findOne({
        _id: conversationId,
        participants: senderId,
      });

      if (!conversation) {
        throw ApiError.notFound('Conversation not found or access denied');
      }
    } else if (recipientId) {
      // Create or find conversation with recipient
      if (!recipientId) {
        throw ApiError.badRequest('Recipient ID is required for new conversations');
      }

      // Determine recipient model
      const recipientUser = await User.findById(recipientId);
      const recipientEmployer = await Employer.findById(recipientId);
      
      if (!recipientUser && !recipientEmployer) {
        throw ApiError.notFound('Recipient not found');
      }

      const recipientModel = recipientEmployer ? 'Employer' : 'User';

      // Check if conversation already exists
      conversation = await Conversation.findOne({
        participants: { $all: [senderId, recipientId] },
        ...(jobId ? { jobId } : {}),
      });

      if (!conversation) {
        // Create new conversation
        conversation = await Conversation.create({
          participants: [senderId, recipientId],
          participantModels: [senderModel, recipientModel],
          jobId: jobId || null,
          lastMessageAt: new Date(),
        });
      }
    } else {
      throw ApiError.badRequest('Either conversationId or recipientId is required');
    }

    // Create the message
    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      senderModel,
      text: text.trim(),
      isRead: false,
    });

    // Update conversation's lastMessageAt
    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessageAt: new Date(),
    });

    // Populate sender details for response
    let senderDetails;
    if (senderModel === 'Employer') {
      const employer = await Employer.findById(senderId)
        .select('companyName logo')
        .lean();
      senderDetails = {
        _id: senderId,
        name: employer?.companyName || 'Unknown',
        avatar: employer?.logo || null,
      };
    } else {
      const user = await User.findById(senderId)
        .select('firstName lastName profileImage')
        .lean();
      senderDetails = {
        _id: senderId,
        name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        avatar: user?.profileImage || null,
      };
    }

    const responseMessage = {
      _id: message._id,
      conversationId: conversation._id,
      text: message.text,
      sender: senderDetails,
      isFromMe: true,
      isRead: message.isRead,
      createdAt: message.createdAt,
    };

    ApiResponse.created(res, { message: responseMessage }, 'Message sent successfully');
  } catch (error) {
    next(error);
  }
};

// Mark conversation as read
export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw ApiError.unauthorized();

    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      throw ApiError.notFound('Conversation not found or access denied');
    }

    // Mark all messages from others as read
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        isRead: false,
      },
      { isRead: true }
    );

    ApiResponse.success(res, null, 'Messages marked as read');
  } catch (error) {
    next(error);
  }
};
