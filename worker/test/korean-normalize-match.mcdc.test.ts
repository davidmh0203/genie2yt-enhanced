import { KoreanNormalizeMatch } from '../src/services/matcher/strategies/KoreanNormalizeMatch';
import type { ParsedSong, YouTubeVideo } from '../src/types';

describe('TC-03: KoreanNormalizeMatch.match() - MCDC Test', () => {
  const matcher = new KoreanNormalizeMatch();

  // TC-03-01: C1=참, C2=참 → 결과=참
  test('TC-03-01: C1=true, C2=true → result=true (0.95)', () => {
    const song: ParsedSong = { title: '좋은날', artist: '아이유' };
    const video: YouTubeVideo = {
      videoId: 'test1',
      title: '아이유 좋은날',
    };
    const score = matcher.match(song, video);
    expect(score).toBe(0.95);
  });

  // TC-03-02: C1=참, C2=거짓 → 결과=거짓
  test('TC-03-02: C1=true, C2=false → result=false', () => {
    const song: ParsedSong = { title: '좋은날', artist: '아이유' };
    const video: YouTubeVideo = {
      videoId: 'test2',
      title: '좋은날 다른내용', // 제목 포함, 아티스트 없음
    };
    const score = matcher.match(song, video);
    // C1 && C2 조건은 false이므로 0.95가 아님을 확인
    expect(score).not.toBe(0.95);
    // 실제 구현에서는 정규화 후 부분 일치로 처리될 수 있음
    expect(score).toBeGreaterThanOrEqual(0);
  });

  // TC-03-03: C1=거짓, C2=참 → 결과=거짓
  test('TC-03-03: C1=false, C2=true → result=false', () => {
    const song: ParsedSong = { title: '좋은날', artist: '아이유' };
    const video: YouTubeVideo = {
      videoId: 'test3',
      title: '아이유', // 제목 없음
    };
    const score = matcher.match(song, video);
    expect(score).not.toBe(0.95);
    expect(score).toBeLessThan(0.95);
  });

  // TC-03-04: C1=거짓, C2=거짓 → 결과=거짓
  test('TC-03-04: C1=false, C2=false → result=false', () => {
    const song: ParsedSong = { title: '좋은날', artist: '아이유' };
    const video: YouTubeVideo = {
      videoId: 'test4',
      title: '다른곡',
    };
    const score = matcher.match(song, video);
    expect(score).not.toBe(0.95);
    expect(score).toBeLessThan(0.95);
  });
});

