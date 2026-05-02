PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  email_verified_at TEXT,
  disabled_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  secret_hash TEXT NOT NULL,
  user_agent TEXT,
  ip_hash TEXT,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT NOT NULL,
  window_start TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT NOT NULL,
  PRIMARY KEY (key, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON rate_limits(expires_at);

CREATE TABLE IF NOT EXISTS email_outbox (
  id TEXT PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS auctions (
  id TEXT PRIMARY KEY,
  lot_no TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  start_price REAL NOT NULL,
  current_bid REAL,
  current_bid_user_id TEXT,
  min_increment REAL NOT NULL DEFAULT 1000,
  bid_count INTEGER NOT NULL DEFAULT 0,
  ends_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (current_bid_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_lot_no ON auctions(lot_no);

CREATE TABLE IF NOT EXISTS bids (
  id TEXT PRIMARY KEY,
  auction_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  amount REAL NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bids_auction_id ON bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON bids(user_id);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON bids(created_at);

INSERT OR IGNORE INTO auctions (
  id, lot_no, title, start_price, current_bid, min_increment, bid_count, ends_at, status, created_at, updated_at
) VALUES
('a1', '34AT001', 'Sedan 1.6 Dizel Otomatik', 810000, 840000, 1000, 1, '2030-01-01T10:00:00.000Z', 'ACTIVE', '2026-05-02T09:00:00.000Z', '2026-05-02T09:00:00.000Z'),
('a2', '34AT002', 'Panelvan 2.0 Manuel', 1150000, NULL, 1000, 0, '2030-01-01T10:00:00.000Z', 'ACTIVE', '2026-05-02T09:00:00.000Z', '2026-05-02T09:00:00.000Z'),
('a3', '06AT103', 'Arazi Aracı 4x4', 1950000, 2010000, 5000, 1, '2025-01-01T10:00:00.000Z', 'ENDED', '2026-05-02T09:00:00.000Z', '2026-05-02T09:00:00.000Z'),
('a4', '35AT044', 'Dizüstü Bilgisayar Seti (20 Adet)', 420000, 468000, 1000, 1, '2030-01-01T10:00:00.000Z', 'ACTIVE', '2026-05-02T09:00:00.000Z', '2026-05-02T09:00:00.000Z'),
('a5', '16AT211', 'Ofis Mobilya Paketi', 270000, NULL, 1000, 0, '2030-01-01T10:00:00.000Z', 'ACTIVE', '2026-05-02T09:00:00.000Z', '2026-05-02T09:00:00.000Z'),
('a6', '34AT330', 'Depolama Raf Sistemi', 890000, 910000, 1000, 1, '2030-01-01T10:00:00.000Z', 'ACTIVE', '2026-05-02T09:00:00.000Z', '2026-05-02T09:00:00.000Z'),
('a7', '07AT510', 'Deniz Manzaralı 2+1 Daire', 3650000, 3880000, 10000, 1, '2030-01-01T10:00:00.000Z', 'ACTIVE', '2026-05-02T09:00:00.000Z', '2026-05-02T09:00:00.000Z'),
('a8', '34AT777', 'Beyaz Eşya Toplu Satış (15 Kalem)', 540000, NULL, 1000, 0, '2030-01-01T10:00:00.000Z', 'ACTIVE', '2026-05-02T09:00:00.000Z', '2026-05-02T09:00:00.000Z');
