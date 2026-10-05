import { Notification, INotification } from '../models/Notification.model';
import { emitToUser } from '../config/socket';
import { emailService } from '../utils/email';
import { User } from '../models/User.model';
import { logger } from '../utils/logger';

interface CreateNotificationDTO {
  recipientId: string;
  senderId?: string;
  type: INotification['type'];
  title: string;
  message: string;
  data?: Record<string, any>;
  link?: string;
  priority?: INotification['priority'];
  channel?: INotification['channel'];
}

class NotificationService {
  async create(dto: CreateNotificationDTO): Promise<INotification> {
    const notification = await Notification.create({
      recipient: dto.recipientId,
      sender: dto.senderId,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      data: dto.data,
      link: dto.link,
      priority: dto.priority || 'normal',
      channel: dto.channel || 'both',
    });

    // Emit real-time notification
    emitToUser(dto.recipientId, 'notification', {
      _id: notification._id,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      data: dto.data,
      link: dto.link,
      createdAt: notification.createdAt,
    });

    // Send email if channel is 'email' or 'both'
    if (dto.channel !== 'in_app') {
      try {
        const recipient = await User.findById(dto.recipientId);
        if (recipient?.email && recipient.isEmailVerified) {
          await emailService.send({
            to: recipient.email,
            subject: dto.title,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #4F46E5;">${dto.title}</h2>
                <p>${dto.message}</p>
                ${dto.link ? `<a href="${dto.link}" style="color: #4F46E5;">View Details →</a>` : ''}
              </div>
            `,
          });
          await Notification.findByIdAndUpdate(notification._id, { emailSent: true });
        }
      } catch (error) {
        logger.error('Email notification failed:', error);
      }
    }

    return notification;
  }

  async getByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sender', 'firstName lastName profileImage')
        .lean(),
      Notification.countDocuments({ recipient: userId }),
      Notification.countDocuments({ recipient: userId, isRead: false }),
    ]);

    return { notifications, total, unreadCount };
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true, readAt: new Date() }
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    await Notification.findOneAndDelete({ _id: notificationId, recipient: userId });
  }

  async notifyApplicationReceived(
    employerId: string,
    applicantName: string,
    jobTitle: string,
    applicationId: string
  ): Promise<void> {
    await this.create({
      recipientId: employerId,
      type: 'application_received',
      title: 'New Application Received',
      message: `${applicantName} applied for ${jobTitle}`,
      link: `/dashboard/applications/${applicationId}`,
      data: { applicationId },
    });
  }

  async notifyApplicationStatusUpdate(
    applicantId: string,
    jobTitle: string,
    companyName: string,
    status: string,
    applicationId: string
  ): Promise<void> {
    await this.create({
      recipientId: applicantId,
      type: 'application_status_update',
      title: 'Application Status Updated',
      message: `Your application for ${jobTitle} at ${companyName} is now ${status}`,
      link: `/dashboard/applications/${applicationId}`,
      data: { applicationId, status },
      priority: status === 'offered' || status === 'hired' ? 'high' : 'normal',
    });
  }

  async notifyNewJobMatch(
    userId: string,
    jobs: Array<{ title: string; company: string; matchScore: number; jobId: string }>
  ): Promise<void> {
    if (jobs.length === 0) return;

    await this.create({
      recipientId: userId,
      type: 'new_job_match',
      title: `${jobs.length} New Job Match${jobs.length > 1 ? 'es' : ''} Found!`,
      message: `We found ${jobs.length} job${jobs.length > 1 ? 's' : ''} matching your profile. Top match: ${jobs[0].title} (${jobs[0].matchScore}%)`,
      link: '/dashboard/recommendations',
      data: { jobs },
    });
  }
}

export const notificationService = new NotificationService();
