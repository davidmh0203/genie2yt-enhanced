-- Genie2YT Enhanced Database Schema for Cloudflare D1

-- users 테이블: 사용자 정보 및 OAuth 토큰 저장
CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  oauth_token TEXT,  -- 암호화된 Access Token
  refresh_token TEXT,
  token_expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- convert_logs 테이블: 재생목록 변환 이력
CREATE TABLE IF NOT EXISTS convert_logs (
  log_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  src_playlist TEXT NOT NULL,
  dest_playlist TEXT,
  playlist_title TEXT,
  success_count INTEGER DEFAULT 0,
  fail_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  error_msg TEXT,
  processing_time_ms INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- api_logs 테이블: API 호출 로그
CREATE TABLE IF NOT EXISTS api_logs (
  log_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  platform TEXT NOT NULL,  -- 'youtube', 'genie' 등
  endpoint TEXT,
  request TEXT,
  response TEXT,
  status_code INTEGER,
  error_msg TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- convert_log_items 테이블: 개별 곡의 매칭 결과 저장
CREATE TABLE IF NOT EXISTS convert_log_items (
  item_id INTEGER PRIMARY KEY AUTOINCREMENT,
  log_id INTEGER NOT NULL,
  song_title TEXT NOT NULL,
  song_artist TEXT NOT NULL,
  matched_video_id TEXT,
  matched_video_title TEXT,
  confidence REAL,
  match_strategy TEXT,
  is_success INTEGER DEFAULT 0,  -- 0: 실패, 1: 성공
  error_msg TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (log_id) REFERENCES convert_logs(log_id) ON DELETE CASCADE
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_convert_logs_user_id ON convert_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_convert_logs_created_at ON convert_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_convert_log_items_log_id ON convert_log_items(log_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_platform ON api_logs(platform);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at DESC);






