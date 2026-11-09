import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, subject, html, otpCode, apiSecretKey } = req.body;

    // Security check: Verify API secret key
    if (!apiSecretKey || apiSecretKey !== process.env.API_SECRET_KEY) {
      console.error('❌ Invalid API secret key');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate required fields
    if (!email || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields: email, subject, html' });
    }

    // Configure SMTP transporter with Gmail
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      console.error('❌ SMTP credentials not configured');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: true, // true for port 465
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Prepare email options
    const fromName = process.env.FROM_NAME || 'AI Job Platform';
    const mailOptions = {
      from: `"${fromName}" <${smtpUser}>`,
      to: email,
      subject: subject,
      html: html,
    };

    // Send email
    console.log('📧 Sending email to:', email);
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully:', info.messageId);
    
    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    });
  } catch (error: any) {
    console.error('❌ Email sending error:', error);
    return res.status(500).json({
      error: 'Failed to send email',
      message: error.message,
    });
  }
}
