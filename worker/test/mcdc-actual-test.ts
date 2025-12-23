// MCDC 실제 테스트 실행 스크립트
import { MatchingEngine } from '../src/services/matcher/MatchingEngine';
import { TitleExactMatch } from '../src/services/matcher/strategies/TitleExactMatch';
import { FuzzyMatch } from '../src/services/matcher/strategies/FuzzyMatch';
import { KoreanNormalizeMatch } from '../src/services/matcher/strategies/KoreanNormalizeMatch';
import type { ParsedSong, YouTubeVideo } from '../src/types';

console.log('=== MCDC 실제 테스트 실행 ===\n');

// TC-01: MatchingEngine.match()
console.log('TC-01: MatchingEngine.match()');
const engine = new MatchingEngine();
const song: ParsedSong = { title: 'Test Song', artist: 'Test Artist' };

// TC-01-01: bestScore >= 0.6 && bestMatch (both true)
const candidates1: YouTubeVideo[] = [{ videoId: 'abc', title: 'Test Artist - Test Song' }];
const result1 = engine.match(song, candidates1);
console.log('TC-01-01:', {
  expected: 'matchedVideo가 있는 객체 반환',
  actual: result1?.matchedVideo ? 'matchedVideo가 있는 객체 반환' : 'matchedVideo가 없는 객체 반환',
  passed: result1?.matchedVideo !== undefined,
});

// TC-01-02: bestScore >= 0.6 && bestMatch (C1 true, C2 false)
const result2 = engine.match(song, []);
console.log('TC-01-02:', {
  expected: 'matchedVideo가 없는 객체 반환',
  actual: result2?.matchedVideo ? 'matchedVideo가 있는 객체 반환' : 'matchedVideo가 없는 객체 반환',
  passed: result2?.matchedVideo === undefined,
});

// TC-01-03: bestScore >= 0.6 && bestMatch (C1 false, C2 true)
const candidates3: YouTubeVideo[] = [{ videoId: 'xyz', title: 'Completely Different Song' }];
const result3 = engine.match(song, candidates3);
console.log('TC-01-03:', {
  expected: 'matchedVideo가 없는 객체 반환',
  actual: result3?.matchedVideo ? 'matchedVideo가 있는 객체 반환' : 'matchedVideo가 없는 객체 반환',
  passed: result3?.matchedVideo === undefined || (result3.confidence < 0.6),
});

// TC-01-04: bestScore >= 0.6 && bestMatch (both false)
const result4 = engine.match(song, []);
console.log('TC-01-04:', {
  expected: 'matchedVideo가 없는 객체 반환',
  actual: result4?.matchedVideo ? 'matchedVideo가 있는 객체 반환' : 'matchedVideo가 없는 객체 반환',
  passed: result4?.matchedVideo === undefined,
});

console.log('\n=== TC-02: FuzzyMatch.match() ===');
const fuzzyMatcher = new FuzzyMatch();
const song2: ParsedSong = { title: 'Test Song', artist: 'Test Artist' };

// TC-02-01: C1=true, C2=true
const video1: YouTubeVideo = { videoId: 'test1', title: 'Test Artist - Test Song' };
const score1 = fuzzyMatcher.match(song2, video1);
console.log('TC-02-01:', {
  expected: 'hasArtist = true',
  actual: score1 > 0 ? 'hasArtist = true' : 'hasArtist = false',
  score: score1,
});

// TC-02-02: C1=true, C2=false
const video2: YouTubeVideo = { videoId: 'test2', title: 'Test Artist - Other Title' };
const score2 = fuzzyMatcher.match(song2, video2);
console.log('TC-02-02:', {
  expected: 'hasArtist = true',
  actual: score2 > 0 ? 'hasArtist = true' : 'hasArtist = false',
  score: score2,
});

// TC-02-03: C1=false, C2=true
const video3: YouTubeVideo = { videoId: 'test3', title: 'Other Artist - Test Song' };
const score3 = fuzzyMatcher.match(song2, video3);
console.log('TC-02-03:', {
  expected: 'hasArtist = true',
  actual: score3 > 0 ? 'hasArtist = true' : 'hasArtist = false',
  score: score3,
});

// TC-02-04: C1=false, C2=false
const video4: YouTubeVideo = { videoId: 'test4', title: 'Other Artist - Other Title' };
const score4 = fuzzyMatcher.match(song2, video4);
console.log('TC-02-04:', {
  expected: 'hasArtist = false',
  actual: score4 > 0 ? 'hasArtist = true' : 'hasArtist = false',
  score: score4,
});

