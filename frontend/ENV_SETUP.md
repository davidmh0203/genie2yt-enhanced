# 환경 변수 설정 가이드 (wrangler.toml 방법)

## wrangler.toml 파일 설정

`frontend/wrangler.toml` 파일에 환경 변수가 설정되어 있습니다.

### 환경 변수 수정

1. `frontend/wrangler.toml` 파일 열기
2. `VITE_GOOGLE_CLIENT_ID` 값을 실제 Google Client ID로 변경:

```toml
[env.production]
vars = { 
  VITE_GOOGLE_CLIENT_ID = "실제_Google_Client_ID_입력",
  VITE_CLOUDFLARE_WORKER_BASE_URL = "https://genie2yt-worker.davidmh0203.workers.dev"
}
```

### Google Client ID 확인 방법

1. Google Cloud Console 접속: https://console.cloud.google.com
2. APIs & Services → Credentials
3. OAuth 2.0 Client ID에서 Client ID 복사

### 배포 방법

#### 옵션 1: wrangler CLI 사용

```bash
cd frontend
npx wrangler pages deploy dist --project-name=late-salad-cc7d
```

#### 옵션 2: Cloudflare Dashboard에서 재배포

1. Cloudflare Dashboard → Pages → late-salad-cc7d
2. Deployments 탭
3. 최신 배포의 "..." 메뉴 → "Retry deployment"

### 주의사항

- `wrangler.toml` 파일의 환경 변수는 빌드 시점에 주입됩니다
- Cloudflare Pages에서도 이 파일을 인식할 수 있습니다
- 변경 후 재배포가 필요합니다

