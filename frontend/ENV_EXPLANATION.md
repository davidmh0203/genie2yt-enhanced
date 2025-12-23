# 환경 변수 설명

## Frontend 환경 변수

### VITE_GOOGLE_CLIENT_ID
- **용도**: Google OAuth 2.0 인증에 사용
- **필수**: ✅ 예
- **설명**: Google Cloud Console에서 발급받은 OAuth 2.0 Client ID

### VITE_CLOUDFLARE_WORKER_BASE_URL
- **용도**: Frontend에서 Worker API를 호출할 때 사용
- **필수**: ✅ 예
- **설명**: 배포된 Worker의 URL

## 사용하지 않는 변수

### GOOGLE_CLIENT_SECRET
- **사용 여부**: ❌ Frontend에서 사용하지 않음
- **이유**: 
  - 현재 프로젝트는 OAuth 2.0 **Implicit Grant Flow**를 사용
  - Implicit Grant Flow는 Client Secret이 필요 없음 (브라우저에서 실행되므로 보안상 노출되면 안 됨)
  - Client Secret은 서버 사이드에서만 사용 (Authorization Code Flow)

## 참고

만약 나중에 Authorization Code Flow로 변경한다면:
- Client Secret은 **Worker (서버)**에서만 사용
- Frontend에는 절대 노출하면 안 됨
- Worker의 Secrets로 설정해야 함: `npx wrangler secret put GOOGLE_CLIENT_SECRET`

