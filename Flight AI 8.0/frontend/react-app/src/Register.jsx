import React, { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5051';

export default function Register({ onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role, full_name: fullName, email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setSuccess('Registration successful! You can now log in.');
      if (onRegister) onRegister();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container" style={{ maxWidth: 360, margin: '60px auto', padding: 24, border: '1px solid #ccc', borderRadius: 8, background: '#fafbfc' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 18 }}>Create Profile</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            style={{ width: '100%', padding: 10, fontSize: 16, borderRadius: 6, border: '1px solid #bbb' }}
            required
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: 10, fontSize: 16, borderRadius: 6, border: '1px solid #bbb' }}
            required
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ width: '100%', padding: 10, fontSize: 16, borderRadius: 6, border: '1px solid #bbb' }}
            required
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: 10, fontSize: 16, borderRadius: 6, border: '1px solid #bbb' }}
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', padding: 10, fontSize: 16, borderRadius: 6, border: '1px solid #bbb' }}>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="management">Management</option>
          </select>
        </div>
        {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: 10 }}>{success}</div>}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, fontSize: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? 'Creating...' : 'Create Profile'}
        </button>
      </form>
    </div>
  );
}
