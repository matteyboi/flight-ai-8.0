import React, { useState } from 'react';
import ResetPassword from './ResetPassword';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5051';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showReset) {
    return <ResetPassword onBack={() => setShowReset(false)} />;
  }
  return (
    <div className="login-container" style={{ maxWidth: 340, margin: '60px auto', padding: 24, border: '1px solid #ccc', borderRadius: 8, background: '#fafbfc' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 18 }}>Sign In</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ width: '100%', padding: 10, fontSize: 16, borderRadius: 6, border: '1px solid #bbb' }}
            autoFocus
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: 10, fontSize: 16, borderRadius: 6, border: '1px solid #bbb' }}
            required
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, fontSize: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <button onClick={() => setShowReset(true)} style={{ marginTop: 16, background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer' }}>Forgot password?</button>
    </div>
  );
}
