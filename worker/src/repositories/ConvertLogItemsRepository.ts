import type { Env } from '../types';

export interface ConvertLogItem {
  item_id: number;
  log_id: number;
  song_title: string;
  song_artist: string;
  matched_video_id?: string;
  matched_video_title?: string;
  confidence?: number;
  match_strategy?: string;
  is_success: number; // 0: 실패, 1: 성공
  error_msg?: string;
  created_at: string;
}

export class ConvertLogItemsRepository {
  constructor(private db: D1Database) {}

  async create(item: Omit<ConvertLogItem, 'item_id' | 'created_at'>): Promise<ConvertLogItem> {
    const result = await this.db
      .prepare(
        `INSERT INTO convert_log_items 
        (log_id, song_title, song_artist, matched_video_id, matched_video_title, confidence, match_strategy, is_success, error_msg)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING *`
      )
      .bind(
        item.log_id,
        item.song_title,
        item.song_artist,
        item.matched_video_id || null,
        item.matched_video_title || null,
        item.confidence || null,
        item.match_strategy || null,
        item.is_success,
        item.error_msg || null
      )
      .first<ConvertLogItem>();

    if (!result) {
      throw new Error('Failed to create convert log item');
    }

    return result;
  }

  async findByLogId(logId: number): Promise<ConvertLogItem[]> {
    const result = await this.db
      .prepare('SELECT * FROM convert_log_items WHERE log_id = ? ORDER BY created_at ASC')
      .bind(logId)
      .all<ConvertLogItem>();

    return result.results || [];
  }

  async createBatch(items: Omit<ConvertLogItem, 'item_id' | 'created_at'>[]): Promise<void> {
    if (items.length === 0) return;

    const stmt = this.db.prepare(
      `INSERT INTO convert_log_items 
      (log_id, song_title, song_artist, matched_video_id, matched_video_title, confidence, match_strategy, is_success, error_msg)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const batch = items.map((item) =>
      stmt.bind(
        item.log_id,
        item.song_title,
        item.song_artist,
        item.matched_video_id || null,
        item.matched_video_title || null,
        item.confidence || null,
        item.match_strategy || null,
        item.is_success,
        item.error_msg || null
      )
    );

    await this.db.batch(batch);
  }
}

