# SendGrid Setup Guide

## Overview
This application uses SendGrid to send transactional emails:
- **Password Reset** - when user requests password reset
- **Account Approval** - when admin approves a user account

## Common Issues & Solutions

### Error: 403 Forbidden - "Forbidden"
**Cause:** The sender email (`SENDGRID_FROM_EMAIL`) is not verified in SendGrid.

**Solution:**
1. Go to [SendGrid Dashboard](https://app.sendgrid.com/settings/sender_auth)
2. Verify a sender email address (usually your account email)
3. Add the verified email to `.env`:
   ```
   SENDGRID_FROM_EMAIL=your-verified-email@example.com
   ```
4. Restart your server

### Emails Not Being Received

**Troubleshooting steps:**

1. **Check server logs** when testing:
   ```
   [Auth] Sending password reset email...
     From: m.sohailaqeel@gmail.com
     To: test@example.com
   [Auth] ✓ Password reset email sent successfully
   ```
   OR
   ```
   [Users] Sending account approval email...
     From: m.sohailaqeel@gmail.com
     To: user@example.com
   [Users] ✓ Account approval email sent successfully
   ```

2. **If you see an error** like:
   ```
   [Auth] Failed to send reset email:
     Code: 403
     Message: "...is not a verified sender"
   ```
   → The sender email needs to be verified in SendGrid (see "Error: 403 Forbidden" above)

3. **Check spam/junk folder** - sometimes SendGrid emails end up in spam

4. **Verify API key has correct permissions:**
   - Go to [SendGrid API Keys](https://app.sendgrid.com/settings/api_keys)
   - Ensure the key has **Mail Send** permission enabled

## Getting Your API Key
1. Go to [SendGrid Dashboard](https://app.sendgrid.com/settings/api_keys)
2. Click "Create API Key"
3. Give it a descriptive name (e.g., "JobBridge Backend")
4. Select **Full Access** permissions
5. Copy the key and add to `.env`:
   ```
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxx
   ```

## Environment Variables Required

```env
# SendGrid Configuration
SENDGRID_API_KEY=SG.your-api-key-here
SENDGRID_FROM_EMAIL=your-verified-email@gmail.com

# Client URL for reset links in emails
CLIENT_URL=http://localhost:3000
```

## Email Templates

### Password Reset Email
- **Trigger:** User requests password reset via forgot password endpoint
- **Sender:** `SENDGRID_FROM_EMAIL`
- **Subject:** "Reset your JobBridge password"
- **Content:** Reset link (valid for 1 hour)

### Account Approval Email
- **Trigger:** Admin approves a user account via update status endpoint
- **Sender:** `SENDGRID_FROM_EMAIL`
- **Subject:** "Account Approved"
- **Content:** Login link with approval message

## Testing

**Test Password Reset:**
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**Test Approval Email (Admin endpoint):**
```bash
curl -X PATCH http://localhost:3000/api/users/{userId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {adminToken}" \
  -d '{"status": "APPROVED"}'
```

**Check logs for detailed messages:**
```
[Auth] Sending password reset email...
  From: m.sohailaqeel@gmail.com
  To: test@example.com
[Auth] ✓ Password reset email sent successfully
```

**If error occurs:**
```
[Auth] Failed to send reset email:
  Code: 403
  From Email: noreply@jobbridge.com
  Message: "The email address from... is not a verified sender"
```
