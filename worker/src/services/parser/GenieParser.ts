import type { ParsedSong } from '../../types';

const htmlEntityMap: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

const decodeHtml = (value: string) =>
  value.replace(/(&amp;|&lt;|&gt;|&quot;|&#39;)/g, (entity) => htmlEntityMap[entity] ?? entity);

export class GenieParser {
  parse(html: string): ParsedSong[] {
    const songs: ParsedSong[] = [];

    try {
      // JSON 데이터 추출 시도
      const jsonPatterns = [
        /var\s+PLIST_SONG_DATA\s*=\s*(\[.*?\]);/s,
        /var\s+SONG_DATA\s*=\s*(\[.*?\]);/s,
        /var\s+playlist\s*=\s*(\[.*?\]);/s,
        /"DataList"\s*:\s*(\[.*?\])/s,
      ];

      for (const pattern of jsonPatterns) {
        const match = html.match(pattern);
        if (match) {
          try {
            const data = JSON.parse(match[1]);
            if (Array.isArray(data) && data.length > 0) {
              return data.map((song: Record<string, string>) => ({
                title: song.SONG_NAME || song.SongName || song.song_name || song.title || 'Unknown',
                artist: song.ARTIST_NAME || song.ArtistName || song.artist_name || song.artist || 'Unknown',
                album: song.ALBUM_NAME || song.AlbumName || song.album_name || song.album,
                albumImage: song.ALBUM_IMG_PATH || song.AlbumImgPath || song.album_img || song.albumImage,
              }));
            }
          } catch {
            // Continue fallback parsing when JSON cannot be parsed
          }
        }
      }

      // HTML 파싱 (폴백)
      const rowPatterns = [/<tr[^>]*>(.*?)<\/tr>/gis, /<li[^>]*class="[^"]*list[^"]*"[^>]*>(.*?)<\/li>/gis];

      for (const rowPattern of rowPatterns) {
        const rows = html.match(rowPattern);

        if (rows && rows.length > 0) {
          for (const row of rows) {
            const song = this.parseRow(row);
            if (song) {
              songs.push(song);
            }
          }

          if (songs.length > 0) {
            break;
          }
        }
      }
    } catch (error) {
      console.error(`Error in GenieParser: ${error}`);
    }

    return songs;
  }

  private parseRow(row: string): ParsedSong | null {
    let title = '';
    let artist = '';
    let album = '';
    let albumImage = '';

    const titlePatterns = [
      /<a[^>]*class="[^"]*title[^"]*"[^>]*title="([^"]+)"/i,
      /<a[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/a>/i,
      /<span[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/span>/i,
      /class="[^"]*name[^"]*"[^>]*>([^<]+)</i,
    ];

    for (const pattern of titlePatterns) {
      const match = row.match(pattern);
      if (match && match[1] && !match[1].includes('class=')) {
        title = match[1].trim();
        break;
      }
    }

    const artistPatterns = [
      /<a[^>]*class="[^"]*artist[^"]*"[^>]*title="([^"]+)"/i,
      /<a[^>]*class="[^"]*artist[^"]*"[^>]*>([^<]+)<\/a>/i,
      /<span[^>]*class="[^"]*artist[^"]*"[^>]*>([^<]+)<\/span>/i,
    ];

    for (const pattern of artistPatterns) {
      const match = row.match(pattern);
      if (match && match[1] && !match[1].includes('class=')) {
        artist = match[1].trim();
        break;
      }
    }

    const albumPatterns = [
      /<a[^>]*class="[^"]*albumtitle[^"]*"[^>]*title="([^"]+)"/i,
      /<a[^>]*class="[^"]*album[^"]*"[^>]*>([^<]+)<\/a>/i,
    ];

    for (const pattern of albumPatterns) {
      const match = row.match(pattern);
      if (match && match[1] && !match[1].includes('class=')) {
        album = match[1].trim();
        break;
      }
    }

    const imgPatterns = [
      /<img[^>]*src="([^"]*album[^"]*)"/i,
      /<img[^>]*onerror="[^"]*"[^>]*src="([^"]*)"/i,
    ];

    for (const pattern of imgPatterns) {
      const match = row.match(pattern);
      if (match && match[1]) {
        albumImage = match[1];
        if (albumImage.startsWith('//')) {
          albumImage = 'https:' + albumImage;
        } else if (albumImage.startsWith('/')) {
          albumImage = 'https://www.genie.co.kr' + albumImage;
        }
        break;
      }
    }

    if (title && artist && title !== 'TITLE' && artist !== 'ARTIST') {
      return {
        title: decodeHtml(title),
        artist: decodeHtml(artist),
        album: album ? decodeHtml(album) : undefined,
        albumImage: albumImage || undefined,
      };
    }

    return null;
  }

  extractTitle(html: string): string | null {
    try {
      const patterns = [
        /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i,
        /<meta[^>]*name=["']title["'][^>]*content=["']([^"']+)["'][^>]*>/i,
        /<title>([^<]+)<\/title>/i,
        /class=["'](?:playlist-name|title|name)[^"']*["'][^>]*>\s*([^<]+)\s*<\/[^>]+>/i,
        /id=["']playlistTitle["'][^>]*>\s*([^<]+)\s*<\/[^>]+>/i,
      ];
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match?.[1]) {
          const value = match[1]
            .replace(/\s+\|\s*genie\s*$/i, '')
            .replace(/\s+-\s*genie\s*$/i, '')
            .trim();
          if (value) return value;
        }
      }
    } catch {
      // ignore and return null
    }
    return null;
  }
}












