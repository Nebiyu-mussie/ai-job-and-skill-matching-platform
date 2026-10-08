# 📧 Email System Setup Guide

## Overview

The AI Job Platform uses **Nodemailer** with SMTP for sending emails:
- Welcome emails with email verification
- Password reset emails
- Application status updates
- Job match notifications

## Current Status

⚠️ **Email service is NOT configured** - SMTP credentials are missing in `.env`

In **development mode**, emails are **logged to the console** instead of being sent. You'll see the reset links and tokens in the backend logs.

In **production mode** (Render), you MUST configure SMTP for emails to work.

---

## Development Mode (Current Setup)

### How It Works

1. User requests password reset
2. Backend generates reset token
3. Instead of sending email, the system logs:
   ```
   📧 ========== EMAIL (Development Mode - Not Sent) ==========
   To: user@example.com
   Subject: AI Job Platform - Password Reset Request
   From: AI Job Platform <noreply@aijobplatform.com>
   🔗 ACTION LINK: http://localhost:5173/reset-password/abc123...
   🎫 TOKEN: abc123def456...
   📧 ========================================================
   ```

### Testing Password Reset Locally

1. Go to http://localhost:5173/forgot-password
2. Enter email: `john.doe@gmail.com`
3. Click "Send Reset Link"
4. Check **backend console** for the reset link
5. Copy the full URL and paste it in browser
6. Set new password

### Backend Logs Location

Check your terminal where `npm run dev` is running in the `backend/` folder.

---

## Production Setup (Render)

### Required Environment Variables

Set these in your **Render Dashboard** → **Environment** tab:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_NAME=AI Job Platform
FROM_EMAIL=noreply@aijobplatform.com
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

---

## Email Provider Options

### Option 1: Gmail (Quick Setup for Testing)

**Pros**: Easy to set up, no cost
**Cons**: Daily sending limits, may go to spam

#### Setup Steps:

1. **Enable 2-Factor Authentication**
   - Go to Google Account: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "AI Job Platform"
   - Copy the 16-character password

3. **Add to Render Environment Variables**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=youremail@gmail.com
   SMTP_PASS=abcd efgh ijkl mnop
   FROM_NAME=AI Job Platform
   FROM_EMAIL=youremail@gmail.com
   ```

**Note**: Remove spaces from the app password when copying!

---

### Option 2: SendGrid (Recommended for Production)

**Pros**: Professional, reliable, 100 free emails/day, better deliverability
**Cons**: Requires domain verification for best results

#### Setup Steps:

1. **Sign Up**
   - Go to https://sendgrid.com/free/
   - Create a free account (100 emails/day)

2. **Create API Key**
   - Dashboard → Settings → API Keys
   - Click "Create API Key"
   - Name: "AI Job Platform"
   - Permissions: "Full Access" or "Mail Send"
   - Copy the API key (save it immediately!)

3. **Verify Sender Identity**
   - Settings → Sender Authentication
   - Option A: Single Sender Verification (quick, but may go to spam)
   - Option B: Domain Authentication (best, requires DNS setup)

4. **Add to Render Environment Variables**:
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=SG.your-actual-sendgrid-api-key-here
   FROM_NAME=AI Job Platform
   FROM_EMAIL=verified-sender@yourdomain.com
   ```

**Important**: 
- `SMTP_USER` must be exactly `apikey` (not your email)
- `FROM_EMAIL` must be the verified sender email

---

### Option 3: Resend (Modern Alternative)

**Pros**: Developer-friendly, 3,000 free emails/month, great documentation
**Cons**: Newer service

#### Setup Steps:

1. **Sign Up**
   - Go to https://resend.com/signup
   - Create account (3,000 emails/month free)

2. **Get API Key**
   - Dashboard → API Keys → Create API Key
   - Copy the key

3. **Verify Domain** (optional but recommended)
   - Add your domain
   - Add DNS records

4. **Configure** (requires code change to use Resend SDK)
   - Currently uses Nodemailer, would need minor changes

---

### Option 4: AWS SES (Cost-Effective for Scale)

**Pros**: Very cheap ($0.10 per 1,000 emails), highly scalable
**Cons**: More complex setup, requires AWS account

#### Setup Steps:

1. **Create AWS Account**
   - Go to https://aws.amazon.com/ses/

2. **Verify Email/Domain**
   - SES Console → Verified Identities
   - Verify sender email

3. **Request Production Access**
   - By default, SES is in sandbox mode (can only send to verified emails)
   - Request production access: SES → Account Dashboard → "Request Production Access"

4. **Get SMTP Credentials**
   - SES → SMTP Settings → Create SMTP Credentials
   - Download the credentials

5. **Add to Render**:
   ```env
   SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   SMTP_PORT=587
   SMTP_USER=your-ses-smtp-username
   SMTP_PASS=your-ses-smtp-password
   FROM_NAME=AI Job Platform
   FROM_EMAIL=verified@yourdomain.com
   ```

---

## How to Set Environment Variables in Render

1. **Go to Render Dashboard**
   - Visit https://dashboard.render.com
   - Select your backend service

2. **Navigate to Environment**
   - Click "Environment" in the left sidebar

3. **Add Variables**
   - Click "Add Environment Variable"
   - Enter key and value
   - Repeat for all SMTP variables

