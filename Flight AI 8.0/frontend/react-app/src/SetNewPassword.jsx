import React, { useState } from 'react';

export default function SetNewPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get token from URL
  const params = new URLSearchParams(window.location.search);
  const token = decodeURIComponent(params.get('token') || '');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5051/set-new-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      setMessage('Password has been reset. You may now log in.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return <div style={{ maxWidth: 400, margin: '40px auto', color: 'red' }}>Invalid or missing reset token.</div>;
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px rgba(25,118,210,0.08)' }}>
      <h2>Set New Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: 10, marginBottom: 12, fontSize: 16 }}
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          style={{ width: '100%', padding: 10, marginBottom: 12, fontSize: 16 }}
        />
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, fontSize: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          {loading ? 'Resetting...' : 'Set Password'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      {message && <div style={{ color: 'green', marginTop: 10 }}>{message}</div>}
    </div>
  );
}
