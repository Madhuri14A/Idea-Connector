# Email Setup Guide for Password Reset

To enable email sending for password reset functionality, follow these steps:

## Option 1: Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account:
   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Create an App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or your device)
   - Google will generate a 16-character password

3. **Update `.env` file**:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=generated-16-char-password
   FRONTEND_URL=http://localhost:3001
   ```

4. **Install nodemailer** (if not already installed):
   ```bash
   npm install nodemailer
   ```

## Option 2: Other Email Services

You can modify `backend/utils/emailService.js` to use:
- SendGrid
- Mailgun
- AWS SES
- Or any other service supported by nodemailer

## Testing Password Reset

1. Click "Forgot password?" on the login page
2. Enter a registered email address
3. A reset link will be sent to that email
4. Click the link in the email
5. Reset your password

**Note:** Make sure `FRONTEND_URL` in `.env` matches where your frontend is running (usually http://localhost:3001 for development).
