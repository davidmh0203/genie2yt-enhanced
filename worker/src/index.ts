import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { Env } from './types';
import { UserRepository } from './repositories/UserRepository';
import { ConvertLogRepository } from './repositories/ConvertLogRepository';
import { ConvertLogItemsRepository } from './repositories/ConvertLogItemsRepository';
import { ApiLogRepository } from './repositories/ApiLogRepository';
import { CacheRepository } from './repositories/CacheRepository';
import { YouTubeAdapter } from './services/youtube/YouTubeAdapter';
import { MatchingEngine } from './services/matcher/MatchingEngine';
import { PlaylistConverter } from './services/converter/PlaylistConverter';
import { GenieParser } from './services/parser/GenieParser';
import { Logger } from './utils/logger';

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', cors());
app.use('*', logger());

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Parse Genie playlist
app.post('/api/parse-genie', async (c) => {
  try {
    const { url } = await c.req.json();

    if (!url || !url.includes('genie.co.kr')) {
      return c.json({ error: 'Invalid Genie Music URL' }, 400);
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      return c.json({ error: 'Failed to fetch playlist from Genie Music' }, 400);
    }

    const html = await response.text();
    const parser = new GenieParser();
    const songs = parser.parse(html);
    const title = parser.extractTitle(html);

    if (songs.length === 0) {
      return c.json({ error: 'No songs found in the playlist' }, 400);
    }

    return c.json({ songs, totalCount: songs.length, title });
  } catch (error) {
    Logger.error('Parse genie error', { error: error instanceof Error ? error.message : String(error) });
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Search YouTube
app.post('/api/search-youtube', async (c) => {
  try {
    const { query, accessToken } = await c.req.json();

    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    if (!query) {
      return c.json({ error: 'No search query provided' }, 400);
    }

    const youtubeAdapter = new YouTubeAdapter(accessToken, c.env.YOUTUBE_API_KEY);
    const videos = await youtubeAdapter.search(query, 1);

    if (videos.length === 0) {
      return c.json({ error: 'No YouTube video found for this song' }, 404);
    }

    return c.json({
      videoId: videos[0].videoId,
      title: videos[0].title,
    });
  } catch (error) {
    Logger.error('Search YouTube error', { error: error instanceof Error ? error.message : String(error) });
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Convert playlist
app.post('/api/convert', async (c) => {
  try {
    const { url, playlistTitle, accessToken, email } = await c.req.json();

    if (!url || !url.includes('genie.co.kr')) {
      return c.json({ error: 'Invalid Genie Music URL' }, 400);
    }

    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    // 사용자 관리
    const userRepo = new UserRepository(c.env.DB);
    let user;
    if (email) {
      user = await userRepo.upsert(email, accessToken);
    }

    // 서비스 초기화
    const youtubeAdapter = new YouTubeAdapter(accessToken, c.env.YOUTUBE_API_KEY);
    const matchingEngine = new MatchingEngine();
    const cacheRepository = new CacheRepository(c.env.CACHE);
    const convertLogRepository = new ConvertLogRepository(c.env.DB);
    const convertLogItemsRepository = new ConvertLogItemsRepository(c.env.DB);
    const apiLogRepository = new ApiLogRepository(c.env.DB);

    const converter = new PlaylistConverter(
      youtubeAdapter,
      matchingEngine,
      cacheRepository,
      convertLogRepository,
      convertLogItemsRepository,
      apiLogRepository,
      user?.user_id
    );

    // 변환 실행
    const result = await converter.convert(url, playlistTitle);

    // userId를 응답에 추가
    return c.json({
      ...result,
      userId: user?.user_id,
    });
  } catch (error) {
    Logger.error('Convert error', { error: error instanceof Error ? error.message : String(error) });
    return c.json(
      {
        error: 'Conversion failed',
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

// Get user by email
app.get('/api/user', async (c) => {
  try {
    const email = c.req.query('email');
    if (!email) {
      return c.json({ error: 'Email required' }, 400);
    }

    const userRepo = new UserRepository(c.env.DB);
    const user = await userRepo.findByEmail(email);

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ userId: user.user_id });
  } catch (error) {
    Logger.error('Get user error', { error: error instanceof Error ? error.message : String(error) });
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get conversion history
app.get('/api/history', async (c) => {
  try {
    const userId = parseInt(c.req.query('userId') || '0');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');

    if (!userId) {
      return c.json({ error: 'User ID required' }, 400);
    }

    const convertLogRepository = new ConvertLogRepository(c.env.DB);
    const logs = await convertLogRepository.findByUserId(userId, limit, offset);

    return c.json({ logs, total: logs.length });
  } catch (error) {
    Logger.error('Get history error', { error: error instanceof Error ? error.message : String(error) });
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get conversion log details
app.get('/api/convert-log/:logId/items', async (c) => {
  try {
    const logId = parseInt(c.req.param('logId') || '0');

    if (!logId) {
      return c.json({ error: 'Log ID required' }, 400);
    }

    const convertLogItemsRepository = new ConvertLogItemsRepository(c.env.DB);
    const items = await convertLogItemsRepository.findByLogId(logId);

    return c.json({ items, total: items.length });
  } catch (error) {
    Logger.error('Get convert log items error', { error: error instanceof Error ? error.message : String(error) });
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get error logs
app.get('/api/errors', async (c) => {
  try {
    const userId = c.req.query('userId') ? parseInt(c.req.query('userId')!) : undefined;
    const limit = parseInt(c.req.query('limit') || '50');

    const convertLogRepository = new ConvertLogRepository(c.env.DB);
    const logs = await convertLogRepository.getErrorLogs(userId, limit);

    return c.json({ logs, total: logs.length });
  } catch (error) {
    Logger.error('Get errors error', { error: error instanceof Error ? error.message : String(error) });
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;






