'use strict';

const express = require('express');
const axios   = require('axios');
const router  = express.Router();

// ─── IP Blacklist ─────────────────────────────────────────────────────────────
// VULNERABILITY: checked against the RAW URL string before any parsing.
// This means alternative representations of 127.0.0.1 pass through:
//
//   Decimal encoding : http://2130706433:6666/      ← PRIMARY BYPASS
//   Hex encoding     : http://0x7f000001:6666/
//   Octal (non-std)  : http://0177.0.0.1:6666/
//
// Node.js / axios uses the WHATWG URL parser, which normalises these to
// 127.0.0.1 AFTER the blacklist check – so the request reaches the internal
// debug server.
// ─────────────────────────────────────────────────────────────────────────────
const IP_BLACKLIST = [
  '127.0.0.1',
  'localhost',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  '169.254.169.254'   // GCP instance metadata endpoint – partially mitigated
];

function isBlocked(rawUrl) {
  const lower = rawUrl.toLowerCase();
  return IP_BLACKLIST.some(entry => lower.includes(entry));
}

/**
 * POST /api/v1/preview
 * Body: { "url": "https://linkedin.com/in/username" }
 *
 * Fetches the provided URL server-side and returns the response body.
 * Intended for previewing LinkedIn profiles during consultant onboarding.
 *
 * VULNERABILITY: Server-Side Request Forgery (SSRF)
 *   The blacklist only matches literal strings. Use decimal-encoded IPs to
 *   reach internal services:
 *
 *     POST /api/v1/preview
 *     { "url": "http://2130706433:6666/" }
 *
 *   This fetches the internal debug server running on 127.0.0.1:6666 inside
 *   the backend container, revealing Flag 1 and a map of internal routes.
 */
router.post('/', async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'A "url" field is required.' });
  }

  // Vulnerable check – operates on the raw string, not the normalised URL
  if (isBlocked(url)) {
    return res.status(403).json({
      error: 'URL blocked. Internal and loopback addresses are not permitted.'
    });
  }

  try {
    const response = await axios.get(url, {
      timeout:        8000,
      maxRedirects:   2,
      headers:        { 'User-Agent': 'CipherOps-LinkPreview/1.0' },
      validateStatus: () => true   // return response for any HTTP status
    });

    return res.json({
      url,
      status:      response.status,
      contentType: response.headers['content-type'] || 'unknown',
      body:        typeof response.data === 'string'
                     ? response.data.slice(0, 8192)
                     : response.data
    });
  } catch (err) {
    return res.status(502).json({
      error:   'Failed to fetch the provided URL.',
      details: err.message
    });
  }
});

module.exports = router;
