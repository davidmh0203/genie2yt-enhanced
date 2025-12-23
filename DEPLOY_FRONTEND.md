# Frontend 배포 가이드

## 현재 상태
- ✅ Frontend 빌드 완료: `frontend/dist/` 폴더
- ✅ Worker 배포 완료: `https://genie2yt-worker.davidmh0203.workers.dev`

## 배포 옵션

### 옵션 1: Cloudflare Pages (수동 배포)

1. **Cloudflare Dashboard 접속**
   - https://dash.cloudflare.com 접속
   - Pages 메뉴 선택
   - "Create a project" 클릭

2. **프로젝트 생성**
   - "Upload assets" 선택
   - 프로젝트 이름: `genie2yt-frontend`
   - `frontend/dist` 폴더를 드래그 앤 드롭 또는 선택

3. **환경 변수 설정**
   - Settings → Environment variables
   - 다음 변수 추가:
     ```
     VITE_GOOGLE_CLIENT_ID=your-google-client-id
     VITE_CLOUDFLARE_WORKER_BASE_URL=https://genie2yt-worker.davidmh0203.workers.dev
     ```

4. **배포 완료**
   - 배포 후 URL 확인 (예: `https://genie2yt-frontend.pages.dev`)

### 옵션 2: Vercel

```bash
cd frontend
npm install -g vercel
vercel --prod
```

배포 중 환경 변수 입력:
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth Client ID
- `VITE_CLOUDFLARE_WORKER_BASE_URL`: https://genie2yt-worker.davidmh0203.workers.dev

### 옵션 3: Netlify

```bash
cd frontend
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

배포 중 환경 변수 설정:
- Netlify Dashboard → Site settings → Environment variables

## 배포 후 필수 설정

### 1. Google OAuth 리디렉션 URI 추가

Google Cloud Console에서:
1. APIs & Services → Credentials
2. OAuth 2.0 Client ID 선택
3. "Authorized redirect URIs"에 추가:
   - 프로덕션: `https://your-frontend-domain.com/authorize`
   - 로컬: `http://localhost:5173/authorize`

### 2. 환경 변수 확인

배포된 Frontend에서 다음 환경 변수가 올바르게 설정되었는지 확인:
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_CLOUDFLARE_WORKER_BASE_URL`

## 배포 확인

1. Frontend URL 접속
2. Google 로그인 테스트
3. 플레이리스트 변환 테스트

