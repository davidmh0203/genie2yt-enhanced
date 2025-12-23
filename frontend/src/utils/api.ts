// API 엔드포인트 설정
const API_BASE_URL = import.meta.env.VITE_CLOUDFLARE_WORKER_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export interface Song {
  title: string;
  artist: string;
  album?: string;
  albumImage?: string;
  youtubeUrl?: string;
}

export interface ConversionResult {
  logId: number;
  playlistId: string;
  playlistUrl: string;
  successCount: number;
  failCount: number;
  totalCount: number;
  processingTimeMs: number;
  userId?: number;
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

export interface ConvertLogItem {
  item_id: number;
  log_id: number;
  song_title: string;
  song_artist: string;
  matched_video_id?: string;
  matched_video_title?: string;
  confidence?: number;
  match_strategy?: string;
  is_success: number;
  error_msg?: string;
  created_at: string;
}

export const api = {
  async parseGenie(url: string): Promise<{ songs: Song[]; totalCount: number; title?: string }> {
    const response = await fetch(`${API_BASE_URL}/api/parse-genie`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to parse Genie playlist');
    }

    return response.json();
  },

  async searchYouTube(query: string, accessToken: string): Promise<{ videoId: string; title: string }> {
    const response = await fetch(`${API_BASE_URL}/api/search-youtube`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, accessToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to search YouTube');
    }

    return response.json();
  },

  async convert(
    url: string,
    playlistTitle: string | undefined,
    accessToken: string,
    email?: string
  ): Promise<ConversionResult> {
    const response = await fetch(`${API_BASE_URL}/api/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, playlistTitle, accessToken, email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.details || 'Failed to convert playlist');
    }

    return response.json();
  },

  async getHistory(userId: number, limit: number = 50, offset: number = 0): Promise<{ logs: ConvertLog[]; total: number }> {
    const response = await fetch(`${API_BASE_URL}/api/history?userId=${userId}&limit=${limit}&offset=${offset}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get history');
    }

    return response.json();
  },

  async getErrors(userId?: number, limit: number = 50): Promise<{ logs: ConvertLog[]; total: number }> {
    const url = userId
      ? `${API_BASE_URL}/api/errors?userId=${userId}&limit=${limit}`
      : `${API_BASE_URL}/api/errors?limit=${limit}`;

    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get errors');
    }

    return response.json();
  },

  async getUserByEmail(email: string): Promise<{ userId: number } | null> {
    const response = await fetch(`${API_BASE_URL}/api/user?email=${encodeURIComponent(email)}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null; // 사용자가 없음 (첫 로그인)
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to get user');
    }

    return response.json();
  },

  async getConvertLogItems(logId: number): Promise<{ items: ConvertLogItem[]; total: number }> {
    const response = await fetch(`${API_BASE_URL}/api/convert-log/${logId}/items`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get convert log items');
    }

    return response.json();
  },
};






