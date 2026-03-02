'use strict';

const express    = require('express');
const bcrypt     = require('bcrypt');
const { Pool }   = require('pg');
const router     = express.Router();

const pool = new Pool({
  host:     process.env.POSTGRES_HOST     || 'localhost',
  user:     process.env.POSTGRES_USER     || 'cipherops',
  password: process.env.POSTGRES_PASSWORD || 'cipherops_secret_2024',
  database: process.env.POSTGRES_DB       || 'cipherops',
  port:     5432
});

/**
 * POST /api/v1/auth/login
 * Body: { "username": "...", "password": "..." }
 *
 * Authenticates a consultant against the PostgreSQL database.
 * NOTE: The attack chain does NOT require a successful login – the
 *       mass-assignment vulnerability in /internal/debug escalates a
 *       guest session directly. This login route is a distraction.
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const result = await pool.query(
      `SELECT id, username, password_hash, clearance_level
         FROM consultants
        WHERE username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const consultant = result.rows[0];
    const match      = await bcrypt.compare(password, consultant.password_hash);

    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    req.session.user = {
      id:        consultant.id,
      username:  consultant.username,
      role:      'consultant',
      clearance: consultant.clearance_level,
      is_admin:  false    // must be escalated via the mass-assignment vulnerability
    };

    return res.json({
      message:         'Login successful.',
      username:        consultant.username,
      clearance_level: consultant.clearance_level
    });
  } catch (err) {
    console.error('[auth] DB error:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * POST /api/v1/auth/logout
 */
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out.' });
  });
});

/**
 * GET /api/v1/auth/session
 * Returns the current session user object (used by the frontend).
 */
router.get('/session', (req, res) => {
  res.json({ user: req.session.user || null });
});

module.exports = router;
