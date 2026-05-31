-- Add user identity to items and comments
ALTER TABLE items ADD COLUMN added_by TEXT;
ALTER TABLE comments ADD COLUMN author TEXT;

-- Shopping session (single row, id=1 always)
CREATE TABLE IF NOT EXISTS shopping_session (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  shopper TEXT NOT NULL,
  store TEXT NOT NULL,
  started_at TEXT NOT NULL
);
