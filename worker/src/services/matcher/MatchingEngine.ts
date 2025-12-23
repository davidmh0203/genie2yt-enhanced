import type { ParsedSong, YouTubeVideo, MatchResult } from '../../types';
import { TitleExactMatch } from './strategies/TitleExactMatch';
import { FuzzyMatch } from './strategies/FuzzyMatch';
import { KoreanNormalizeMatch } from './strategies/KoreanNormalizeMatch';

export interface MatchStrategy {
  match(song: ParsedSong, video: YouTubeVideo): number;
}

export class MatchingEngine {
  private strategies: { name: string; strategy: MatchStrategy; weight: number }[] = [
    { name: 'exact', strategy: new TitleExactMatch(), weight: 1.0 },
    { name: 'korean', strategy: new KoreanNormalizeMatch(), weight: 0.9 },
    { name: 'fuzzy', strategy: new FuzzyMatch(), weight: 0.7 },
  ];

  /**
   * 여러 전략을 조합하여 최적의 매칭 결과 반환
   */
  match(song: ParsedSong, candidates: YouTubeVideo[]): MatchResult | null {
    if (candidates.length === 0) {
      return {
        song,
        confidence: 0,
        matchStrategy: 'none',
      };
    }

    let bestMatch: YouTubeVideo | null = null;
    let bestScore = 0;
    let bestStrategy = 'none';

    // 각 후보에 대해 모든 전략으로 점수 계산
    for (const candidate of candidates) {
      for (const { name, strategy, weight } of this.strategies) {
        const score = strategy.match(song, candidate) * weight;

        if (score > bestScore) {
          bestScore = score;
          bestMatch = candidate;
          bestStrategy = name;
        }

        // 완벽한 매칭이면 즉시 반환
        if (score >= 0.95) {
          return {
            song,
            matchedVideo: candidate,
            confidence: score,
            matchStrategy: name,
          };
        }
      }
    }

    // 임계값 이상인 경우만 반환
    if (bestScore >= 0.6 && bestMatch) {
      return {
        song,
        matchedVideo: bestMatch,
        confidence: bestScore,
        matchStrategy: bestStrategy,
      };
    }

    return {
      song,
      confidence: bestScore,
      matchStrategy: bestStrategy,
    };
  }

  /**
   * 여러 곡에 대해 일괄 매칭
   */
  matchBatch(songs: ParsedSong[], candidatesMap: Map<string, YouTubeVideo[]>): MatchResult[] {
    return songs.map((song) => {
      const searchKey = `${song.title} ${song.artist}`;
      const candidates = candidatesMap.get(searchKey) || [];
      return this.match(song, candidates);
    });
  }
}






