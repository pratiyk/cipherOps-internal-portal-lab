import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const S = {
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 40px', background: '#0d1117', borderBottom: '1px solid #21262d',
    position: 'sticky', top: 0, zIndex: 100
  },
  logo: { color: '#58a6ff', fontWeight: 'bold', fontSize: '1.15rem', fontFamily: 'monospace' },
  navLinks: { display: 'flex', gap: '24px', alignItems: 'center' },
  navLink: { color: '#8b949e', fontSize: '0.9rem' },
  navBtn: {
    padding: '6px 18px', background: '#21262d', border: '1px solid #30363d',
    borderRadius: '6px', color: '#c9d1d9', fontSize: '0.85rem', cursor: 'pointer'
  },
  hero: {
    padding: '90px 40px 70px', textAlign: 'center', background: '#0d1117',
    borderBottom: '1px solid #21262d'
  },
  heroBadge: {
    display: 'inline-block', padding: '4px 14px', background: '#161b22',
    border: '1px solid #30363d', borderRadius: '20px', color: '#58a6ff',
    fontSize: '0.78rem', fontFamily: 'monospace', marginBottom: '24px'
  },
  heroTitle: { fontSize: '2.6rem', fontWeight: 700, color: '#e6edf3', marginBottom: '16px', lineHeight: 1.2 },
  heroSub: { color: '#8b949e', fontSize: '1.05rem', maxWidth: '560px', margin: '0 auto 32px' },
  heroActions: { display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' },
  btnPrimary: {
    padding: '10px 28px', background: '#238636', border: 'none',
    borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem'
  },
  btnSecondary: {
    padding: '10px 28px', background: 'transparent', border: '1px solid #30363d',
    borderRadius: '8px', color: '#c9d1d9', cursor: 'pointer', fontSize: '0.95rem'
  },
  main: { maxWidth: '960px', margin: '0 auto', padding: '48px 24px' },
  sectionTitle: { fontSize: '1.35rem', fontWeight: 600, color: '#e6edf3', marginBottom: '8px' },
  sectionDesc: { color: '#8b949e', marginBottom: '24px', fontSize: '0.95rem' },
  card: {
    background: '#161b22', border: '1px solid #21262d', borderRadius: '12px',
    padding: '32px', marginBottom: '32px'
  },
  form: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' },
  input: {
    flex: 1, minWidth: '260px', padding: '10px 16px',
    background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px',
    color: '#c9d1d9', fontFamily: 'monospace', fontSize: '0.875rem',
    outline: 'none'
  },
  errBox: {
    padding: '12px 16px', background: '#2d1a1a', border: '1px solid #6e2b2b',
    borderRadius: '8px', color: '#f85149', fontSize: '0.875rem'
  },
  resBox: {
    marginTop: '16px', padding: '16px', background: '#0d1117',
    border: '1px solid #30363d', borderRadius: '8px'
  },
  resMeta: { fontSize: '0.85rem', color: '#8b949e', marginBottom: '8px' },
  pre: {
    background: '#010409', color: '#7ee787', overflow: 'auto', padding: '14px',
    borderRadius: '6px', maxHeight: '320px', fontSize: '0.78rem',
    fontFamily: 'monospace', border: '1px solid #21262d'
  },
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '20px' },
  featureCard: {
    background: '#161b22', border: '1px solid #21262d', borderRadius: '12px',
    padding: '24px'
  },
  featureIcon: { fontSize: '1.5rem', marginBottom: '10px' },
  featureTitle: { color: '#e6edf3', fontWeight: 600, marginBottom: '6px', fontSize: '0.95rem' },
  featureText: { color: '#6e7681', fontSize: '0.875rem', lineHeight: 1.5 },
  footer: {
    textAlign: 'center', padding: '32px', color: '#484f58',
    borderTop: '1px solid #21262d', fontFamily: 'monospace', fontSize: '0.8rem', marginTop: '48px'
  }
};

