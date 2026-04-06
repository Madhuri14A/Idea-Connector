import React, { useEffect, useState } from 'react';
import { getMyProfile, updateMyPassword, updateMyProfile } from '../utils/api';
import { LockIcon, SettingsIcon, UserIcon } from '../components/Icons';
import './Settings.css';

function Settings({ onUserUpdate }) {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [authType, setAuthType] = useState('local');
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getMyProfile();
        setProfileForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || ''
        });
        setAuthType(data.authType || 'local');
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage('');
    setError('');

    try {
      const { data } = await updateMyProfile({
        name: profileForm.name,
        phone: profileForm.phone
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onUserUpdate?.(data.user);
      setProfileMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New password and confirm password must match');
      return;
    }

    setSavingPassword(true);
    try {
      const { data } = await updateMyPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      setPasswordMessage(data.message || 'Password updated successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className="settings-title-wrap">
          <div className="settings-icon-wrap">
            <SettingsIcon size={20} />
          </div>
          <div>
            <h1>Settings</h1>
            <p className="subtitle">Manage your profile and account preferences</p>
          </div>
        </div>
      </div>

      {error && <div className="settings-alert error">{error}</div>}
      {profileMessage && <div className="settings-alert success">{profileMessage}</div>}
      {passwordMessage && <div className="settings-alert success">{passwordMessage}</div>}

      <div className="settings-grid">
        <section className="settings-card">
          <h2><UserIcon size={16} /> Profile</h2>
          <form onSubmit={saveProfile} className="settings-form">
            <label>
              Full Name
              <input
                type="text"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
                required
                minLength={2}
                maxLength={50}
              />
            </label>

            <label>
              Email
              <input
                type="email"
                name="email"
                value={profileForm.email}
                readOnly
                className="readonly-field"
              />
            </label>

            <label>
              Phone Number (optional)
              <input
                type="tel"
                name="phone"
                value={profileForm.phone}
                onChange={handleProfileChange}
                placeholder="+919876543210"
              />
            </label>

            <button type="submit" className="btn btn-primary" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </section>

        <section className="settings-card">
          <h2><LockIcon size={16} /> Security</h2>
          {authType === 'google' ? (
            <p className="settings-hint">You signed in with Google. Password changes are managed by your Google account.</p>
          ) : (
            <form onSubmit={savePassword} className="settings-form">
              <label>
                Current Password
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </label>

              <label>
                New Password
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </label>

              <label>
                Confirm New Password
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </label>

              <p className="settings-hint">Password must be at least 8 characters, include 1 uppercase letter and 1 number.</p>

              <button type="submit" className="btn btn-secondary" disabled={savingPassword}>
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

export default Settings;
