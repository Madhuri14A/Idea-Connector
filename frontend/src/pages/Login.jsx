import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import './Login.css';

function Login() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState('email');
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch('http://localhost:5000/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      window.location.href = '/';
    } catch (err) {
      setError('Login failed. Try again.');
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleManualAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isSignUp ? '/auth/register' : '/auth/login';
      const payload = isSignUp 
        ? { email: formData.email, name: formData.name, password: formData.password }
        : { email: formData.email, password: formData.password };

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      window.location.href = '/';
    } catch (err) {
      setError(err.message || 'Authentication failed. Try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail })
      });

      const data = await response.json();

      if (!response.ok || !data.resetToken) {
        throw new Error(data.error || 'Email not found');
      }

      setResetToken(data.resetToken);
      setResetStep('reset');
      setSuccess('Token generated! Enter your new password below.');
    } catch (err) {
      setError(err.message || 'Failed to send reset request');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: forgotPasswordEmail, 
          resetToken, 
          newPassword 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        handleBackToLogin();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setResetStep('email');
    setForgotPasswordEmail('');
    setNewPassword('');
    setResetToken('');
    setError('');
    setSuccess('');
  };

  if (showForgotPassword) {
    return (
      <div className="login-container">
        <div className="login-card">
          <button className="back-btn" onClick={handleBackToLogin}>← Back</button>
          <h1>Reset Password</h1>
          <p className="subtitle">Secure your account</p>

          {resetStep === 'email' ? (
            <form onSubmit={handleForgotPasswordSubmit} className="login-form">
              <input
                type="email"
                placeholder="Email address"
                value={forgotPasswordEmail}
                onChange={(e) => { setForgotPasswordEmail(e.target.value); setError(''); }}
                required
                className="form-input"
              />
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Sending...' : 'Get Reset Token'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPasswordSubmit} className="login-form">
              <p className="info-text">
                Reset Token: <code>{resetToken.substring(0, 12)}...</code>
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
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Idea Connector</h1>
        <p className="subtitle">Connect your ideas. Discover relationships.</p>
        
        <div className="login-form">
          <div className="form-toggle">
            <button 
              className={`toggle-btn ${!isSignUp ? 'active' : ''}`}
              onClick={() => { setIsSignUp(false); setFormData({ email: '', password: '', name: '' }); setError(''); setSuccess(''); }}
            >
              Sign In
            </button>
            <button 
              className={`toggle-btn ${isSignUp ? 'active' : ''}`}
              onClick={() => { setIsSignUp(true); setFormData({ email: '', password: '', name: '' }); setError(''); setSuccess(''); }}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleManualAuth}>
            {isSignUp && (
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="form-input"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="form-input"
            />
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          {!isSignUp && (
            <button type="button" className="forgot-password-btn" onClick={() => setShowForgotPassword(true)}>
              Forgot password?
            </button>
          )}

          <div className="divider">OR</div>

          <h2>Sign in with Google</h2>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => setError('Google login failed')}
            text="signin_with"
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </div>
    </div>
  );
}

export default Login;
