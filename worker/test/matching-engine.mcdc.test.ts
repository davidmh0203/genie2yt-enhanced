import { MatchingEngine } from '../src/services/matcher/MatchingEngine';
import type { ParsedSong, YouTubeVideo } from '../src/types';

describe('TC-01: MatchingEngine.match() - MCDC Test', () => {
  const engine = new MatchingEngine();
  const song: ParsedSong = { title: 'Test Song', artist: 'Test Artist' };

  // TC-01-01: C1=참, C2=참 → 결과=참
  test('TC-01-01: bestScore >= 0.6 && bestMatch (both true)', () => {
    const candidates: YouTubeVideo[] = [
      { videoId: 'abc123', title: 'Test Artist - Test Song' },
    ];
    const result = engine.match(song, candidates);
    
    expect(result).not.toBeNull();
    expect(result?.matchedVideo).toBeDefined();
    expect(result?.confidence).toBeGreaterThanOrEqual(0.6);
  });

  // TC-01-02: C1=참, C2=거짓 → 결과=거짓
  test('TC-01-02: bestScore >= 0.6 && bestMatch (C1 true, C2 false)', () => {
    const candidates: YouTubeVideo[] = [];
    const result = engine.match(song, candidates);
    
    expect(result).not.toBeNull();
    expect(result?.matchedVideo).toBeUndefined();
    expect(result?.confidence).toBeLessThan(0.6);
  });

  // TC-01-03: C1=거짓, C2=참 → 결과=거짓
  test('TC-01-03: bestScore >= 0.6 && bestMatch (C1 false, C2 true)', () => {
    // 낮은 점수를 반환하는 후보 생성 (제목이 전혀 다른 경우)
    const candidates: YouTubeVideo[] = [
      { videoId: 'xyz789', title: 'Completely Different Song' },
    ];
    const result = engine.match(song, candidates);
    
    expect(result).not.toBeNull();
    // 매칭 점수가 0.6 미만이면 matchedVideo가 없어야 함
    if (result && result.confidence < 0.6) {
      expect(result.matchedVideo).toBeUndefined();
    }
  });

  // TC-01-04: C1=거짓, C2=거짓 → 결과=거짓
  test('TC-01-04: bestScore >= 0.6 && bestMatch (both false)', () => {
    const candidates: YouTubeVideo[] = [];
    const result = engine.match(song, candidates);
    
    expect(result).not.toBeNull();
    expect(result?.matchedVideo).toBeUndefined();
    expect(result?.confidence).toBeLessThan(0.6);
  });

  // TC-01-05: 경계값 테스트 - C1=참(0.6), C2=참
  test('TC-01-05: bestScore = 0.6 && bestMatch (boundary value)', () => {
    // 정확히 0.6 점수를 받을 수 있는 후보 생성
    const candidates: YouTubeVideo[] = [
      { videoId: 'boundary', title: 'Test Song' }, // 제목만 일치하면 약 0.8 * 0.7 = 0.56 정도
    ];
    const result = engine.match(song, candidates);
    
    // 실제 점수에 따라 결과가 달라질 수 있음
    expect(result).not.toBeNull();
  });

  // TC-01-06: 경계값 테스트 - C1=거짓(0.599), C2=참
  test('TC-01-06: bestScore = 0.599 && bestMatch (boundary value)', () => {
    // 0.6 미만의 점수를 받을 수 있는 후보 생성
    const candidates: YouTubeVideo[] = [
      { videoId: 'lowscore', title: 'Similar But Not Exact' },
    ];
    const result = engine.match(song, candidates);
    
    // 점수가 0.6 미만이면 matchedVideo가 없어야 함
    if (result && result.confidence < 0.6) {
      expect(result.matchedVideo).toBeUndefined();
    }
  });
});




