import type { ParsedSong, ConversionResult, MatchResult } from '../../types';
import { GenieParser } from '../parser/GenieParser';
import { YouTubeAdapter } from '../youtube/YouTubeAdapter';
import { MatchingEngine } from '../matcher/MatchingEngine';
import { CacheRepository } from '../../repositories/CacheRepository';
import { ConvertLogRepository } from '../../repositories/ConvertLogRepository';
import { ConvertLogItemsRepository } from '../../repositories/ConvertLogItemsRepository';
import { ApiLogRepository } from '../../repositories/ApiLogRepository';
import { Logger } from '../../utils/logger';

export class PlaylistConverter {
  constructor(
    private youtubeAdapter: YouTubeAdapter,
    private matchingEngine: MatchingEngine,
    private cacheRepository: CacheRepository,
    private convertLogRepository: ConvertLogRepository,
    private convertLogItemsRepository: ConvertLogItemsRepository,
    private apiLogRepository: ApiLogRepository,
    private userId?: number
  ) {}

  /**
   * 전체 변환 프로세스 실행
   */
  async convert(
    genieUrl: string,
    playlistTitle?: string,
    useCache: boolean = true
  ): Promise<ConversionResult> {
    const startTime = Date.now();

    try {
      // 1. 캐시 확인
      let songs: ParsedSong[] = [];
      if (useCache) {
        const cached = await this.cacheRepository.get(genieUrl);
        if (cached) {
          Logger.info('Using cached playlist data', { url: genieUrl });
          songs = cached;
        }
      }

      // 2. 파싱 (캐시가 없으면)
      if (songs.length === 0) {
        Logger.info('Fetching and parsing Genie playlist', { url: genieUrl });
        const html = await this.fetchGeniePage(genieUrl);
        const parser = new GenieParser();
        songs = parser.parse(html);
        playlistTitle = playlistTitle || parser.extractTitle(html) || `Genie Playlist (${songs.length}곡)`;

        // 캐시 저장
        if (songs.length > 0) {
          await this.cacheRepository.set(genieUrl, songs);
        }
      }

      if (songs.length === 0) {
        throw new Error('No songs found in the playlist');
      }

      // 3. 변환 로그 생성
      const log = await this.convertLogRepository.create({
        user_id: this.userId || 0,
        src_playlist: genieUrl,
        playlist_title: playlistTitle,
        success_count: 0,
        fail_count: 0,
        total_count: songs.length,
      });

      // 4. YouTube 검색 및 매칭
      Logger.info('Searching YouTube videos', { count: songs.length });
      const matchResults = await this.matchSongs(songs);

      // 5. 재생목록 생성
      Logger.info('Creating YouTube playlist', { title: playlistTitle });
      const playlistId = await this.youtubeAdapter.createPlaylist(
        playlistTitle || `Genie Playlist (${songs.length}곡)`,
        `Converted from Genie Music - ${songs.length} songs`
      );

      // 6. 곡 추가 및 개별 결과 저장
      Logger.info('Adding songs to playlist', { playlistId, count: matchResults.length });
      let successCount = 0;
      let failCount = 0;
      const logItems: Array<{
        log_id: number;
        song_title: string;
        song_artist: string;
        matched_video_id?: string;
        matched_video_title?: string;
        confidence?: number;
        match_strategy?: string;
        is_success: number;
        error_msg?: string;
      }> = [];

      for (const result of matchResults) {
        if (result.matchedVideo) {
          try {
            await this.youtubeAdapter.addToPlaylist(playlistId, result.matchedVideo.videoId);
            successCount++;
            logItems.push({
              log_id: log.log_id,
              song_title: result.song.title,
              song_artist: result.song.artist,
              matched_video_id: result.matchedVideo.videoId,
              matched_video_title: result.matchedVideo.title,
              confidence: result.confidence,
              match_strategy: result.matchStrategy,
              is_success: 1,
            });

            // Rate limiting 방지
            await new Promise((resolve) => setTimeout(resolve, 800));
          } catch (error) {
            failCount++;
            const errorMsg = error instanceof Error ? error.message : String(error);
            Logger.error('Failed to add song to playlist', {
              song: result.song.title,
              error: errorMsg,
            });
            logItems.push({
              log_id: log.log_id,
              song_title: result.song.title,
              song_artist: result.song.artist,
              matched_video_id: result.matchedVideo.videoId,
              matched_video_title: result.matchedVideo.title,
              confidence: result.confidence,
              match_strategy: result.matchStrategy,
              is_success: 0,
              error_msg: errorMsg,
            });
          }
        } else {
          failCount++;
          logItems.push({
            log_id: log.log_id,
            song_title: result.song.title,
            song_artist: result.song.artist,
            confidence: result.confidence,
            match_strategy: result.matchStrategy,
            is_success: 0,
            error_msg: '매칭된 비디오를 찾을 수 없습니다.',
          });
        }
      }

      // 개별 곡 결과 저장
      if (logItems.length > 0) {
        await this.convertLogItemsRepository.createBatch(logItems);
      }

      // 7. 로그 업데이트
      const processingTime = Date.now() - startTime;
      await this.convertLogRepository.update(log.log_id, {
        dest_playlist: playlistId,
        success_count: successCount,
        fail_count: failCount,
        processing_time_ms: processingTime,
      });

      return {
        logId: log.log_id,
        playlistId,
        playlistUrl: `https://www.youtube.com/playlist?list=${playlistId}`,
        successCount,
        failCount,
        totalCount: songs.length,
        processingTimeMs: processingTime,
      };
    } catch (error) {
      Logger.error('Conversion failed', {
        url: genieUrl,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * 곡 매칭
   */
  private async matchSongs(songs: ParsedSong[]): Promise<MatchResult[]> {
    const results: MatchResult[] = [];
    const candidatesMap = new Map<string, any[]>();

    // 각 곡에 대해 YouTube 검색
    for (const song of songs) {
      const searchQuery = `${song.title} ${song.artist}`;

      // 캐시 확인
      const cachedVideoId = await this.cacheRepository.getSearchCache(searchQuery);
      if (cachedVideoId) {
        candidatesMap.set(searchQuery, [
          {
            videoId: cachedVideoId,
            title: song.title, // 캐시된 경우 정확한 제목은 모름
          },
        ]);
        continue;
      }

      try {
        const videos = await this.youtubeAdapter.search(searchQuery, 5);
        candidatesMap.set(searchQuery, videos);

        // 첫 번째 결과를 캐시에 저장
        if (videos.length > 0) {
          await this.cacheRepository.setSearchCache(searchQuery, videos[0].videoId);
        }

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (error) {
        Logger.warn('Failed to search YouTube', {
          query: searchQuery,
          error: error instanceof Error ? error.message : String(error),
        });
        candidatesMap.set(searchQuery, []);
      }
    }

    // 매칭 엔진으로 최적 매칭 찾기
    for (const song of songs) {
      const searchQuery = `${song.title} ${song.artist}`;
      const candidates = candidatesMap.get(searchQuery) || [];
      const result = this.matchingEngine.match(song, candidates);
      results.push(result);
    }

    return results;
  }

  /**
   * Genie 페이지 가져오기
   */
  private async fetchGeniePage(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Genie page: ${response.status}`);
    }

    return await response.text();
  }
}






