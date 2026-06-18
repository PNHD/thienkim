-- TK Pipeline v2 — D1 Schema

CREATE TABLE IF NOT EXISTS ideas (
  idea_id TEXT PRIMARY KEY,
  status TEXT DEFAULT 'scouted',
  trend_name TEXT NOT NULL,
  niche TEXT,
  mood TEXT,
  country TEXT DEFAULT 'VN',
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS packs (
  pack_id TEXT PRIMARY KEY,
  idea_id TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  trend_title TEXT NOT NULL,
  content_type TEXT DEFAULT 'ootd_editorial',
  story_pattern TEXT,
  visual_anchor TEXT,
  editing_style TEXT,
  thumbnail_scene TEXT,
  expected_stage_count INTEGER DEFAULT 4,
  storyboard_json TEXT,
  caption TEXT,
  hashtags TEXT,
  hook TEXT,
  cover_text TEXT,
  publish_status TEXT DEFAULT 'unpublished',
  published_url TEXT,
  discord_thread_id TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (idea_id) REFERENCES ideas(idea_id)
);

CREATE TABLE IF NOT EXISTS shots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pack_id TEXT NOT NULL,
  shot_number INTEGER NOT NULL,
  status TEXT DEFAULT 'draft',
  scene_json TEXT,
  image_prompt TEXT,
  video_prompt_cn TEXT,
  duration TEXT DEFAULT '3s',
  first_frame_url TEXT,
  video_url TEXT,
  qc_status TEXT DEFAULT 'pending',
  qc_score REAL,
  qc_notes TEXT,
  face_drift_risk TEXT DEFAULT 'low',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (pack_id) REFERENCES packs(pack_id),
  UNIQUE(pack_id, shot_number)
);

CREATE TABLE IF NOT EXISTS agent_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pack_id TEXT,
  agent TEXT NOT NULL,
  step TEXT NOT NULL,
  input_summary TEXT,
  output_summary TEXT,
  model TEXT,
  tokens_in INTEGER,
  tokens_out INTEGER,
  duration_ms INTEGER,
  success INTEGER DEFAULT 1,
  error_msg TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
