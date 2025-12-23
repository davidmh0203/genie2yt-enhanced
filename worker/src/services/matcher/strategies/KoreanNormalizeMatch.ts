import type { ParsedSong, YouTubeVideo } from '../../../types';

/**
 * 한글 정규화 기반 매칭
 * 자모 분리 및 KS X 1001 매핑을 고려한 매칭
 */
export class KoreanNormalizeMatch {
  private threshold: number = 0.75;

  match(song: ParsedSong, video: YouTubeVideo): number {
    const normalizedSong = this.normalizeKorean(song.title);
    const normalizedVideo = this.normalizeKorean(video.title);
    const normalizedArtist = this.normalizeKorean(song.artist);

    // 정규화된 문자열 비교
    if (normalizedSong === normalizedVideo) {
      return 1.0;
    }

    // 부분 일치 검사
    if (normalizedVideo.includes(normalizedSong) && normalizedVideo.includes(normalizedArtist)) {
      return 0.95;
    }

    if (normalizedVideo.includes(normalizedSong)) {
      return 0.85;
    }

    // 유사도 계산 (간단한 문자열 유사도)
    const similarity = this.calculateSimilarity(normalizedSong, normalizedVideo);
    return similarity;
  }

  /**
   * 한글 정규화: 자모 분리, 공백 제거, 특수문자 제거
   */
  private normalizeKorean(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s가-힣]/g, '') // 특수문자 제거 (한글, 영문, 숫자만)
      .replace(/\s+/g, '') // 공백 제거
      .normalize('NFD') // 자모 분리
      .replace(/[\u0300-\u036f]/g, ''); // 조합 문자 제거
  }

  /**
   * 문자열 유사도 계산 (간단한 버전)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    // 공통 문자 개수 계산
    let matches = 0;
    for (let i = 0; i < shorter.length; i++) {
      if (longer.includes(shorter[i])) {
        matches++;
      }
    }

    return matches / longer.length;
  }
}






