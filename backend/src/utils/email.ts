import nodemailer, { Transporter } from 'nodemailer';
import { logger } from './logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured: boolean = false;
  private isDevelopment: boolean = process.env.NODE_ENV === 'development';

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST;

    if (!smtpUser || !smtpPass) {
      logger.warn('⚠️  EMAIL SERVICE NOT CONFIGURED:');
      logger.warn('   SMTP credentials are missing in environment variables.');
      logger.warn('   Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_NAME, FROM_EMAIL');
      logger.warn('   Emails will be LOGGED TO CONSOLE in development mode.');
      logger.warn('   Set these environment variables in Render for production email delivery.');
      this.isConfigured = false;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: smtpHost || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      this.isConfigured = true;
      logger.info('✅ Email service configured successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize email transporter:', error);
      this.isConfigured = false;
    }
  }

  async send(options: EmailOptions): Promise<void> {
    console.log('🚨 Email.send() called!', { to: options.to, subject: options.subject });
    
    const mailOptions = {
      from: `${process.env.FROM_NAME || 'AI Job Platform'} <${process.env.FROM_EMAIL || 'noreply@aijobplatform.com'}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    // In development mode without SMTP config, log the email details
    if (!this.isConfigured) {
      if (this.isDevelopment) {
        console.log('\n📧 ========== EMAIL (Development Mode - Not Sent) ==========');
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`From: ${mailOptions.from}`);
        
        // Extract reset URL or verification URL from HTML
        const urlMatch = options.html.match(/href="([^"]+)"/);
        if (urlMatch && urlMatch[1]) {
          console.log(`🔗 ACTION LINK: ${urlMatch[1]}`);
          
          // Extract token from URL
          const tokenMatch = urlMatch[1].match(/\/([a-f0-9]{64}|[a-zA-Z0-9]{40,})$/);
          if (tokenMatch) {
            console.log(`🎫 TOKEN: ${tokenMatch[1]}`);
          }
        }
        
        console.log('📧 ========================================================\n');
        
        logger.info('📧 ========== EMAIL (Development Mode - Not Sent) ==========');
        logger.info(`To: ${mailOptions.to}`);
        logger.info(`Subject: ${mailOptions.subject}`);
        logger.info(`From: ${mailOptions.from}`);
        
        if (urlMatch && urlMatch[1]) {
          logger.info(`🔗 ACTION LINK: ${urlMatch[1]}`);
          const tokenMatch = urlMatch[1].match(/\/([a-f0-9]{64}|[a-zA-Z0-9]{40,})$/);
          if (tokenMatch) {
            logger.info(`🎫 TOKEN: ${tokenMatch[1]}`);
          }
        }
        
        logger.info('📧 ========================================================');
      } else {
        logger.error('❌ Cannot send email: SMTP not configured in production environment');
        logger.error('   Please set SMTP environment variables in Render dashboard');
      }
      return;
    }

    try {
      await this.transporter!.sendMail(mailOptions);
      logger.info(`✅ Email sent successfully to ${options.to}`);
    } catch (error: any) {
      logger.error('❌ Email sending failed:', error.message);
      if (this.isDevelopment) {
        logger.error('📧 Email details (for debugging):');
        logger.error(`   To: ${mailOptions.to}`);
        logger.error(`   Subject: ${mailOptions.subject}`);
      }
      // Don't throw - email failures shouldn't break the application
    }
  }

  async sendWelcome(name: string, email: string, verificationUrl: string): Promise<void> {
    await this.send({
      to: email,
      subject: 'Welcome to AI Job Platform - Verify Your Email',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><title>Welcome</title></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
          <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4F46E5; font-size: 28px; margin: 0;">AI Job Platform</h1>
              <p style="color: #6B7280; margin-top: 8px;">Ethiopia's Premier AI-Powered Recruitment Platform</p>
            </div>
            <h2 style="color: #111827;">Welcome, ${name}! 🎉</h2>
            <p style="color: #374151; line-height: 1.6;">
              Thank you for joining AI Job Platform. We're excited to help you find your dream job using the power of AI.
            </p>
            <p style="color: #374151; line-height: 1.6;">Please verify your email address to get started:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #4F46E5; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p style="color: #6B7280; font-size: 14px;">This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
            <p style="color: #9CA3AF; font-size: 12px; text-align: center;">© 2024 AI Job Platform. All rights reserved. | Addis Ababa, Ethiopia</p>
          </div>
        </body>
        </html>
      `,
    });
  }

  async sendPasswordReset(name: string, email: string, resetUrl: string): Promise<void> {
    await this.send({
      to: email,
      subject: 'AI Job Platform - Password Reset Request',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
          <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h1 style="color: #4F46E5;">Password Reset</h1>
            <p>Hi ${name},</p>
            <p>You requested a password reset. Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #EF4444; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #6B7280; font-size: 14px;">This link expires in 10 minutes. If you didn't request this, please ignore this email and your password will remain unchanged.</p>
          </div>
        </body>
        </html>
      `,
    });
  }

  async sendApplicationStatus(
    name: string,
    email: string,
    jobTitle: string,
    companyName: string,
    status: string,
    message?: string
  ): Promise<void> {
    const statusColors: Record<string, string> = {
      reviewing: '#F59E0B',
      shortlisted: '#10B981',
      interviewed: '#3B82F6',
      offered: '#8B5CF6',
      hired: '#059669',
      rejected: '#EF4444',
    };
    const color = statusColors[status] || '#6B7280';
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);

    await this.send({
      to: email,
      subject: `Application Update: ${jobTitle} at ${companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
          <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h1 style="color: #4F46E5;">Application Update</h1>
            <p>Hi ${name},</p>
            <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been updated.</p>
            <div style="background: ${color}15; border-left: 4px solid ${color}; padding: 16px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; color: ${color}; font-weight: 600; font-size: 18px;">Status: ${statusText}</p>
              ${message ? `<p style="margin: 8px 0 0; color: #374151;">${message}</p>` : ''}
            </div>
            <p>Log in to your dashboard to view the full details.</p>
          </div>
        </body>
        </html>
      `,
    });
  }

  async sendNewJobMatch(
    name: string,
    email: string,
    jobs: Array<{ title: string; company: string; matchScore: number; url: string }>
  ): Promise<void> {
    const jobCards = jobs
      .map(
        (job) => `
        <div style="border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; margin: 12px 0;">
          <h3 style="margin: 0; color: #111827;">${job.title}</h3>
          <p style="color: #6B7280; margin: 4px 0;">${job.company}</p>
          <div style="background: #EEF2FF; color: #4F46E5; padding: 4px 12px; border-radius: 999px; display: inline-block; font-size: 14px; font-weight: 600;">
            ${job.matchScore}% Match
          </div>
          <a href="${job.url}" style="display: block; margin-top: 12px; color: #4F46E5; text-decoration: none; font-weight: 600;">View Job →</a>
        </div>
      `
      )
      .join('');

    await this.send({
      to: email,
      subject: `${jobs.length} New Job Matches Found For You!`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
          <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h1 style="color: #4F46E5;">New Job Matches! 🎯</h1>
            <p>Hi ${name}, we found ${jobs.length} jobs that match your profile:</p>
            ${jobCards}
          </div>
        </body>
        </html>
      `,
    });
  }
}

export const emailService = new EmailService();
