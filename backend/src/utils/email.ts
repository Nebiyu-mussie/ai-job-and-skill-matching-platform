import { logger } from './logger';
import axios from 'axios';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private emailApiUrl: string;
  private apiSecretKey: string;
  private isConfigured: boolean = false;
  private isDevelopment: boolean = process.env.NODE_ENV === 'development';

  constructor() {
    this.emailApiUrl = `${process.env.FRONTEND_URL}/api/send-email`;
    this.apiSecretKey = process.env.API_SECRET_KEY || '';
    this.initializeEmailProxy();
  }

  private initializeEmailProxy(): void {
    const frontendUrl = process.env.FRONTEND_URL;
    const apiSecretKey = process.env.API_SECRET_KEY;

    if (!frontendUrl || !apiSecretKey) {
      logger.warn('⚠️  EMAIL SERVICE NOT CONFIGURED:');
      logger.warn('   FRONTEND_URL or API_SECRET_KEY is missing in environment variables.');
      logger.warn('   Required: FRONTEND_URL, API_SECRET_KEY');
      logger.warn('   Emails will be LOGGED TO CONSOLE in development mode.');
      this.isConfigured = false;
      return;
    }

    this.isConfigured = true;
    logger.info('✅ Email service configured successfully with Vercel proxy');
    logger.info(`   Proxy URL: ${this.emailApiUrl}`);
  }

  async send(options: EmailOptions): Promise<void> {
    console.log('🚨 Email.send() called!', { to: options.to, subject: options.subject });

    // In development mode without config, log the email details
    if (!this.isConfigured) {
      if (this.isDevelopment) {
        console.log('\n📧 ========== EMAIL (Development Mode - Not Sent) ==========');
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        
        // Extract OTP code from HTML for development
        const otpMatch = options.html.match(/font-family: 'Courier New', monospace;">(\d{6})</);
        if (otpMatch && otpMatch[1]) {
          console.log(`🔢 OTP CODE: ${otpMatch[1]}`);
        }
        
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
        logger.info(`To: ${options.to}`);
        logger.info(`Subject: ${options.subject}`);
        
        if (otpMatch && otpMatch[1]) {
          logger.info(`🔢 OTP CODE: ${otpMatch[1]}`);
        }
        
        if (urlMatch && urlMatch[1]) {
          logger.info(`🔗 ACTION LINK: ${urlMatch[1]}`);
          const tokenMatch = urlMatch[1].match(/\/([a-f0-9]{64}|[a-zA-Z0-9]{40,})$/);
          if (tokenMatch) {
            logger.info(`🎫 TOKEN: ${tokenMatch[1]}`);
          }
        }
        
        logger.info('📧 ========================================================');
        // In development mode, succeed even without sending
        return;
      } else {
        // In production without config, throw error
        const error = new Error('Email service not configured - FRONTEND_URL or API_SECRET_KEY missing');
        logger.error('❌ Cannot send email: Email proxy not configured in production environment');
        logger.error('   Please set FRONTEND_URL and API_SECRET_KEY environment variables');
        throw error;
      }
    }

    try {
      // Call Vercel serverless function via HTTP
      const response = await axios.post(
        this.emailApiUrl,
        {
          email: options.to,
          subject: options.subject,
          html: options.html,
          apiSecretKey: this.apiSecretKey,
        },
        {
          timeout: 30000, // 30 second timeout
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        console.log('📧 Email sent successfully via Vercel proxy:', response.data.messageId);
        logger.info(`✅ Email sent successfully via Vercel proxy to ${options.to}`);
        logger.info(`   Message ID: ${response.data.messageId}`);
        
        if (response.data.accepted && response.data.accepted.length > 0) {
          logger.info(`   Accepted: ${response.data.accepted.join(', ')}`);
        }
        if (response.data.rejected && response.data.rejected.length > 0) {
          logger.warn(`   Rejected: ${response.data.rejected.join(', ')}`);
        }
      } else {
        throw new Error('Email API returned unsuccessful response');
      }
    } catch (error: any) {
      console.error('❌ Email Proxy Dispatch Error:', error.message);
      logger.error('❌ Email sending via proxy failed:', error.message);
      
      if (error.response) {
        logger.error('   Status:', error.response.status);
        logger.error('   Data:', JSON.stringify(error.response.data));
      }
      
      // Extract OTP code for debugging
      const otpMatch = options.html.match(/font-family: 'Courier New', monospace;">(\d{6})</);
      if (otpMatch && otpMatch[1]) {
        console.log('🔢 OTP CODE (for debugging):', otpMatch[1]);
        logger.error('🔢 OTP CODE (for debugging):', otpMatch[1]);
      }
      
      // Extract and log action link as fallback
      const urlMatch = options.html.match(/href="([^"]+)"/);
      if (urlMatch && urlMatch[1]) {
        console.log('🔗 Action Link Fallback:', urlMatch[1]);
        logger.error('🔗 Action Link Fallback:', urlMatch[1]);
        
        // Extract token from URL if present
        const tokenMatch = urlMatch[1].match(/\/([a-f0-9]{64}|[a-zA-Z0-9]{40,})$/);
        if (tokenMatch) {
          console.log('🎫 TOKEN:', tokenMatch[1]);
          logger.error('🎫 TOKEN:', tokenMatch[1]);
        }
      }
      
      logger.error('📧 Email details (for manual delivery):');
      logger.error(`   To: ${options.to}`);
      logger.error(`   Subject: ${options.subject}`);
      
      // THROW the error so caller can handle it appropriately
      throw new Error(`Failed to send email via proxy: ${error.message}`);
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

  async sendOTP(name: string, email: string, otp: string): Promise<void> {
    await this.send({
      to: email,
      subject: 'AI Job Platform - Email Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><title>Email Verification</title></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
          <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4F46E5; font-size: 28px; margin: 0;">AI Job Platform</h1>
              <p style="color: #6B7280; margin-top: 8px;">Ethiopia's Premier AI-Powered Recruitment Platform</p>
            </div>
            <h2 style="color: #111827;">Welcome, ${name}! 🎉</h2>
            <p style="color: #374151; line-height: 1.6;">
              Thank you for registering with AI Job Platform. To complete your registration, please verify your email address using the code below:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #F3F4F6; border: 2px solid #E5E7EB; border-radius: 8px; padding: 20px; display: inline-block;">
                <p style="color: #6B7280; font-size: 14px; margin: 0 0 8px 0; font-weight: 600;">VERIFICATION CODE</p>
                <p style="font-size: 36px; font-weight: bold; color: #4F46E5; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</p>
              </div>
            </div>
            <p style="color: #374151; line-height: 1.6;">
              Enter this code in the verification screen to activate your account.
            </p>
            <p style="color: #EF4444; font-size: 14px; font-weight: 600; margin-top: 20px;">
              ⏱️ This code expires in 10 minutes.
            </p>
            <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
              If you didn't create an account, please ignore this email and the code will expire automatically.
            </p>
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
            <p style="color: #9CA3AF; font-size: 12px; text-align: center;">© 2024 AI Job Platform. All rights reserved. | Addis Ababa, Ethiopia</p>
          </div>
        </body>
        </html>
      `,
    });
  }
}

export const emailService = new EmailService();
