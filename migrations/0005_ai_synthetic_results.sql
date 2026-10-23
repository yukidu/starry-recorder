-- Isolated AI lab synthetic results only. No user IDs or personal recordings.
CREATE TABLE IF NOT EXISTS ai_synthetic_results(
 id TEXT PRIMARY KEY,
 answer TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('succeeded','failed')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