export default function Home() {
  const [url, setUrl]         = useState('');
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function handlePreview(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/v1/preview', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ url })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'An unexpected error occurred.');
      } else {
        setResult(data);
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
        <title>CipherOps | Secure Consultant Portal</title>
        <meta name="description" content="CipherOps Internal Portal – Secure File Vault for Certified Consultants" />
        {/* TODO: remove before go-live – debug service still running on internal port 6666 */}
        {/* internal api path: /api/v1/internal/debug */}
      </Head>

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav style={S.nav}>
        <span style={S.logo}>⚡ CipherOps</span>
        <div style={S.navLinks}>
          <Link href="/contact" style={S.navLink}>Contact</Link>
          <Link href="/dashboard" style={S.navLink}>Dashboard</Link>
          <Link href="/login" style={{ ...S.navBtn, textDecoration: 'none' }}>
            Consultant Login
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <header style={S.hero}>
        <div style={S.heroBadge}>🔒 Internal Portal v2.4.1</div>
        <h1 style={S.heroTitle}>CipherOps<br />Secure File Vault</h1>
        <p style={S.heroSub}>
          Encrypted document storage and access management for certified
          penetration testing consultants.
        </p>
        <div style={S.heroActions}>
          <Link href="/login">
            <button style={S.btnPrimary}>Access Vault →</button>
          </Link>
          <Link href="/contact">
            <button style={S.btnSecondary}>Contact Team</button>
          </Link>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <main style={S.main}>

        {/* LinkedIn Profile Preview – SSRF sink */}
        <section style={S.card}>
          <h2 style={S.sectionTitle}>Consultant Profile Preview</h2>
          <p style={S.sectionDesc}>
            Paste your LinkedIn profile URL to preview your public consultant profile.
            Used during onboarding verification.
          </p>

          <form onSubmit={handlePreview} style={S.form}>
            <input
              type="text"
              placeholder="https://linkedin.com/in/your-profile"
              value={url}
              onChange={e => setUrl(e.target.value)}
              style={S.input}
              required
            />
            <button type="submit" style={S.btnPrimary} disabled={loading}>
              {loading ? 'Fetching…' : 'Preview'}
            </button>
          </form>

          {error && <div style={S.errBox}><strong>Error:</strong> {error}</div>}

          {result && (
            <div style={S.resBox}>
              <p style={S.resMeta}>
                <strong>HTTP {result.status}</strong> &nbsp;·&nbsp; {result.contentType}
              </p>
              <pre style={S.pre}>
                {typeof result.body === 'string'
                  ? result.body
                  : JSON.stringify(result.body, null, 2)}
              </pre>
            </div>
          )}
        </section>

        {/* Feature cards */}
        <section>
          <h2 style={{ ...S.sectionTitle, marginBottom: '20px' }}>Platform Capabilities</h2>
          <div style={S.featureGrid}>
            {[
              { icon: '🔐', title: 'Zero-Trust Architecture',
                text: 'All consultant access is verified through multi-layer authentication and session tokens.' },
              { icon: '📁', title: 'AES-256 File Vault',
                text: 'Every file is encrypted at rest. Access events are logged and audited in real time.' },
              { icon: '🛡️', title: 'Threat Monitoring',
                text: 'Continuous monitoring with automated incident response and anomaly detection.' },
              { icon: '🔑', title: 'Role-Based Access',
                text: 'Fine-grained clearance levels from Standard to Top-Secret with admin override controls.' }
            ].map(f => (
              <div key={f.title} style={S.featureCard}>
                <div style={S.featureIcon}>{f.icon}</div>
                <div style={S.featureTitle}>{f.title}</div>
                <p style={S.featureText}>{f.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer style={S.footer}>
        <p>© 2026 CipherOps Cybersecurity LLC — Internal Use Only — Unauthorised Access Prohibited</p>
      </footer>
    </>
  );
}
