# Genie2YT Enhanced

지니뮤직 재생목록을 YouTube Music으로 변환하는 웹 서비스 (소프트웨어공학 설계 문서 기반 구현)

## 기술 스택

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Radix UI

### Backend
- Cloudflare Workers
- Hono (Web Framework)
- Cloudflare D1 (SQLite Database)
- Cloudflare KV (캐싱)

## 프로젝트 구조

```
genie2yt-enhanced/
├── frontend/          # React 프론트엔드
├── worker/            # Cloudflare Worker 백엔드
├── database/          # D1 데이터베이스 스키마
└── README.md
```

## 주요 기능

- ✅ 지니뮤직 재생목록 파싱
- ✅ YouTube 재생목록 생성 및 곡 추가
- ✅ Google OAuth 2.0 인증
- ✅ 매칭 알고리즘 (FuzzyMatch, KoreanNormalizeMatch)
- ✅ 변환 이력 저장 및 조회
- ✅ 에러 로그 관리
- ✅ 캐싱 (KV Store)
- ✅ 재시도 로직 (1초, 2초, 4초 간격)

## 설정 방법

### 1. Cloudflare D1 데이터베이스 생성

```bash
cd worker
npx wrangler d1 create genie2yt-db
```

생성된 `database_id`를 `wrangler.toml`에 입력하세요.

### 2. Cloudflare KV 네임스페이스 생성

```bash
npx wrangler kv:namespace create "CACHE"
```

생성된 `id`를 `wrangler.toml`에 입력하세요.

### 3. 데이터베이스 스키마 적용

```bash
# 로컬 개발용
npm run db:migrate:local

# 프로덕션용
npm run db:migrate
```

### 4. 환경 변수 설정

#### Worker (백엔드) 환경 변수

**로컬 개발용** (`worker/.dev.vars` 파일 생성):
```env
YOUTUBE_API_KEY=your-youtube-api-key-here
```

**프로덕션 배포용** (Wrangler Secrets):
```bash
# YouTube API Key (선택사항, 서버 사이드 검색용)
npx wrangler secret put YOUTUBE_API_KEY
```

> **참고**: `GOOGLE_CLIENT_ID`는 Worker에서 사용하지 않습니다. OAuth 인증은 Frontend에서 직접 처리합니다.

#### Frontend 환경 변수

`frontend/.env` 파일 생성 (`.env.example` 파일을 복사하여 사용):

```env
# Google OAuth Client ID
# Google Cloud Console에서 OAuth 2.0 클라이언트 ID를 생성하고 입력하세요
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here

# Cloudflare Worker API Base URL
# 로컬 개발: http://localhost:8787
# 프로덕션: https://your-worker.workers.dev
VITE_API_BASE_URL=http://localhost:8787
```

> **중요**: 
> - `.env` 파일은 git에 커밋하지 마세요 (이미 `.gitignore`에 포함됨)
> - `.env.example` 파일을 참고하여 실제 `.env` 파일을 생성하세요

## 개발 실행

### Worker (백엔드)

```bash
cd worker
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 배포

### Worker 배포

```bash
cd worker
npm run deploy
```

### Frontend 배포

Cloudflare Pages 또는 Vercel에 배포:

```bash
cd frontend
npm run build
# dist 폴더를 배포
```

## API 엔드포인트

- `POST /api/parse-genie` - 지니뮤직 플레이리스트 파싱
- `POST /api/search-youtube` - YouTube 검색
- `POST /api/convert` - 재생목록 변환
- `GET /api/history?userId={id}` - 변환 이력 조회
- `GET /api/errors?userId={id}` - 에러 로그 조회

## 데이터베이스 스키마

- `users` - 사용자 정보 및 OAuth 토큰
- `convert_logs` - 변환 이력
- `api_logs` - API 호출 로그

자세한 스키마는 `database/schema.sql` 참고

## 라이선스

ISC

