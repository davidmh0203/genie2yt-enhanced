# 전체 배포 완료 가이드

## ✅ 배포 완료

### 1. Worker 배포 완료
- **URL**: `https://genie2yt-worker.davidmh0203.workers.dev`
- **상태**: ✅ 배포 완료 및 정상 작동
- **데이터베이스**: D1 (genie2yt-db) - 마이그레이션 완료
- **KV 네임스페이스**: CACHE - 연결 완료

### 2. Frontend 배포 완료
- **URL**: `https://late-salad-cc7d.davidmh0203.workers.dev`
- **상태**: ✅ 배포 완료
- **빌드 결과물**: `frontend/dist/` 폴더

## 🔧 필수 설정

### 1. Frontend 환경 변수 설정

Cloudflare Pages Dashboard에서 설정:

1. **Cloudflare Dashboard 접속**
   - https://dash.cloudflare.com
   - Workers & Pages → `late-salad-cc7d` 프로젝트 선택

2. **환경 변수 설정**
   - Settings → Environment variables
   - Production 환경에 다음 변수 추가:
     ```
     VITE_GOOGLE_CLIENT_ID = (Google OAuth Client ID)
     VITE_CLOUDFLARE_WORKER_BASE_URL = https://genie2yt-worker.davidmh0203.workers.dev
     ```
   - **Save and redeploy** 클릭 (중요!)

### 2. Google OAuth 리디렉션 URI 설정

**단계별 가이드:**

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com

2. **프로젝트 선택**
   - 상단에서 프로젝트 선택

3. **Credentials 메뉴로 이동**
   - 왼쪽 메뉴: **APIs & Services** → **Credentials**

4. **OAuth 2.0 Client ID 선택**
   - OAuth 2.0 Client IDs 섹션에서 Client ID 클릭
   - (없으면 "Create Credentials" → "OAuth client ID" 생성)

5. **리디렉션 URI 추가**
   - "Authorized redirect URIs" 섹션에서 **+ ADD URI** 클릭
   - 다음 URI 추가:
     ```
     https://late-salad-cc7d.davidmh0203.workers.dev/authorize
     ```
   - 로컬 개발용도 추가하려면:
     ```
     http://localhost:5173/authorize
     ```

6. **저장**
   - 하단의 **SAVE** 버튼 클릭

### 3. Worker Secrets 설정 (선택사항)

YouTube API Key가 필요한 경우:

```bash
cd worker
npx wrangler secret put YOUTUBE_API_KEY
```

## 🧪 배포 확인

### 1. Worker 헬스 체크

```bash
curl https://genie2yt-worker.davidmh0203.workers.dev/health
```

예상 응답:
```json
{"status":"ok","timestamp":"2025-12-23T..."}
```

### 2. Frontend 접속 테스트

1. **Frontend URL 접속**
   - https://late-salad-cc7d.davidmh0203.workers.dev

2. **확인 사항**
   - 페이지가 정상적으로 로드되는지
   - "Genie2YT Enhanced" 제목이 보이는지
   - Google 로그인 버튼이 표시되는지

### 3. 전체 기능 테스트

1. **로그인 테스트**
   - Google 로그인 버튼 클릭
   - OAuth 인증 완료
   - 사용자 프로필 표시 확인

2. **플레이리스트 파싱 테스트**
   - 지니뮤직 URL 입력
   - 파싱 버튼 클릭
   - 곡 목록이 표시되는지 확인

3. **변환 테스트**
   - 플레이리스트 제목 입력
   - 재생목록 만들기 버튼 클릭
   - 변환 진행 상황 확인
   - YouTube 플레이리스트 생성 확인

4. **이력 확인 테스트**
   - 이력 탭 클릭
   - 변환 이력 목록 확인
   - 상세 내역 다이얼로그 확인

## 📝 배포 정보

### Frontend URL
```
https://late-salad-cc7d.davidmh0203.workers.dev
```

### Worker URL
```
https://genie2yt-worker.davidmh0203.workers.dev
```

### OAuth 리디렉션 URI
```
https://late-salad-cc7d.davidmh0203.workers.dev/authorize
```

## ⚠️ 문제 해결

### CORS 에러
- Worker의 CORS 미들웨어 확인
- Frontend URL이 올바른지 확인

### 환경 변수 에러
- Frontend 환경 변수가 `VITE_`로 시작하는지 확인
- 재배포가 필요한지 확인 (Save and redeploy 필수!)

### OAuth 에러
- Google Cloud Console에서 리디렉션 URI 확인
- Client ID가 올바른지 확인
- 리디렉션 URI에 정확한 URL이 입력되었는지 확인

### API 연결 에러
- Worker URL이 올바른지 확인
- Worker가 정상 작동하는지 헬스 체크

## 🎉 배포 완료!

모든 설정이 완료되면 서비스를 사용할 수 있습니다!
