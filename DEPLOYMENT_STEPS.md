# 배포 단계별 가이드

## 1단계: Worker 배포 준비

### 1.1 D1 데이터베이스 생성
```bash
cd worker
npx wrangler d1 create genie2yt-db
```

출력에서 `database_id`를 복사하여 `wrangler.toml`의 `database_id`에 입력하세요.

### 1.2 KV 네임스페이스 생성
```bash
npx wrangler kv:namespace create "CACHE"
```

출력에서 `id`를 복사하여 `wrangler.toml`의 KV 네임스페이스 `id`에 입력하세요.

### 1.3 wrangler.toml 수정
`wrangler.toml` 파일을 열어서:
- `database_id = "your-database-id-here"` → 실제 database_id로 변경
- `id = "your-kv-namespace-id-here"` → 실제 KV namespace id로 변경

### 1.4 프로덕션 데이터베이스 마이그레이션
```bash
cd worker
npx wrangler d1 execute genie2yt-db --remote --file=../database/schema.sql
```

### 1.5 환경 변수 설정 (Secrets)
```bash
# YouTube API Key (선택사항, API Key가 있으면 설정)
npx wrangler secret put YOUTUBE_API_KEY
# 프롬프트가 나오면 API Key를 입력하세요
```

### 1.6 Worker 배포
```bash
cd worker
npx wrangler deploy
```

배포가 완료되면 Worker URL이 출력됩니다 (예: `https://genie2yt-worker.your-subdomain.workers.dev`)

## 2단계: Frontend 빌드

### 2.1 빌드 실행
```bash
cd frontend
npm run build
```

빌드 결과물은 `frontend/dist` 폴더에 생성됩니다.

### 2.2 환경 변수 확인
프로덕션 환경 변수를 설정해야 합니다:
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth Client ID
- `VITE_CLOUDFLARE_WORKER_BASE_URL`: 위에서 배포한 Worker URL

## 3단계: Frontend 배포

### 옵션 A: Cloudflare Pages (권장)

1. Cloudflare Dashboard 접속
2. Pages → Create a project
3. "Upload assets" 선택
4. `frontend/dist` 폴더를 업로드
5. Environment variables 설정:
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_CLOUDFLARE_WORKER_BASE_URL`
6. Deploy

### 옵션 B: Vercel

```bash
cd frontend
npx vercel --prod
```

환경 변수를 Vercel Dashboard에서 설정하세요.

### 옵션 C: Netlify

```bash
cd frontend
npx netlify deploy --prod --dir=dist
```

환경 변수를 Netlify Dashboard에서 설정하세요.

## 4단계: Google OAuth 설정

1. Google Cloud Console 접속
2. APIs & Services → Credentials
3. OAuth 2.0 Client ID 선택
4. "Authorized redirect URIs"에 추가:
   - `https://your-frontend-domain.com/authorize`
   - `http://localhost:5173/authorize` (로컬 개발용)

## 5단계: 배포 확인

1. Worker 헬스 체크:
   ```bash
   curl https://genie2yt-worker.your-subdomain.workers.dev/health
   ```

2. Frontend 접속하여 로그인 테스트

3. 플레이리스트 변환 테스트

## 문제 해결

### D1 데이터베이스 에러
- `wrangler.toml`의 `database_id`가 올바른지 확인
- 프로덕션 마이그레이션이 실행되었는지 확인

### KV 네임스페이스 에러
- `wrangler.toml`의 KV 네임스페이스 `id`가 올바른지 확인

### CORS 에러
- Worker의 CORS 미들웨어가 활성화되어 있는지 확인
- Frontend URL이 올바르게 설정되었는지 확인

### 빌드 에러
- `npm install` 실행하여 의존성 설치
- TypeScript 타입 에러는 `npm run build` (tsc 체크 없이) 사용

