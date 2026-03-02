'use strict';

const express = require('express');
const router  = express.Router();

// Fake log lines – shown in GET /debug to add realistic noise
const FAKE_LOGS = [
  '[2026-02-28 09:00:01] INFO  redis.connect     host=redis port=6379 auth=NONE',
  '[2026-02-28 09:00:02] INFO  postgres.connect  host=postgres db=cipherops',
  '[2026-02-28 09:00:02] INFO  debug.server      bind=127.0.0.1:6666',
  '[2026-02-28 09:15:33] WARN  session.init      ip=10.0.0.1 ua=Mozilla role=guest',
  '[2026-02-28 10:22:14] INFO  report.generate   user=guest status=DENIED (not admin)',
  '[2026-02-28 11:45:00] DEBUG cleanup.cron      shell=sh status=ok',
  '[2026-02-28 12:00:00] INFO  preview.fetch     url=https://linkedin.com status=200',
  '[2026-02-28 14:30:22] INFO  auth.login        user=j.mercer status=SUCCESS',
  '[2026-03-01 08:00:00] INFO  server.start      port=8080 pid=1',
  '[2026-03-01 09:11:45] WARN  internal.debug    UNAUTHENTICATED_ACCESS ip=10.0.0.2',
  '[2026-03-01 10:05:03] INFO  session.update    user=guest is_admin=false→true  [MASS ASSIGN?]',
];

/**
 * GET /api/v1/internal/debug
 *
 * Returns system logs and the current session object.
 * Intended for internal diagnostics only, but Nginx does not enforce any
 * access restriction on this path – it is reachable externally.
 *
 * Players discover this route via the SSRF → internal debug server chain.
 */
router.get('/debug', (req, res) => {
  res.json({
    logs:    FAKE_LOGS,
    session: req.session.user,
    server:  {
      pid:     process.pid,
      uptime:  process.uptime(),
      node:    process.version,
      hint:    'Try updating session properties via PUT /api/v1/internal/debug'
    }
  });
});

/**
 * PUT /api/v1/internal/debug
 * Body: any JSON object
 *
 * VULNERABILITY: Mass Assignment (Insecure Direct Object Reference on session)
 *   Object.assign() merges the entire request body into req.session.user with
 *   NO field whitelist. An attacker can set arbitrary session properties,
 *   including is_admin: true, by sending:
 *
 *     PUT /api/v1/internal/debug
 *     Content-Type: application/json
 *     { "is_admin": true }
 *
 *   This escalates the guest session to admin without any credentials,
 *   unlocking /api/v1/report/generate (the prototype pollution sink).
 */
router.put('/debug', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'No active session.' });
  }

  // VULNERABLE: no field-level whitelist – entire body merged into session user
  Object.assign(req.session.user, req.body);

  const responseBody = {
    message: 'Session properties updated.',
    user:    req.session.user
  };

  // ── FLAG 2 ─────────────────────────────────────────────────────────────────
  if (req.session.user.is_admin === true) {
    responseBody.flag = 'VulnOs{m4ss_4ss1gnm3nt_1s_4dm1n_now}';
    responseBody.hint = 'Admin unlocked. POST /api/v1/report/generate is now available.';
  }
  // ───────────────────────────────────────────────────────────────────────────

  return res.json(responseBody);
});

module.exports = router;
