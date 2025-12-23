import type { ConvertLog, Env } from '../types';

export class ConvertLogRepository {
  constructor(private db: D1Database) {}

  async create(log: Omit<ConvertLog, 'log_id' | 'created_at'>): Promise<ConvertLog> {
    const result = await this.db
      .prepare(
        `INSERT INTO convert_logs 
        (user_id, src_playlist, dest_playlist, playlist_title, success_count, fail_count, total_count, error_msg, processing_time_ms)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING *`
      )
      .bind(
        log.user_id,
        log.src_playlist,
        log.dest_playlist || null,
        log.playlist_title || null,
        log.success_count,
        log.fail_count,
        log.total_count,
        log.error_msg || null,
        log.processing_time_ms || null
      )
      .first<ConvertLog>();

    if (!result) {
      throw new Error('Failed to create convert log');
    }

    return result;
  }

  async findByUserId(userId: number, limit: number = 50, offset: number = 0): Promise<ConvertLog[]> {
    const result = await this.db
      .prepare('SELECT * FROM convert_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?')
      .bind(userId, limit, offset)
      .all<ConvertLog>();

    return result.results || [];
  }

  async findById(logId: number): Promise<ConvertLog | null> {
    const result = await this.db
      .prepare('SELECT * FROM convert_logs WHERE log_id = ?')
      .bind(logId)
      .first<ConvertLog>();

    return result || null;
  }

  async update(
    logId: number,
    updates: Partial<Pick<ConvertLog, 'dest_playlist' | 'success_count' | 'fail_count' | 'error_msg' | 'processing_time_ms'>>
  ): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.dest_playlist !== undefined) {
      fields.push('dest_playlist = ?');
      values.push(updates.dest_playlist);
    }
    if (updates.success_count !== undefined) {
      fields.push('success_count = ?');
      values.push(updates.success_count);
    }
    if (updates.fail_count !== undefined) {
      fields.push('fail_count = ?');
      values.push(updates.fail_count);
    }
    if (updates.error_msg !== undefined) {
      fields.push('error_msg = ?');
      values.push(updates.error_msg);
    }
    if (updates.processing_time_ms !== undefined) {
      fields.push('processing_time_ms = ?');
      values.push(updates.processing_time_ms);
    }

    if (fields.length === 0) return;

    values.push(logId);
    await this.db
      .prepare(`UPDATE convert_logs SET ${fields.join(', ')} WHERE log_id = ?`)
      .bind(...values)
      .run();
  }

  async getErrorLogs(userId?: number, limit: number = 50): Promise<ConvertLog[]> {
    let query = 'SELECT * FROM convert_logs WHERE fail_count > 0 OR error_msg IS NOT NULL ORDER BY created_at DESC LIMIT ?';
    const bindings: any[] = [limit];

    if (userId) {
      query = 'SELECT * FROM convert_logs WHERE (fail_count > 0 OR error_msg IS NOT NULL) AND user_id = ? ORDER BY created_at DESC LIMIT ?';
      bindings.unshift(userId);
    }

    const result = await this.db.prepare(query).bind(...bindings).all<ConvertLog>();
    return result.results || [];
  }
}










