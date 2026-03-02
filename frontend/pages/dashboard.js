import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const S = {
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 40px', background: '#0d1117', borderBottom: '1px solid #21262d'
  },
  logo: { color: '#58a6ff', fontWeight: 'bold', fontSize: '1.15rem', fontFamily: 'monospace' },
  navRight: { display: 'flex', gap: '20px', alignItems: 'center', fontSize: '0.9rem' },
  main: { maxWidth: '900px', margin: '48px auto', padding: '0 24px' },
  greeting: { fontSize: '1.5rem', fontWeight: 700, color: '#e6edf3', marginBottom: '6px' },
  sub: { color: '#8b949e', marginBottom: '36px', fontSize: '0.9rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '20px', marginBottom: '32px' },
  statCard: {
    background: '#161b22', border: '1px solid #21262d', borderRadius: '10px', padding: '24px'
  },
  statLabel: { color: '#6e7681', fontSize: '0.78rem', fontFamily: 'monospace', marginBottom: '6px' },
  statValue: { color: '#e6edf3', fontSize: '1.4rem', fontWeight: 700 },
  adminCard: {
    background: '#1a1f2e', border: '1px solid #388bfd55', borderRadius: '12px',
    padding: '28px', marginBottom: '24px'
  },
  adminTitle: { color: '#58a6ff', fontWeight: 700, marginBottom: '8px' },
  adminDesc: { color: '#8b949e', fontSize: '0.875rem', marginBottom: '20px' },
  adminBtn: {
    display: 'inline-block', padding: '10px 24px', background: '#1f6feb',
    borderRadius: '8px', color: '#fff', fontWeight: 600, textDecoration: 'none',
    fontSize: '0.9rem'
  },
  logoutBtn: {
    padding: '7px 18px', background: 'transparent', border: '1px solid #6e2b2b',
    borderRadius: '6px', color: '#f85149', cursor: 'pointer', fontSize: '0.85rem'
  },
  spinner: { color: '#8b949e', padding: '80px', textAlign: 'center' }
};

export default function Dashboard() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/auth/session', { credentials: 'include' })
      .then(r => r.json())
      .then(({ user }) => {
        setUser(user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function logout() {
    await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/login';
  }

  if (loading) return <div style={S.spinner}>Loading…</div>;

  // Guest or no session → still show dashboard (guest view)
  const displayUser = user || { username: 'guest', role: 'guest', is_admin: false, clearance: 0 };

  return (
    <>
      <Head>
        <title>CipherOps | Dashboard</title>
      </Head>

      <nav style={S.nav}>
        <Link href="/" style={{ ...S.logo, textDecoration: 'none' }}>⚡ CipherOps</Link>
        <div style={S.navRight}>
          <span style={{ color: '#8b949e', fontFamily: 'monospace' }}>{displayUser.username}</span>
          <button style={S.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </nav>

      <main style={S.main}>
        <h1 style={S.greeting}>
          Welcome, {displayUser.username}
          {displayUser.is_admin && (
            <span style={{ marginLeft: '12px', fontSize: '0.8rem', color: '#f0883e',
                           background: '#2d1a00', padding: '3px 10px', borderRadius: '20px',
                           border: '1px solid #9e6300', fontWeight: 600 }}>
              ⚠ ADMIN
            </span>
          )}
        </h1>
        <p style={S.sub}>
          Role: <code style={{ color: '#79c0ff' }}>{displayUser.role}</code> &nbsp;·&nbsp;
          Clearance: <code style={{ color: '#79c0ff' }}>{displayUser.clearance || 'none'}</code>
        </p>

        {/* Stats overview */}
        <div style={S.grid}>
          {[
            { label: 'VAULT FILES',      value: '12' },
            { label: 'PENDING REPORTS',  value: '3'  },
            { label: 'ACTIVE SESSIONS',  value: '1'  },
            { label: 'LAST LOGIN',       value: 'Now' }
          ].map(s => (
            <div key={s.label} style={S.statCard}>
              <div style={S.statLabel}>{s.label}</div>
              <div style={S.statValue}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Admin panel – only visible when is_admin is true (mass assignment escalation) */}
        {displayUser.is_admin && (
          <div style={S.adminCard}>
            <div style={S.adminTitle}>🔓 Admin Panel Unlocked</div>
            <p style={S.adminDesc}>
              You have administrator access. Use the Report Generator to create
              comprehensive consultant assessment reports with custom configuration options.
            </p>
            <Link href="/report-generator" style={S.adminBtn}>
              Open Report Generator →
            </Link>
          </div>
        )}

        {/* Normal consultant actions */}
        <div style={S.grid}>
          {[
            { icon: '📁', label: 'File Vault',      desc: 'Browse encrypted consultant files.',       href: '#' },
            { icon: '📋', label: 'Assignments',     desc: 'View active penetration testing scopes.',  href: '#' },
            { icon: '🔑', label: 'SSH Keys',        desc: 'Manage your authorised SSH public keys.',  href: '#' },
            { icon: '📞', label: 'Support',         desc: 'Get help from the operations team.',       href: '/contact' }
          ].map(item => (
            <a key={item.label} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{ ...S.statCard, cursor: 'pointer' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{item.icon}</div>
                <div style={{ color: '#e6edf3', fontWeight: 600, marginBottom: '4px' }}>{item.label}</div>
                <div style={{ color: '#6e7681', fontSize: '0.82rem' }}>{item.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </main>
    </>
  );
}
