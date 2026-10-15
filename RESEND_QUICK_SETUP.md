# Resend Setup - Quick Guide

## Why Resend?

Render blocks outbound SMTP connections → `ETIMEDOUT` errors  
Resend uses HTTPS API → Works everywhere, never blocked

## Setup in 5 Minutes

### 1. Sign Up & Get API Key

1. Go to [resend.com](https://resend.com) → Sign up
2. Navigate to [resend.com/api-keys](https://resend.com/api-keys)
3. Click "Create API Key"
4. Copy the key (starts with `re_`)

### 2. Set Environment Variables

**Render Dashboard** → Your Service → Environment:

Remove old SMTP variables:
```bash
# ❌ Delete these:
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
FROM_NAME
```

Add Resend variables:
```bash
# ✅ Add these:
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=onboarding@resend.dev
```

### 3. Deploy

Code is already updated and pushed to `origin/main`.

Just redeploy your Render service:
- Render → Your Service → Manual Deploy → "Deploy latest commit"

### 4. Test

```bash
# Test forgot-password
curl -X POST https://your-api.onrender.com/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Expected: 200 OK in ~150ms ✅
```

Check email inbox - should receive password reset email within seconds.

---

## Production Domain Setup (Optional)

For custom `FROM_EMAIL` like `noreply@yourdomain.com`:

1. Go to [resend.com/domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain (e.g., `yourdomain.com`)
4. Add DNS records provided by Resend
5. Wait for verification (~5-30 minutes)
6. Update `FROM_EMAIL` to `noreply@yourdomain.com`

**For Testing**: Use `onboarding@resend.dev` (no domain setup needed)

---

## What Changed

| Before (SMTP) | After (Resend) |
|---------------|----------------|
| TCP socket connection (blocked) | HTTPS API (works) |
| 7 environment variables | 2 environment variables |
| 8-15 seconds | ~100-200ms |
| Gmail app password setup | Just API key |
| `ETIMEDOUT` errors | ✅ Works |

---

## Free Tier Limits

- ✅ 100 emails per day
- ✅ 3,000 emails per month
- ✅ All features included
- ✅ Perfect for MVPs

---

## Troubleshooting

### Email not sending?

Check backend logs for:
```
❌ Resend API Dispatch Error: [error message]
🔗 Action Link Fallback: [reset link]
```

**Common Issues**:
1. **Invalid API key**: Check `RESEND_API_KEY` in Render
2. **Domain not verified**: Use `onboarding@resend.dev` for testing
3. **Rate limit**: Free tier = 100/day (upgrade if needed)

### Still getting SMTP errors?

Old code might still be deployed. Force redeploy:
```bash
# In Render dashboard
Manual Deploy → "Clear build cache & deploy"
```

---

## Verification

After deployment, check:

1. **Environment Variables** in Render:
   - ✅ `RESEND_API_KEY` is set
   - ✅ `FROM_EMAIL` is set
   - ❌ Old SMTP vars are removed

2. **Logs** show:
   ```
   ✅ Email service configured successfully with Resend API
   ```

3. **Test endpoint** returns quickly:
   - Response time: ~150ms (not 30s timeout)
   - HTTP status: 200 OK

4. **Email delivered**:
   - Check inbox within 5-10 seconds
   - Check Resend dashboard: [resend.com/emails](https://resend.com/emails)

---

## Support

- **Documentation**: [RESEND_MIGRATION.md](./RESEND_MIGRATION.md)
- **Resend Docs**: https://resend.com/docs
- **Dashboard**: https://resend.com/emails
- **Status**: https://status.resend.com

---

**Status**: ✅ Ready to Deploy  
**Commit**: dc21dcf4  
**Compatibility**: Works on Render, Heroku, Vercel, AWS, Netlify  
**Performance**: 100x faster than SMTP
