import type { YouTubeVideo } from '../../types';
import { retry } from '../../utils/retry';

export class YouTubeAdapter {
  constructor(
    private accessToken: string,
    private apiKey?: string,
    private apiLogRepository?: any
  ) {}

  /**
   * YouTube에서 곡 검색
   */
  async search(query: string, maxResults: number = 5): Promise<YouTubeVideo[]> {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&q=${encodeURIComponent(query)}&maxResults=${maxResults}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    } else if (this.apiKey) {
      const urlWithKey = `${searchUrl}&key=${this.apiKey}`;
      return await this.executeSearch(urlWithKey);
    } else {
      throw new Error('No access token or API key provided');
    }

    return await this.executeSearch(searchUrl, headers);
  }

  private async executeSearch(url: string, headers?: HeadersInit): Promise<YouTubeVideo[]> {
    const response = await retry(
      async () => {
        const res = await fetch(url, { headers });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`YouTube API error: ${res.status} ${errorText}`);
        }
        return res;
      },
      { maxRetries: 3, delays: [1000, 2000, 4000] }
    );

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return [];
    }

    return data.items.map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.default?.url,
    }));
  }

  /**
   * YouTube 재생목록 생성
   */
  async createPlaylist(title: string, description: string = ''): Promise<string> {
    const url = 'https://www.googleapis.com/youtube/v3/playlists?part=snippet,status';

    const response = await retry(
      async () => {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            snippet: {
              title: title || 'Converted from Genie Music',
              description: description || 'Playlist converted by Genie2YT',
            },
            status: {
              privacyStatus: 'private',
            },
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`YouTube API error: ${res.status} ${errorText}`);
        }

        return res;
      },
      { maxRetries: 3, delays: [1000, 2000, 4000] }
    );

    const data = await response.json();
    return data.id;
  }

  /**
   * 재생목록에 곡 추가
   */
  async addToPlaylist(playlistId: string, videoId: string): Promise<string> {
    const url = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet';

    const response = await retry(
      async () => {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            snippet: {
              playlistId,
              resourceId: {
                kind: 'youtube#video',
                videoId,
              },
            },
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`YouTube API error: ${res.status} ${errorText}`);
        }

        return res;
      },
      { maxRetries: 3, delays: [1000, 2000, 4000] }
    );

    const data = await response.json();
    return data.id;
  }
}










