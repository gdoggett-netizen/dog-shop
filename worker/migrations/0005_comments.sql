CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
