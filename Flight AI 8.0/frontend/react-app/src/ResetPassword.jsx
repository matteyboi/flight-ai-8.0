import React, { useState } from 'react';
// Use API_BASE from environment or fallback
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5051';

export default function ResetPassword({ onBack }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      setMessage('If your email is registered, you will receive a reset link.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px rgba(25,118,210,0.08)' }}>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 10, marginBottom: 12, fontSize: 16 }}
        />
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, fontSize: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      {message && <div style={{ color: 'green', marginTop: 10 }}>{message}</div>}
      <button onClick={onBack} style={{ marginTop: 16, background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer' }}>Back to Login</button>
    </div>
  );
}
