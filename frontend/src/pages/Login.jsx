import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

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

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Idea Connector</h1>
        <p className="subtitle">Connect your ideas. Discover relationships.</p>
        
        <div className="login-form">
          <h2>Sign in with Google</h2>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => setError('Login failed')}
            text="signin_with"
          />
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}

export default Login;
