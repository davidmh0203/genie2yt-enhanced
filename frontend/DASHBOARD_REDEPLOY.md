# Cloudflare Dashboard에서 재배포 방법

wrangler CLI로 배포가 안 되는 경우, Dashboard에서 재배포하세요.

## 방법 1: 기존 배포 재시도

1. **Cloudflare Dashboard 접속**
   - https://dash.cloudflare.com

2. **Pages 프로젝트로 이동**
   - Workers & Pages → Pages 탭
   - `late-salad-cc7d` 프로젝트 클릭

3. **Deployments 탭**
   - 상단 메뉴에서 "Deployments" 클릭

4. **재배포**
   - 최신 배포 항목의 오른쪽 "..." 메뉴 클릭
   - "Retry deployment" 선택

## 방법 2: 새로 업로드

1. **Pages 프로젝트로 이동**
   - Workers & Pages → Pages → `late-salad-cc7d`

2. **Upload assets**
   - "Deployments" 탭 → "Upload assets" 버튼
   - `frontend/dist` 폴더의 모든 파일 선택
   - 업로드

## 환경 변수 설정

Dashboard에서 재배포한 경우, `wrangler.toml`의 환경 변수가 자동으로 적용되지 않을 수 있습니다.

**환경 변수는 Settings에서 별도로 설정해야 합니다:**

1. **Settings → Environment variables**
2. Production 환경에 다음 변수 추가:
   ```
   VITE_GOOGLE_CLIENT_ID = 750983910255-2nmrqt977h2mejhrrcene1ijovva1t5s.apps.googleusercontent.com
   VITE_CLOUDFLARE_WORKER_BASE_URL = https://genie2yt-worker.davidmh0203.workers.dev
   ```
3. **Save and redeploy**

## 참고

- `wrangler.toml` 파일은 Git 연동을 통해 배포할 때 자동으로 인식됩니다
- 수동 업로드의 경우, 환경 변수는 Dashboard에서 별도 설정이 필요합니다

