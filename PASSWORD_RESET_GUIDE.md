# Password Reset Flow - Complete Guide

## Overview
The password reset feature allows users to securely reset their password via email token validation. This guide documents the complete flow, token handling, and troubleshooting.

## Architecture

### Backend Flow (Node.js/TypeScript)

#### 1. Forgot Password (`POST /api/v1/auth/forgot-password`)
**File**: `backend/src/services/auth.service.ts` → `forgotPassword()`

```typescript
// Generate cryptographically secure token
const resetToken = crypto.randomBytes(32).toString('hex'); // 64-char hex string

// Hash the token before storing
const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

// Store hash and expiry in database
user.passwordResetToken = hashedToken;
user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

// Return unhashed token (sent via email)
return resetToken;
```

**Key Points**:
- Raw token: 64 characters (32 bytes hex-encoded)
- Stored hash: SHA-256 digest
- Expiry: 1 hour from generation
- Raw token sent to user's email (never stored)

#### 2. Reset Password (`POST /api/v1/auth/reset-password/:token`)
**File**: `backend/src/services/auth.service.ts` → `resetPassword()`

```typescript
// Clean and hash incoming token
const cleanToken = token.trim();
const hashedToken = crypto.createHash('sha256').update(cleanToken).digest('hex');

// Query database with hashed token
const user = await User.findOne({
  passwordResetToken: hashedToken,
  passwordResetExpires: { $gt: Date.now() }
});

if (!user) {
  throw new AppError('Invalid or expired reset token', 400);
}

// Update password and clear reset fields
user.password = newPassword; // Hashed via pre-save hook
user.passwordResetToken = undefined;
user.passwordResetExpires = undefined;
await user.save();
```

**Validation Steps**:
1. Trim whitespace from token
2. Hash with SHA-256
3. Query database for matching hash
4. Verify expiry timestamp
5. Update password and clear reset fields

### Frontend Flow (React/TypeScript)

#### 1. Forgot Password Page
**File**: `frontend/src/pages/auth/ForgotPasswordPage.tsx`

```typescript
const { mutate: forgotPassword } = useForgotPassword();

forgotPassword(email, {
  onSuccess: () => {
    // Show success message
    // Instruct user to check email
  }
});
```

#### 2. Email Delivery
**Development**: Console logging (check terminal)
**Production**: SendGrid or Gmail SMTP (see `EMAIL_SETUP_GUIDE.md`)

Email contains:
```
http://localhost:5173/reset-password/{raw-token}
```

#### 3. Reset Password Page
**File**: `frontend/src/pages/auth/ResetPasswordPage.tsx`

```typescript
// Extract token from URL
const { token } = useParams();
const cleanToken = token?.trim() || '';

// Submit new password
const { mutate: resetPassword, isLoading } = useResetPassword();

resetPassword(
  { token: cleanToken, password },
  {
    onSuccess: () => navigate('/login'),
    onError: (error) => {
      // Handle "Invalid or expired reset token"
    }
  }
);
```

**File**: `frontend/src/hooks/useAuth.ts` → `resetPasswordMutation`

```typescript
resetPassword: async ({ token, password }) => {
  const cleanToken = token.trim();
  console.log('🔐 Reset token length:', cleanToken.length); // Should be 64
  
  const response = await api.post(`/auth/reset-password/${cleanToken}`, {
    password
  });
  
  return response.data;
}
```

## Security Features

### Token Generation
- **Algorithm**: `crypto.randomBytes(32)` → 256 bits of entropy
- **Encoding**: Hexadecimal (64 characters)
- **Uniqueness**: Cryptographically secure random generation

### Token Storage
- **Never stored plain**: Only SHA-256 hash stored in database
- **One-time use**: Cleared after successful password reset
- **Expiry**: 1 hour time window

### Token Validation
- **Timing-safe comparison**: Database query with hashed token
- **Expiry check**: `passwordResetExpires > Date.now()`
- **Whitespace handling**: Trimmed on both frontend and backend

### Password Hashing
- **Algorithm**: bcrypt (via Mongoose pre-save hook)
- **Cost factor**: 10 rounds
- **Automatic**: Triggered on user.save() when password modified

