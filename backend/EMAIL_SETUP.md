# Email Setup Guide for Password Reset

This app uses **Resend** for sending transactional emails.
Free tier: **3,000 emails/month, 100/day** — no credit card needed.

## Setup Steps

1. **Create a free Resend account**
   - Go to https://resend.com and sign up

2. **Get your API key**
   - Dashboard → API Keys → Create API Key
   - Copy the key (it starts with `re_`)

3. **Add a From address** *(for testing — skip domain setup)*
   - For local dev, you can use `onboarding@resend.dev` as the from address
   - For production, verify your own domain at Dashboard → Domains

4. **Update your `.env` file**:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
   RESEND_FROM_EMAIL=IdeaConnector <you@yourdomain.com>
   FRONTEND_URL=http://localhost:3001
   ```

   > During development, leave `RESEND_FROM_EMAIL` empty or use `onboarding@resend.dev`.
   > Resend will deliver to your own email even without a verified domain in test mode.

## Testing Password Reset

1. Click "Forgot password?" on the login page
2. Enter a registered email address
3. A reset link will be sent to that email
4. Click the link in the email
5. Reset your password

**Note:** Make sure `FRONTEND_URL` in `.env` matches where your frontend is running (usually `http://localhost:3001` for development).
