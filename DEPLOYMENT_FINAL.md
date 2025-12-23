# 배포 완료 확인 및 최종 설정

## ✅ 배포 완료

### 1. Worker 배포
- **URL**: `https://genie2yt-worker.davidmh0203.workers.dev`
- **상태**: ✅ 배포 완료

### 2. Frontend 배포
- **URL**: (배포된 URL을 여기에 기록하세요)
- **상태**: ✅ 배포 완료

## 🔧 필수 설정 확인

### 1. Frontend 환경 변수 확인

Cloudflare Pages Dashboard에서 다음 환경 변수가 설정되어 있는지 확인:

```
VITE_GOOGLE_CLIENT_ID = (Google OAuth Client ID)
VITE_CLOUDFLARE_WORKER_BASE_URL = https://genie2yt-worker.davidmh0203.workers.dev
```

**설정 방법:**
1. Cloudflare Dashboard → Pages → genie2yt-frontend 프로젝트
2. Settings → Environment variables
3. Production 환경에 위 변수들 추가
4. Save and redeploy 클릭

### 2. Google OAuth 리디렉션 URI 설정

**필수 설정:**

1. Google Cloud Console 접속: https://console.cloud.google.com
2. APIs & Services → Credentials
3. OAuth 2.0 Client ID 선택
4. "Authorized redirect URIs"에 다음 추가:
   ```
   https://your-frontend-domain.pages.dev/authorize
   http://localhost:5173/authorize  (로컬 개발용)
   ```
5. Save 클릭

### 3. Worker Secrets 설정 (선택사항)

YouTube API Key가 필요한 경우:

```bash
cd worker
npx wrangler secret put YOUTUBE_API_KEY
```

## 🧪 배포 확인 테스트

### 1. Worker 헬스 체크

```bash
curl https://genie2yt-worker.davidmh0203.workers.dev/health
```

예상 응답:
```json
{"status":"ok","timestamp":"2025-12-23T..."}
```

### 2. Frontend 접속 테스트

1. 배포된 Frontend URL 접속
2. 페이지가 정상적으로 로드되는지 확인
3. Google 로그인 버튼이 표시되는지 확인

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

## 📝 배포 정보 기록

### Frontend URL
```
https://________________.pages.dev
```

### Worker URL
```
https://genie2yt-worker.davidmh0203.workers.dev
```

### Google OAuth Client ID
```
________________
```

## ⚠️ 문제 해결

### CORS 에러
- Worker의 CORS 미들웨어 확인
- Frontend URL이 올바른지 확인

### 환경 변수 에러
- Frontend 환경 변수가 `VITE_`로 시작하는지 확인
- 재배포가 필요한지 확인

### OAuth 에러
- Google Cloud Console에서 리디렉션 URI 확인
- Client ID가 올바른지 확인

### API 연결 에러
- Worker URL이 올바른지 확인
- Worker가 정상 작동하는지 헬스 체크

## 🎉 배포 완료!

모든 설정이 완료되면 서비스를 사용할 수 있습니다!