## Testing Locally

### 1. Start All Services
```bash
# Backend (port 5001)
cd backend
npm run dev

# Frontend (port 5173)
cd frontend
npm run dev

# AI Service (port 8000) - optional for password reset
cd ai-service
python main.py
```

### 2. Trigger Forgot Password
1. Navigate to `http://localhost:5173/forgot-password`
2. Enter a seeded user email (e.g., `abebe.kebede@email.com`)
3. Submit the form

### 3. Get Token from Console
Check backend terminal for:
```
📧 DEV MODE: Password Reset Email
To: abebe.kebede@email.com
Reset URL: http://localhost:5173/reset-password/a1b2c3d4e5f6...
Token: a1b2c3d4e5f6... (64 chars)
```

### 4. Reset Password
1. Copy the full token (64 characters)
2. Navigate to `http://localhost:5173/reset-password/{token}`
3. Enter new password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
4. Submit → Should redirect to login with success message

### 5. Verify Reset
1. Login with email and new password
2. Should successfully authenticate
3. Old password should no longer work

## Troubleshooting

### "Invalid or expired reset token"

**Symptom**: Backend returns 400 error on reset submission

**Possible Causes**:
1. **Token expired** (>1 hour since generation)
   - Check backend logs: `⏰ Token expired...`
   - Solution: Request new forgot-password email

2. **Token malformed** (not 64 characters)
   - Check frontend console: `🔐 Reset token length: XX`
   - Should be exactly 64
   - Check URL for truncation or extra characters

3. **Token from different environment**
   - Token generated in dev, used in production (or vice versa)
   - Databases don't match
   - Solution: Generate token in same environment

4. **Database connection issue**
   - Backend can't query MongoDB
   - Check backend logs for connection errors
   - Verify `MONGODB_URI` in `.env`

### Token Not Received

**Development**:
- Email logging to console (check backend terminal)
- Look for `📧 DEV MODE: Password Reset Email`
- No actual SMTP required

**Production**:
- Verify `EMAIL_FROM`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` in `.env`
- Check SendGrid/Gmail credentials
- Check email service logs (SendGrid dashboard)
- See `EMAIL_SETUP_GUIDE.md` for setup

### Frontend Not Extracting Token

1. Check URL pattern: `/reset-password/:token` (React Router)
2. Verify `useParams()` extracts token
3. Check browser console: `🔐 Reset token length: XX`
4. Ensure token is trimmed before submission

### Backend Not Finding User

Check logs:
```
🔍 Looking for user with token hash: abc123... (first 10 chars)
⏰ Token expired. Expires: 2024-01-01T10:00:00.000Z, Now: 2024-01-01T11:00:00.000Z
❌ User not found with valid token
```

Verify:
- User exists in database
- `passwordResetToken` field has matching hash
- `passwordResetExpires` is in the future

## Environment Variables

### Backend `.env`
```bash
# MongoDB
MONGODB_URI=mongodb://...

# JWT (required for login after reset)
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (Development: console logging, Production: SMTP)
EMAIL_FROM=noreply@aijobplatform.com
SMTP_HOST=smtp.sendgrid.net     # Production only
SMTP_PORT=587                    # Production only
SMTP_USER=apikey                 # Production only
SMTP_PASS=SG.xxx                 # Production only

# Frontend URL (for reset links)
FRONTEND_URL=http://localhost:5173  # Dev
# FRONTEND_URL=https://yourdomain.com  # Production
```

### Frontend `.env`
```bash
# API endpoint
VITE_API_URL=http://localhost:5001/api/v1  # Dev
# VITE_API_URL=https://api.yourdomain.com/api/v1  # Production
```

## API Reference

### Forgot Password
```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response 200:
{
  "message": "Password reset link sent to email"
}

Response 404:
{
  "message": "No user found with that email"
}
```

### Reset Password
```http
POST /api/v1/auth/reset-password/:token
Content-Type: application/json

{
  "password": "NewPass123!"
}

Response 200:
{
  "message": "Password reset successful",
  "data": {
    "user": { ... }
  }
}

