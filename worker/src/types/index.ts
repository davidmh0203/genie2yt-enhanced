// 공통 타입 정의

export interface ParsedSong {
  title: string;
  artist: string;
  album?: string;
  albumImage?: string;
}

export interface User {
  user_id: number;
  email: string;
  oauth_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ConvertLog {
  log_id: number;
  user_id: number;
  src_playlist: string;
  dest_playlist?: string;
  playlist_title?: string;
  success_count: number;
  fail_count: number;
  total_count: number;
  error_msg?: string;
  processing_time_ms?: number;
  created_at: string;
}

export interface ApiLog {
  log_id: number;
  user_id?: number;
  platform: string;
  endpoint?: string;
  request?: string;
  response?: string;
  status_code?: number;
  error_msg?: string;
  created_at: string;
}

export interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnail?: string;
}

export interface MatchResult {
  song: ParsedSong;
  matchedVideo?: YouTubeVideo;
  confidence: number;
  matchStrategy: string;
}

export interface ConversionResult {
  logId: number;
  playlistId: string;
  playlistUrl: string;
  successCount: number;
  failCount: number;
  totalCount: number;
  processingTimeMs: number;
}

export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  YOUTUBE_API_KEY?: string;
}
