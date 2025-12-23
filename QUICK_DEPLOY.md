# 빠른 배포 가이드

## 현재 상태
✅ Worker: 배포 완료 (`https://genie2yt-worker.davidmh0203.workers.dev`)
✅ Frontend: 빌드 완료 (`frontend/dist/`)

## Frontend 배포 (5분 소요)

### 방법 1: Cloudflare Pages (권장)

1. **https://dash.cloudflare.com** 접속
2. **Workers & Pages** → **Create application** → **Pages** → **Upload assets**
3. 프로젝트 이름: `genie2yt-frontend`
4. `frontend/dist` 폴더 업로드
5. 배포 완료 후 **Settings** → **Environment variables**:
   ```
   VITE_GOOGLE_CLIENT_ID = (Google Client ID)
   VITE_CLOUDFLARE_WORKER_BASE_URL = https://genie2yt-worker.davidmh0203.workers.dev
   ```
6. **Save and redeploy**

### 방법 2: Vercel (CLI)

```bash
cd frontend
npm install -g vercel
vercel --prod
```

## 배포 후 설정

### Google OAuth 설정
1. **Google Cloud Console** → **APIs & Services** → **Credentials**
2. OAuth 2.0 Client ID 선택
3. **Authorized redirect URIs**에 추가:
   - `https://your-frontend-domain.com/authorize`

## 완료!

배포된 Frontend URL로 접속하여 테스트하세요.