4. **Required Variables**:
   ```
   SMTP_HOST
   SMTP_PORT
   SMTP_USER
   SMTP_PASS
   FROM_NAME
   FROM_EMAIL
   FRONTEND_URL (must be your Vercel URL)
   ```

5. **Save and Redeploy**
   - Click "Save Changes"
   - Render will automatically redeploy with new variables

---

## Testing Email Delivery

### Test 1: Password Reset Flow

1. **Request Reset**:
   ```bash
   curl -X POST https://your-api.render.com/api/v1/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

2. **Check Email Inbox**
   - Look for "AI Job Platform - Password Reset Request"
   - Click the reset link
   - Should redirect to your frontend with token

3. **Check Logs**:
   - Render Dashboard → Logs
   - Look for "✅ Email sent successfully"

### Test 2: Welcome Email (Registration)

1. Register a new account
2. Check email for "Welcome to AI Job Platform"
3. Verify email link should work

---

## Troubleshooting

### Issue: "Email service NOT CONFIGURED" in logs

**Solution**: Add SMTP environment variables to Render

### Issue: "SMTP connection failed"

**Solutions**:
- Check SMTP credentials are correct
- Verify SMTP_HOST and SMTP_PORT
- For Gmail: Make sure you're using App Password, not regular password
- For SendGrid: Verify `SMTP_USER` is exactly `apikey`

### Issue: Emails going to spam

**Solutions**:
- Set up SPF/DKIM records for your domain
- Use SendGrid or AWS SES with domain authentication
- Add unsubscribe links (already included in templates)
- Avoid spam trigger words in subject lines

### Issue: "Invalid or expired reset token"

**Causes**:
- Token expired (10 minutes for password reset)
- Token already used
- Token was for a different environment (dev vs production)

**Solution**: Request a new reset link

### Issue: Reset link points to localhost instead of production URL

**Solution**: Set `FRONTEND_URL` in Render environment variables:
```env
FRONTEND_URL=https://your-app.vercel.app
```

---

## Email Templates

The system sends these automated emails:

### 1. Welcome Email (Registration)
- **Subject**: "Welcome to AI Job Platform - Verify Your Email"
- **Contains**: Email verification link (24-hour expiry)

### 2. Password Reset
- **Subject**: "AI Job Platform - Password Reset Request"
- **Contains**: Password reset link (10-minute expiry)

### 3. Application Status Update
- **Subject**: "Application Update: [Job Title] at [Company]"
- **Contains**: Status, message, link to dashboard

### 4. Job Match Notification
- **Subject**: "[N] New Job Matches Found For You!"
- **Contains**: List of matched jobs with scores

---

## Security Best Practices

1. **Never commit SMTP credentials** to git
   - `.env` is already in `.gitignore`
   - Use environment variables in production

2. **Use App Passwords** for Gmail
   - Never use your actual Gmail password

3. **Rotate Keys Regularly**
   - Change SMTP passwords every 90 days
   - Regenerate API keys periodically

4. **Monitor Usage**
   - Check email service dashboards for unusual activity
   - Set up alerts for high sending volumes

5. **Rate Limiting**
   - System already implements rate limiting
   - Prevents email bombing attacks

---

## Cost Comparison

| Provider | Free Tier | Paid Plans | Best For |
|----------|-----------|------------|----------|
| **Gmail** | Unlimited (with limits) | N/A | Development/Testing |
| **SendGrid** | 100/day | $15/mo (40k) | Small-Medium apps |
| **Resend** | 3,000/month | $20/mo (50k) | Startups |
| **AWS SES** | 3,000/month* | $0.10/1000 | High volume |
| **Mailgun** | 5,000/month | $35/mo (50k) | Enterprise |

*AWS SES free tier if sending from EC2

---

## Monitoring Email Delivery

### Check Render Logs

```bash
# Real-time logs
render logs -f -n your-backend-service

# Search for email logs
render logs -n your-backend-service | grep "Email"
```

### Check for Errors

Look for these log messages:
- ✅ `Email sent successfully to user@example.com`
- ❌ `Email sending failed: [error]`
- ⚠️ `EMAIL SERVICE NOT CONFIGURED`

---

## Environment Variables Summary

### Development (.env)
```env
# Not set - emails logged to console
```

### Production (Render)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your-key-here
FROM_NAME=AI Job Platform
FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=https://your-app.vercel.app
```

---

## Quick Start Checklist

For immediate production deployment:

- [ ] Choose email provider (SendGrid recommended)
- [ ] Create account and get SMTP credentials
- [ ] Verify sender email/domain
- [ ] Add environment variables to Render
- [ ] Set correct FRONTEND_URL
- [ ] Test password reset flow
- [ ] Monitor logs for successful delivery
- [ ] Check spam folder if emails don't arrive

---

## Support

If you encounter issues:

1. Check backend logs in Render
2. Verify all environment variables are set
3. Test SMTP connection with a tool like https://www.smtper.net/
4. Review provider documentation:
   - SendGrid: https://docs.sendgrid.com/
   - AWS SES: https://docs.aws.amazon.com/ses/
   - Gmail SMTP: https://support.google.com/mail/answer/7126229

---

**Last Updated**: Task 9 - Email System Fix
**Status**: ✅ Development mode working (logs to console), Production requires SMTP setup
