import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const S = {
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 40px', background: '#0d1117', borderBottom: '1px solid #21262d'
  },
  logo: { color: '#58a6ff', fontWeight: 'bold', fontSize: '1.15rem', fontFamily: 'monospace' },
  wrap: { maxWidth: '600px', margin: '80px auto', padding: '0 24px' },
  card: {
    background: '#161b22', border: '1px solid #21262d', borderRadius: '12px', padding: '40px'
  },
  title: { fontSize: '1.6rem', fontWeight: 700, color: '#e6edf3', marginBottom: '8px' },
  sub: { color: '#8b949e', marginBottom: '32px', fontSize: '0.9rem' },
  label: { display: 'block', color: '#8b949e', fontSize: '0.8rem', marginBottom: '6px', fontFamily: 'monospace' },
  input: {
    width: '100%', padding: '10px 14px', background: '#0d1117',
    border: '1px solid #30363d', borderRadius: '8px', color: '#c9d1d9',
    fontFamily: 'monospace', fontSize: '0.9rem', marginBottom: '20px', outline: 'none',
    boxSizing: 'border-box'
  },
  btn: {
    width: '100%', padding: '11px', background: '#238636', border: 'none',
    borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem'
  },
  errBox: {
    marginBottom: '20px', padding: '12px 16px', background: '#2d1a1a',
    border: '1px solid #6e2b2b', borderRadius: '8px', color: '#f85149', fontSize: '0.875rem'
  },
  divider: { textAlign: 'center', color: '#484f58', margin: '24px 0', fontSize: '0.8rem' },
  foot: { textAlign: 'center', color: '#6e7681', fontSize: '0.8rem', marginTop: '24px' }
};

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res  = await fetch('/api/v1/auth/login', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (res.ok) {
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Login failed.');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        {/* flag: VulnOs{just_a_rabbit_hole_keep_looking} */}
        <title>CipherOps | Consultant Login</title>
      </Head>

      <nav style={S.nav}>
        <Link href="/" style={{ ...S.logo, textDecoration: 'none' }}>⚡ CipherOps</Link>
        <Link href="/contact" style={{ color: '#8b949e', fontSize: '0.9rem' }}>Contact</Link>
      </nav>

      <div style={S.wrap}>
        <div style={S.card}>
          <h1 style={S.title}>Consultant Login</h1>
          <p style={S.sub}>Sign in to access the secure file vault.</p>

          {error && <div style={S.errBox}>{error}</div>}

          <form onSubmit={handleLogin}>
            <label style={S.label}>USERNAME</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={S.input}
              placeholder="e.g. j.mercer"
              autoComplete="username"
              required
            />

            <label style={S.label}>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={S.input}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />

            <button type="submit" style={S.btn} disabled={loading}>
              {loading ? 'Authenticating…' : 'Sign In'}
            </button>
          </form>

          <div style={S.divider}>— or —</div>

          <p style={{ ...S.foot, marginTop: 0 }}>
            Return to <Link href="/">Home</Link>
          </p>
        </div>

        <p style={S.foot}>
          Having trouble? Contact{' '}
          <Link href="/contact">your team administrator</Link>.
        </p>
      </div>
    </>
  );
}
