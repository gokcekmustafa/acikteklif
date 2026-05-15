PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS auction_favorites (
  user_id TEXT NOT NULL,
  auction_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, auction_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_auction_favorites_user_id ON auction_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_auction_favorites_auction_id ON auction_favorites(auction_id);
CREATE INDEX IF NOT EXISTS idx_auction_favorites_created_at ON auction_favorites(created_at);