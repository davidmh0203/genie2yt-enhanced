import type { ParsedSong, YouTubeVideo } from '../../../types';

export class FuzzyMatch {

  match(song: ParsedSong, video: YouTubeVideo): number {
    const songTitle = this.normalize(song.title);
    const videoTitle = this.normalize(video.title);
    const artist = this.normalize(song.artist);

    const titleSimilarity = this.calculateSimilarity(songTitle, videoTitle);
    const hasArtist = videoTitle.includes(artist) || videoTitle.includes(songTitle);

    if (hasArtist && titleSimilarity > 0.5) {
      return Math.min(1.0, titleSimilarity + 0.2);
    }

    return titleSimilarity;
  }

  private normalize(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s가-힣]/g, '')
      .replace(/\s+/g, ' ');
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const maxLen = Math.max(str1.length, str2.length);
    if (maxLen === 0) return 1.0;

    const distance = this.levenshteinDistance(str1, str2);
    return 1 - distance / maxLen;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    // 초기화
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // 거리 계산
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // 삭제
          matrix[i][j - 1] + 1, // 삽입
          matrix[i - 1][j - 1] + cost // 교체
        );
      }
    }

    return matrix[len1][len2];
  }
}










