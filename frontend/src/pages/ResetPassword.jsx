import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../utils/api';
import './Login.css';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const resetToken = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!resetToken || !email) {
      setError('Invalid reset link. Please try again.');
    }
  }, [resetToken, email]);

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError('Password must be at least 8 characters, contain an uppercase letter and a number');
      setLoading(false);
      return;
    }

    try {
      await resetPassword({ email, resetToken, newPassword });

      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Idea Connector</h1>
        <p className="subtitle">Reset Your Password</p>

        {error && resetToken ? (
          <div className="error-message">{error}</div>
        ) : !resetToken || !email ? (
          <div className="error-message">Invalid reset link. Please request a new password reset.</div>
        ) : (
          <form onSubmit={handleResetPasswordSubmit} className="login-form">
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Email: <strong>{email}</strong>
            </p>
            <input
              type="password"
              placeholder="New Password (8+ chars, 1 uppercase, 1 number)"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
              required
              className="form-input"
            />
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button 
          type="button" 
          className="forgot-password-btn" 
          onClick={() => navigate('/login')}
          style={{ marginTop: '1rem' }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;
