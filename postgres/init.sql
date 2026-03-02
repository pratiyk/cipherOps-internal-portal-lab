-- ============================================================
--  CipherOps PostgreSQL Seed Data
--  Fake consultant data – serves as a distraction rabbit hole
-- ============================================================

CREATE TABLE IF NOT EXISTS consultants (
    id               SERIAL PRIMARY KEY,
    username         VARCHAR(64)  UNIQUE NOT NULL,
    email            VARCHAR(128) UNIQUE NOT NULL,
    password_hash    VARCHAR(256) NOT NULL,
    clearance_level  VARCHAR(32)  NOT NULL DEFAULT 'standard',
    department       VARCHAR(64),
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Passwords (for reference only – these are distraction accounts):
--   j.mercer  → consultant123
--   a.chen    → P3nT3st!2024
--   r.okafor  → RedTeam#99
--   s.novak   → forensics_pass1
--   admin     → CipherOps@Admin1
-- NOTE: None of these accounts are needed for the actual attack chain.
INSERT INTO consultants (username, email, password_hash, clearance_level, department) VALUES
('j.mercer',
 'j.mercer@cipherops.internal',
 '$2b$12$K1qmA6vFz8tLxkGJElYmvO8Kn6EzRmN3Lv9sP7qUi2wXyD4hBc7Gy',
 'standard',
 'Threat Intelligence'),

('a.chen',
 'a.chen@cipherops.internal',
 '$2b$12$Rv9JkLp2Mq3xWzUyO5nTeO4Fs8gHiKlP0dYbA1vNm7rS6cX9Ew2Lu',
 'elevated',
 'Penetration Testing'),

('r.okafor',
 'r.okafor@cipherops.internal',
 '$2b$12$Xw4TbQc7Dn2YpVa3Mk8FiP6Hr9Js0KlNz5OuE1mv4qR2gS8eW7Ct6',
 'restricted',
 'Red Team'),

('s.novak',
 's.novak@cipherops.internal',
 '$2b$12$Zy6UcRd8Eo3ZqWb4Nl9GjQ7Is0Kt1LmOa6PvF2nw5sT3hU9fX8Du7',
 'standard',
 'Forensics'),

('admin',
 'admin@cipherops.internal',
 '$2b$12$Ab8VdSe9Fp4ArXc5Om0HkR8Jt2Lu3MnPb7QwG3ox6uV4iW0gY9Ev8p',
 'top_secret',
 'Operations');

-- "Decoy vault" table – contains a fake flag to mislead players
CREATE TABLE IF NOT EXISTS vault_entries (
    id          SERIAL PRIMARY KEY,
    entry_key   VARCHAR(128) UNIQUE NOT NULL,
    entry_value TEXT,
    owner_id    INTEGER REFERENCES consultants(id),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO vault_entries (entry_key, entry_value, owner_id) VALUES
('flag',
 'VulnOs{rabbit_hole_nice_try_this_isnt_it}',
 5),

('internal_note',
 'Redis deployment is running as root per DevOps request – check with infra team before next audit',
 5),

('todo',
 'Rotate SSH keys on prod servers before end of week',
 3),

('credential_note',
 'DO NOT hard-code credentials – refer to internal vault',
 5),

('system_info',
 'Backend debug service listening on loopback – not reachable externally... probably',
 5);
