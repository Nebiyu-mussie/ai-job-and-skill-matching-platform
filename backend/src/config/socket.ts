import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { User } from '../models/User.model';

let io: SocketIOServer;

// Connected users map: userId -> socketId
const connectedUsers = new Map<string, string>();

export const initSocket = (httpServer: HTTPServer): void => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        const allowedOrigins = [
          process.env.FRONTEND_URL || 'http://localhost:5173',
          'http://localhost:5173',
          'http://localhost:3000',
        ];
        
        // Allow requests with no origin or from allowed origins or Vercel
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(async (socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as { id: string };

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('User not found'));
      }

      (socket as any).user = user;
      next();
    } catch {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    logger.info(`User connected: ${user._id} (${socket.id})`);

    // Add user to connected map
    connectedUsers.set(user._id.toString(), socket.id);

    // Join user's personal room
    socket.join(`user:${user._id}`);

    // Join role-based room
    socket.join(`role:${user.role}`);

    // Handle joining employer room
    if (user.role === 'employer' && user.employer) {
      socket.join(`employer:${user.employer}`);
    }

    // Emit online status
    socket.broadcast.emit('userOnline', { userId: user._id });

    // Handle chat messages
    socket.on('sendMessage', async (data) => {
      try {
        const { recipientId, content, jobId } = data;
        const recipientSocketId = connectedUsers.get(recipientId);

        if (recipientSocketId) {
          io.to(recipientSocketId).emit('newMessage', {
            senderId: user._id,
            content,
            jobId,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        logger.error('Socket sendMessage error:', error);
      }
    });

    // Handle typing indicator
    socket.on('typing', ({ recipientId, isTyping }) => {
      const recipientSocketId = connectedUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('userTyping', {
          userId: user._id,
          isTyping,
        });
      }
    });

    // Handle read receipts
    socket.on('markAsRead', ({ messageId, senderId }) => {
      const senderSocketId = connectedUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('messageRead', { messageId });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${user._id} (${socket.id})`);
      connectedUsers.delete(user._id.toString());
      socket.broadcast.emit('userOffline', { userId: user._id });
    });
  });

  logger.info('✅ Socket.IO initialized');
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

export const emitToUser = (userId: string, event: string, data: any): void => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

export const emitToRole = (role: string, event: string, data: any): void => {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
  }
};

export const isUserOnline = (userId: string): boolean => {
  return connectedUsers.has(userId);
};
