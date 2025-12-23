import type { ParsedSong, YouTubeVideo, MatchResult } from "../../types";
import { TitleExactMatch } from "./strategies/TitleExactMatch";
import { FuzzyMatch } from "./strategies/FuzzyMatch";
import { KoreanNormalizeMatch } from "./strategies/KoreanNormalizeMatch";

export interface MatchStrategy {
  match(song: ParsedSong, video: YouTubeVideo): number;
}

export class MatchingEngine {
  private strategies: {
    name: string;
    strategy: MatchStrategy;
    weight: number;
  }[] = [
    { name: "exact", strategy: new TitleExactMatch(), weight: 1.0 },
    { name: "korean", strategy: new KoreanNormalizeMatch(), weight: 0.9 },
    { name: "fuzzy", strategy: new FuzzyMatch(), weight: 0.7 },
  ];

  match(song: ParsedSong, candidates: YouTubeVideo[]): MatchResult {
    if (candidates.length === 0) {
      return {
        song,
        confidence: 0,
        matchStrategy: "none",
      };
    }

    let bestMatch: YouTubeVideo | null = null;
    let bestScore = 0;
    let bestStrategy = "none";

    // 각 후보에 대해 모든 전략으로 점수 계산
    for (const candidate of candidates) {
      for (const { name, strategy, weight } of this.strategies) {
        const score = strategy.match(song, candidate) * weight;

        if (score > bestScore) {
          bestScore = score;
          bestMatch = candidate;
          bestStrategy = name;
        }

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

    if (bestScore >= 0.4 && bestMatch) {
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

  matchBatch(
    songs: ParsedSong[],
    candidatesMap: Map<string, YouTubeVideo[]>
  ): MatchResult[] {
    return songs.map((song) => {
      const searchKey = `${song.title} ${song.artist}`;
      const candidates = candidatesMap.get(searchKey) || [];
      return this.match(song, candidates);
    });
  }
}
