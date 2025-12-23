import type { ParsedSong, YouTubeVideo } from '../../../types';

export class KoreanNormalizeMatch {

  match(song: ParsedSong, video: YouTubeVideo): number {
    const normalizedSong = this.normalizeKorean(song.title);
    const normalizedVideo = this.normalizeKorean(video.title);
    const normalizedArtist = this.normalizeKorean(song.artist);

    if (normalizedSong === normalizedVideo) {
      return 1.0;
    }

    if (normalizedVideo.includes(normalizedSong) && normalizedVideo.includes(normalizedArtist)) {
      return 0.95;
    }

    if (normalizedVideo.includes(normalizedSong)) {
      return 0.85;
    }

    const similarity = this.calculateSimilarity(normalizedSong, normalizedVideo);
    return similarity;
  }

  private normalizeKorean(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s가-힣]/g, '')
      .replace(/\s+/g, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    let matches = 0;
    for (let i = 0; i < shorter.length; i++) {
      if (longer.includes(shorter[i])) {
        matches++;
      }
    }

    return matches / longer.length;
  }
}










