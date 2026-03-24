import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { googleLogin, loginUser, registerUser, requestPasswordReset } from '../utils/api';
import './Login.css';

function Login({ onLogin, redirectTo = '/' }) {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (credentialResponse) => {
    try {
      const { data } = await googleLogin(credentialResponse.credential);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin?.(data.user);
      navigate(redirectTo);
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
      const apiCall = isSignUp
        ? registerUser({ email: formData.email, name: formData.name, password: formData.password })
        : loginUser({ email: formData.email, password: formData.password });

      const { data } = await apiCall;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin?.(data.user);
      navigate(redirectTo);
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Try again.');
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
      const { data } = await requestPasswordReset(forgotPasswordEmail);
      setSuccess(data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset request');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setForgotPasswordEmail('');
    setError('');
    setSuccess('');
  };

  if (showForgotPassword) {
    return (
      <div className="login-container">
        <div className="login-card">
          <button className="back-btn" onClick={handleBackToLogin}>← Back</button>
          <h1>Reset Password</h1>
          <p className="subtitle">Enter your email to receive a reset link</p>

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
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <div className="login-container">
      <div className="login-card">
        <h1>Idea Connector</h1>
        <p className="subtitle">Connect your ideas. Discover relationships.</p>
        
        <div className="login-form">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => setError('Google login failed')}
            text="signin_with"
            width="100%"
          />

          <div className="divider">OR</div>

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
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </div>
    </div>
    </GoogleOAuthProvider>
  );
}

export default Login;
