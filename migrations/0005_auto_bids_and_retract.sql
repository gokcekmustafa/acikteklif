PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS auction_auto_bids (
  auction_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  max_amount REAL NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (auction_id, user_id),
  FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_auction_auto_bids_user_id ON auction_auto_bids(user_id);
CREATE INDEX IF NOT EXISTS idx_auction_auto_bids_active ON auction_auto_bids(auction_id, is_active);

ALTER TABLE bids ADD COLUMN bid_source TEXT NOT NULL DEFAULT 'MANUAL';
ALTER TABLE bids ADD COLUMN is_retracted INTEGER NOT NULL DEFAULT 0;
ALTER TABLE bids ADD COLUMN retracted_at TEXT;
ALTER TABLE bids ADD COLUMN retracted_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_bids_retracted ON bids(auction_id, is_retracted);