Response 400:
{
  "message": "Invalid or expired reset token"
}
```

## Recent Changes (Commit 8223cc4b)

### Extended Token Expiry
- **Before**: 10 minutes
- **After**: 1 hour
- **Rationale**: Users need more time to check email and reset

### Enhanced Logging
Backend now logs:
```typescript
console.log('🔐 Received reset token length:', cleanToken.length);
console.log('🔍 Looking for user with token hash:', hashedToken.substring(0, 10) + '...');
console.log('⏰ Token expired. Expires:', user.passwordResetExpires, 'Now:', new Date());
console.log('❌ User not found with valid token');
```

Frontend now logs:
```typescript
console.log('🔐 Reset token length:', cleanToken.length);
console.log('❌ Password reset error:', error.response?.data?.message);
```

### Token Trimming
- Frontend: `token.trim()` in `useAuth.ts` and `ResetPasswordPage.tsx`
- Backend: `token.trim()` in `auth.service.ts`
- Prevents whitespace issues from copy-paste

### UI Improvements
- Added `isSubmitting` state during password reset
- Disabled submit button while request in flight
- Better error messages (expired vs invalid)

## Database Schema

### User Model (`passwordResetToken` field)
```typescript
{
  passwordResetToken: {
    type: String,
    select: false  // Not included in query results by default
  },
  passwordResetExpires: {
    type: Date,
    select: false
  }
}
```

To manually inspect in MongoDB:
```javascript
db.users.findOne(
  { email: "user@example.com" },
  { passwordResetToken: 1, passwordResetExpires: 1 }
)
```

## Security Considerations

### Token Lifecycle
1. ✅ Generated: Cryptographically secure random
2. ✅ Transmitted: Via email (HTTPS in production)
3. ✅ Stored: Only SHA-256 hash in database
4. ✅ Used: One-time, expires after 1 hour
5. ✅ Cleared: Removed after successful reset

### Attack Vectors Mitigated
- **Token guessing**: 2^256 possible tokens (infeasible)
- **Token reuse**: Cleared after first successful use
- **Token theft**: Time-limited (1 hour expiry)
- **Database leak**: Only hash stored (rainbow tables ineffective)
- **Timing attacks**: Database query with indexed hash lookup

### Recommendations
1. **Production**: Always use HTTPS for frontend
2. **Production**: Use SMTP with TLS (SendGrid, Gmail)
3. **Monitoring**: Log failed reset attempts (rate limiting recommended)
4. **Expiry**: Consider reducing to 30 minutes for high-security apps
5. **Email verification**: Ensure email is verified before allowing password reset

## Test Accounts (Seeded)

### Job Seekers
- `abebe.kebede@email.com` / `JobSeeker@123`
- `tigist.haile@email.com` / `JobSeeker@123`

### Employers
- `hr@ethiotelecom.et` / `Employer@123`
- `hr@awashbank.com` / `Employer@123`

### Admin
- `admin@aijobplatform.com` / `Admin@123`

**Note**: All passwords are bcrypt-hashed in database. Test forgot-password with any of these emails.

## Related Files

### Backend
- `backend/src/services/auth.service.ts` - Core logic
- `backend/src/controllers/auth.controller.ts` - Route handlers
- `backend/src/routes/auth.routes.ts` - API routes
- `backend/src/models/User.model.ts` - Database schema
- `backend/src/utils/email.ts` - Email delivery

### Frontend
- `frontend/src/hooks/useAuth.ts` - API calls
- `frontend/src/pages/auth/ForgotPasswordPage.tsx` - Request form
- `frontend/src/pages/auth/ResetPasswordPage.tsx` - Reset form
- `frontend/src/lib/api.ts` - Axios configuration

## Support

For issues or questions:
1. Check backend logs for detailed error messages
2. Check frontend console for token length and errors
3. Verify MongoDB connection and user existence
4. Review this guide's troubleshooting section
5. Check `EMAIL_SETUP_GUIDE.md` for email delivery issues

---

**Last Updated**: Commit 8223cc4b  
**Status**: ✅ Working (token hashing aligned, expiry extended, trimming implemented)
