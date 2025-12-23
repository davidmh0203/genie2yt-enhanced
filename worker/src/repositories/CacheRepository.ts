import type { ParsedSong } from '../types';

export class CacheRepository {
  constructor(private kv: KVNamespace) {}

  private getCacheKey(url: string): string {
    return `playlist:${url}`;
  }

  async get(url: string): Promise<ParsedSong[] | null> {
    const cached = await this.kv.get(this.getCacheKey(url), 'json');
    return cached as ParsedSong[] | null;
  }

  async set(url: string, songs: ParsedSong[], ttl: number = 3600): Promise<void> {
    await this.kv.put(this.getCacheKey(url), JSON.stringify(songs), {
      expirationTtl: ttl, // 기본 1시간
    });
  }

  async delete(url: string): Promise<void> {
    await this.kv.delete(this.getCacheKey(url));
  }

  async getSearchCache(query: string): Promise<string | null> {
    const cached = await this.kv.get(`search:${query}`, 'text');
    return cached;
  }

  async setSearchCache(query: string, videoId: string, ttl: number = 86400): Promise<void> {
    await this.kv.put(`search:${query}`, videoId, {
      expirationTtl: ttl, // 기본 24시간
    });
  }
}






