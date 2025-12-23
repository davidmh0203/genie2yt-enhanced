# 배포 가이드

## 1. Worker 배포 (Cloudflare Workers)

### 1.1 사전 준비

#### D1 데이터베이스 생성
```bash
cd worker
npx wrangler d1 create genie2yt-db
```

생성된 `database_id`를 `wrangler.toml`의 `database_id`에 입력하세요.

#### KV 네임스페이스 생성
```bash
npx wrangler kv:namespace create "CACHE"
```

생성된 `id`를 `wrangler.toml`의 KV 네임스페이스 `id`에 입력하세요.

### 1.2 프로덕션 데이터베이스 마이그레이션

```bash
cd worker
npm run db:migrate
```

또는 직접 실행:
```bash
npx wrangler d1 execute genie2yt-db --remote --file=../database/schema.sql
```

### 1.3 환경 변수 설정 (Secrets)

```bash
# YouTube API Key (선택사항)
npx wrangler secret put YOUTUBE_API_KEY
```

### 1.4 Worker 배포

```bash
cd worker
npm run deploy
```

또는:
```bash
npx wrangler deploy
```

배포 후 Worker URL을 확인하세요 (예: `https://genie2yt-worker.your-subdomain.workers.dev`)

## 2. Frontend 배포

### 2.1 빌드

```bash
cd frontend
npm install
npm run build
```

빌드 결과물은 `frontend/dist` 폴더에 생성됩니다.

### 2.2 환경 변수 설정

프로덕션 환경 변수를 설정하세요:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_CLOUDFLARE_WORKER_BASE_URL=https://genie2yt-worker.your-subdomain.workers.dev
```

### 2.3 배포 옵션

#### 옵션 A: Cloudflare Pages

1. Cloudflare Dashboard에서 Pages 프로젝트 생성
2. `frontend/dist` 폴더를 업로드
3. 또는 Git 연동하여 자동 배포

#### 옵션 B: Vercel

```bash
cd frontend
npx vercel --prod
```

#### 옵션 C: Netlify

```bash
cd frontend
npx netlify deploy --prod --dir=dist
```

## 3. 배포 후 확인사항

1. Worker URL이 정상 작동하는지 확인:
   ```bash
   curl https://genie2yt-worker.your-subdomain.workers.dev/health
   ```

2. Frontend에서 Worker API 호출이 정상 작동하는지 확인

3. Google OAuth 리디렉션 URI 설정:
   - Google Cloud Console에서 승인된 리디렉션 URI에 Frontend URL 추가
   - 예: `https://your-frontend-domain.com/authorize`

## 4. 문제 해결

### D1 데이터베이스 에러
- `database_id`가 올바르게 설정되었는지 확인
- 프로덕션 마이그레이션이 실행되었는지 확인

### KV 네임스페이스 에러
- KV 네임스페이스 `id`가 올바르게 설정되었는지 확인

### CORS 에러
- Worker의 CORS 미들웨어가 활성화되어 있는지 확인
- Frontend URL이 CORS 허용 목록에 있는지 확인

