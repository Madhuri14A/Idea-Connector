const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendResetEmail = async (email, resetToken) => {
  try {
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'IdeaConnector <onboarding@resend.dev>',
      to: email,
      subject: 'Password Reset Request — Idea Connector',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #fffdf8; border-radius: 16px;">
          <div style="margin-bottom: 24px;">
            <span style="display: inline-block; background: #f6ebc0; color: #665761; padding: 8px 14px; border-radius: 10px; font-weight: 700; font-size: 15px;">💡 IdeaConnector</span>
          </div>
          <h2 style="color: #2c2f31; font-size: 22px; margin: 0 0 12px;">Reset your password</h2>
          <p style="color: #595c5e; line-height: 1.6; margin: 0 0 24px;">We received a request to reset your IdeaConnector password. Click the button below to set a new one.</p>
          <a href="${resetLink}" style="display: inline-block; padding: 13px 28px; background: #665761; color: #fef3c7; text-decoration: none; border-radius: 999px; font-weight: 700; font-size: 15px; margin-bottom: 24px;">
            Reset Password →
          </a>
          <p style="color: #888; font-size: 13px; margin: 0 0 6px;">Or paste this link into your browser:</p>
          <p style="color: #888; font-size: 12px; word-break: break-all; margin: 0 0 24px;"><code>${resetLink}</code></p>
          <p style="color: #aaa; font-size: 12px; border-top: 1px solid #eee; padding-top: 16px; margin: 0;">This link expires in 30 minutes. If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend email error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

module.exports = { sendResetEmail };
