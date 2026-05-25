CREATE TABLE IF NOT EXISTS removed_items (
  id TEXT PRIMARY KEY,
  item_id TEXT,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  note TEXT,
  qty TEXT,
  was_checked INTEGER NOT NULL DEFAULT 0,
  removed_reason TEXT NOT NULL DEFAULT 'removed',
  created_at TEXT,
  removed_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_removed_items_removed_at ON removed_items (removed_at);
CREATE INDEX IF NOT EXISTS idx_removed_items_normalized_name ON removed_items (normalized_name);
