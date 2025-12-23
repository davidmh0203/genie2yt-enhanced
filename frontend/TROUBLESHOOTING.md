# 문제 해결 가이드

## 환경 변수 확인 방법

### 브라우저 콘솔에서 확인

1. 배포된 사이트 접속: `https://late-salad-cc7d.davidmh0203.workers.dev`
2. 개발자 도구 열기 (F12)
3. Console 탭에서 다음 코드 실행:

```javascript
console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
console.log('Worker URL:', import.meta.env.VITE_CLOUDFLARE_WORKER_BASE_URL);
```

### 예상 결과

정상적으로 설정되었다면:
- `VITE_GOOGLE_CLIENT_ID`: `750983910255-2nmrqt977h2mejhrrcene1ijovva1t5s.apps.googleusercontent.com`
- `VITE_CLOUDFLARE_WORKER_BASE_URL`: `https://genie2yt-worker.davidmh0203.workers.dev`

### 문제가 있다면

- `undefined`가 나오면: 환경 변수가 빌드에 포함되지 않음
- 빈 문자열이 나오면: 환경 변수 값이 비어있음

## 일반적인 문제들

### 1. Google 로그인 버튼 클릭 시 에러

**에러: "redirect_uri_mismatch"**
- Google Cloud Console에서 리디렉션 URI 확인
- `https://late-salad-cc7d.davidmh0203.workers.dev/authorize`가 추가되어 있는지 확인

**에러: "Invalid client"**
- Google Client ID가 올바른지 확인
- 브라우저 콘솔에서 `import.meta.env.VITE_GOOGLE_CLIENT_ID` 값 확인

### 2. API 호출 실패

**CORS 에러**
- Worker의 CORS 설정 확인
- Worker URL이 올바른지 확인

**404 에러**
- Worker URL 확인: `https://genie2yt-worker.davidmh0203.workers.dev`
- 브라우저 콘솔에서 `import.meta.env.VITE_CLOUDFLARE_WORKER_BASE_URL` 값 확인

### 3. 환경 변수가 undefined

**해결 방법:**
1. `npm run build:prod`로 다시 빌드
2. 새로운 `dist` 폴더 업로드
3. 브라우저 캐시 삭제 후 다시 시도

## 디버깅 체크리스트

- [ ] 브라우저 콘솔에서 환경 변수 값 확인
- [ ] Google OAuth 리디렉션 URI 설정 확인
- [ ] Worker 헬스 체크: `curl https://genie2yt-worker.davidmh0203.workers.dev/health`
- [ ] 브라우저 캐시 삭제
- [ ] Network 탭에서 API 호출 확인

