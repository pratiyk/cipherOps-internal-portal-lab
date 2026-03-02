import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const S = {
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 40px', background: '#0d1117', borderBottom: '1px solid #21262d'
  },
  logo: { color: '#58a6ff', fontWeight: 'bold', fontSize: '1.15rem', fontFamily: 'monospace' },
  wrap: { maxWidth: '640px', margin: '60px auto', padding: '0 24px' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#e6edf3', marginBottom: '8px' },
  sub: { color: '#8b949e', marginBottom: '36px', fontSize: '0.9rem' },
  card: {
    background: '#161b22', border: '1px solid #21262d', borderRadius: '12px', padding: '36px'
  },
  label: { display: 'block', color: '#8b949e', fontSize: '0.78rem', fontFamily: 'monospace', marginBottom: '6px' },
  input: {
    width: '100%', padding: '10px 14px', background: '#0d1117',
    border: '1px solid #30363d', borderRadius: '8px', color: '#c9d1d9',
    fontFamily: 'monospace', fontSize: '0.9rem', marginBottom: '20px', outline: 'none',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%', minHeight: '120px', padding: '10px 14px', background: '#0d1117',
    border: '1px solid #30363d', borderRadius: '8px', color: '#c9d1d9',
    fontFamily: 'monospace', fontSize: '0.9rem', marginBottom: '20px', outline: 'none',
    boxSizing: 'border-box', resize: 'vertical'
  },
  btn: {
    width: '100%', padding: '11px', background: '#238636', border: 'none',
    borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem'
  },
  successBox: {
    padding: '16px', background: '#0d2d16', border: '1px solid #2ea043',
    borderRadius: '8px', color: '#3fb950', fontSize: '0.875rem'
  },
  footer: {
    textAlign: 'center', padding: '32px', color: '#484f58',
    borderTop: '1px solid #21262d', fontFamily: 'monospace', fontSize: '0.8rem', marginTop: '64px'
  }
};

export default function Contact() {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent]       = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    // Form is a decoy – no backend action
    setSent(true);
  }

  return (
    <>
      <Head>
        {/* flag: VulnOs{rabbit_hole_nice_try_keep_digging} */}
        <title>CipherOps | Contact</title>
      </Head>

      <nav style={S.nav}>
        <Link href="/" style={{ ...S.logo, textDecoration: 'none' }}>⚡ CipherOps</Link>
        <Link href="/login" style={{ color: '#8b949e', fontSize: '0.9rem' }}>Login</Link>
      </nav>

      <div style={S.wrap}>
        <h1 style={S.title}>Contact Us</h1>
        <p style={S.sub}>
          Reach out to the CipherOps operations team for onboarding or technical support.
        </p>

        <div style={S.card}>
          {sent ? (
            <div style={S.successBox}>
              <strong>Message received.</strong> A team member will respond within 1 business day.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label style={S.label}>FULL NAME</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                style={S.input}
                placeholder="Jane Smith"
                required
              />

              <label style={S.label}>EMAIL ADDRESS</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={S.input}
                placeholder="jane@example.com"
                required
              />

              <label style={S.label}>MESSAGE</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                style={S.textarea}
                placeholder="Describe your enquiry…"
                required
              />

              <button type="submit" style={S.btn}>Send Message</button>
            </form>
          )}
        </div>
      </div>

      <footer style={S.footer}>
        <p>© 2026 CipherOps Cybersecurity LLC — All Rights Reserved</p>
      </footer>
    </>
  );
}
