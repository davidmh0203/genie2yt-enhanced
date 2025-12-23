import type { User, Env } from '../types';

export class UserRepository {
  constructor(private db: D1Database) {}

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first<User>();

    return result || null;
  }

  async findById(userId: number): Promise<User | null> {
    const result = await this.db
      .prepare('SELECT * FROM users WHERE user_id = ?')
      .bind(userId)
      .first<User>();

    return result || null;
  }

  async create(email: string, oauthToken?: string, refreshToken?: string, expiresAt?: string): Promise<User> {
    const result = await this.db
      .prepare(
        'INSERT INTO users (email, oauth_token, refresh_token, token_expires_at) VALUES (?, ?, ?, ?) RETURNING *'
      )
      .bind(email, oauthToken || null, refreshToken || null, expiresAt || null)
      .first<User>();

    if (!result) {
      throw new Error('Failed to create user');
    }

    return result;
  }

  async updateToken(
    userId: number,
    oauthToken: string,
    refreshToken?: string,
    expiresAt?: string
  ): Promise<void> {
    await this.db
      .prepare(
        'UPDATE users SET oauth_token = ?, refresh_token = ?, token_expires_at = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
      )
      .bind(oauthToken, refreshToken || null, expiresAt || null, userId)
      .run();
  }

  async upsert(email: string, oauthToken?: string, refreshToken?: string, expiresAt?: string): Promise<User> {
    const existing = await this.findByEmail(email);

    if (existing) {
      if (oauthToken) {
        await this.updateToken(existing.user_id, oauthToken, refreshToken, expiresAt);
        return (await this.findById(existing.user_id))!;
      }
      return existing;
    }

    return await this.create(email, oauthToken, refreshToken, expiresAt);
  }
}










