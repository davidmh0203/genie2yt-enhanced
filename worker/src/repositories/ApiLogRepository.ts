import type { ApiLog, Env } from '../types';

export class ApiLogRepository {
  constructor(private db: D1Database) {}

  async create(log: Omit<ApiLog, 'log_id' | 'created_at'>): Promise<ApiLog> {
    const result = await this.db
      .prepare(
        `INSERT INTO api_logs 
        (user_id, platform, endpoint, request, response, status_code, error_msg)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        RETURNING *`
      )
      .bind(
        log.user_id || null,
        log.platform,
        log.endpoint || null,
        log.request || null,
        log.response || null,
        log.status_code || null,
        log.error_msg || null
      )
      .first<ApiLog>();

    if (!result) {
      throw new Error('Failed to create API log');
    }

    return result;
  }

  async findByUserId(userId: number, limit: number = 100, offset: number = 0): Promise<ApiLog[]> {
    const result = await this.db
      .prepare('SELECT * FROM api_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?')
      .bind(userId, limit, offset)
      .all<ApiLog>();

    return result.results || [];
  }

  async findByPlatform(platform: string, limit: number = 100): Promise<ApiLog[]> {
    const result = await this.db
      .prepare('SELECT * FROM api_logs WHERE platform = ? ORDER BY created_at DESC LIMIT ?')
      .bind(platform, limit)
      .all<ApiLog>();

    return result.results || [];
  }

  async getErrorLogs(limit: number = 100): Promise<ApiLog[]> {
    const result = await this.db
      .prepare('SELECT * FROM api_logs WHERE status_code >= 400 OR error_msg IS NOT NULL ORDER BY created_at DESC LIMIT ?')
      .bind(limit)
      .all<ApiLog>();

    return result.results || [];
  }
}