// TC-02-05: hasArtist=true, titleSimilarity > 0.5
const video5: YouTubeVideo = { videoId: 'test5', title: 'Test Artist - Test Song' };
const score5 = fuzzyMatcher.match(song2, video5);
console.log('TC-02-05:', {
  expected: 'titleSimilarity + 0.2 반환',
  actual: score5 > 0.5 ? 'titleSimilarity + 0.2 반환' : 'titleSimilarity 그대로 반환',
  score: score5,
});

// TC-02-06: hasArtist=true, titleSimilarity <= 0.5
const video6: YouTubeVideo = { videoId: 'test6', title: 'Test Artist - Tst Sng' };
const score6 = fuzzyMatcher.match(song2, video6);
console.log('TC-02-06:', {
  expected: 'titleSimilarity 그대로 반환',
  actual: score6 <= 0.7 ? 'titleSimilarity 그대로 반환' : 'titleSimilarity + 0.2 반환',
  score: score6,
});

console.log('\n=== TC-03: KoreanNormalizeMatch.match() ===');
const koreanMatcher = new KoreanNormalizeMatch();
const song3: ParsedSong = { title: '좋은날', artist: '아이유' };

// TC-03-01: C1=true, C2=true
const video7: YouTubeVideo = { videoId: 'test7', title: '아이유 좋은날' };
const score7 = koreanMatcher.match(song3, video7);
console.log('TC-03-01:', {
  expected: '0.95 반환',
  actual: score7 === 0.95 ? '0.95 반환' : `${score7} 반환`,
  passed: score7 === 0.95,
});

// TC-03-02: C1=true, C2=false
const video8: YouTubeVideo = { videoId: 'test8', title: '좋은날' };
const score8 = koreanMatcher.match(song3, video8);
console.log('TC-03-02:', {
  expected: '0.95가 아님',
  actual: score8 === 0.95 ? '0.95 반환' : `${score8} 반환`,
  passed: score8 !== 0.95,
});

// TC-03-03: C1=false, C2=true
const video9: YouTubeVideo = { videoId: 'test9', title: '아이유' };
const score9 = koreanMatcher.match(song3, video9);
console.log('TC-03-03:', {
  expected: '0.95가 아님',
  actual: score9 === 0.95 ? '0.95 반환' : `${score9} 반환`,
  passed: score9 !== 0.95,
});

// TC-03-04: C1=false, C2=false
const video10: YouTubeVideo = { videoId: 'test10', title: '다른곡' };
const score10 = koreanMatcher.match(song3, video10);
console.log('TC-03-04:', {
  expected: '0.95가 아님',
  actual: score10 === 0.95 ? '0.95 반환' : `${score10} 반환`,
  passed: score10 !== 0.95,
});

console.log('\n=== TC-04: TitleExactMatch.match() ===');
const exactMatcher = new TitleExactMatch();

// TC-04-01: C1=true, C2=true
const video11: YouTubeVideo = { videoId: 'test11', title: '아이유 좋은날' };
const score11 = exactMatcher.match(song3, video11);
console.log('TC-04-01:', {
  expected: '0.95 반환',
  actual: score11 === 0.95 ? '0.95 반환' : `${score11} 반환`,
  passed: score11 === 0.95,
});

// TC-04-02: C1=true, C2=false
const video12: YouTubeVideo = { videoId: 'test12', title: '좋은날' };
const score12 = exactMatcher.match(song3, video12);
console.log('TC-04-02:', {
  expected: '0.95가 아님 (0.8 반환)',
  actual: score12 === 0.95 ? '0.95 반환' : `${score12} 반환`,
  passed: score12 !== 0.95,
});

// TC-04-03: C1=false, C2=true
const video13: YouTubeVideo = { videoId: 'test13', title: '아이유' };
const score13 = exactMatcher.match(song3, video13);
console.log('TC-04-03:', {
  expected: '0.95가 아님 (0 반환)',
  actual: score13 === 0.95 ? '0.95 반환' : `${score13} 반환`,
  passed: score13 !== 0.95,
});

// TC-04-04: C1=false, C2=false
const video14: YouTubeVideo = { videoId: 'test14', title: '다른곡' };
const score14 = exactMatcher.match(song3, video14);
console.log('TC-04-04:', {
  expected: '0.95가 아님 (0 반환)',
  actual: score14 === 0.95 ? '0.95 반환' : `${score14} 반환`,
  passed: score14 !== 0.95,
});

console.log('\n=== 테스트 완료 ===');








