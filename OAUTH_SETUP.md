# Google OAuth 설정 가이드

## 배포된 URL 정보

- **Frontend URL**: `https://late-salad-cc7d.davidmh0203.workers.dev`
- **Worker URL**: `https://genie2yt-worker.davidmh0203.workers.dev`

## Google OAuth 리디렉션 URI 설정

### 1단계: Google Cloud Console 접속

1. https://console.cloud.google.com 접속
2. Google 계정으로 로그인

### 2단계: 프로젝트 선택

- 상단의 프로젝트 선택 드롭다운에서 프로젝트 선택
- (프로젝트가 없으면 "New Project"로 생성)

### 3단계: Credentials 메뉴로 이동

1. 왼쪽 메뉴에서 **APIs & Services** 클릭
2. **Credentials** 클릭

### 4단계: OAuth 2.0 Client ID 찾기/생성

#### 기존 Client ID가 있는 경우:
- OAuth 2.0 Client IDs 섹션에서 Client ID 클릭

#### Client ID가 없는 경우:
1. 상단의 **+ CREATE CREDENTIALS** 클릭
2. **OAuth client ID** 선택
3. Application type: **Web application** 선택
4. Name: 원하는 이름 입력 (예: "Genie2YT")
5. **CREATE** 클릭

### 5단계: 리디렉션 URI 추가

OAuth client 설정 페이지에서:

1. **Authorized redirect URIs** 섹션 찾기
2. **+ ADD URI** 버튼 클릭
3. 다음 URI 입력:
   ```
   https://late-salad-cc7d.davidmh0203.workers.dev/authorize
   ```
4. **+ ADD URI** 버튼을 다시 클릭하여 로컬 개발용도 추가 (선택사항):
   ```
   http://localhost:5173/authorize
   ```

### 6단계: 저장

- 페이지 하단의 **SAVE** 버튼 클릭
- 변경사항이 저장됩니다

### 7단계: Client ID 확인

- **Client ID** 값을 복사하여 저장
- 이 값이 `VITE_GOOGLE_CLIENT_ID` 환경 변수에 사용됩니다

## Frontend 환경 변수 설정

### Cloudflare Pages에서 설정:

1. **Cloudflare Dashboard 접속**
   - https://dash.cloudflare.com

2. **Pages 프로젝트 선택**
   - Workers & Pages → `late-salad-cc7d` 프로젝트 클릭

3. **Settings 메뉴**
   - 상단 메뉴에서 **Settings** 클릭

4. **Environment variables**
   - 왼쪽 메뉴에서 **Environment variables** 클릭

5. **변수 추가**
   - **Add variable** 버튼 클릭
   - 다음 변수들을 Production 환경에 추가:
   
     **변수 1:**
     - Key: `VITE_GOOGLE_CLIENT_ID`
     - Value: (위에서 복사한 Google Client ID)
   
     **변수 2:**
     - Key: `VITE_CLOUDFLARE_WORKER_BASE_URL`
     - Value: `https://genie2yt-worker.davidmh0203.workers.dev`

6. **저장 및 재배포**
   - **Save** 클릭
   - **Save and redeploy** 클릭 (중요!)

## 설정 확인

### 1. OAuth 리디렉션 URI 확인
- Google Cloud Console에서 리디렉션 URI가 정확히 입력되었는지 확인
- URL 끝에 `/authorize`가 포함되어 있는지 확인

### 2. 환경 변수 확인
- Cloudflare Pages에서 환경 변수가 Production 환경에 설정되었는지 확인
- 재배포가 완료되었는지 확인

### 3. 테스트
1. Frontend URL 접속: https://late-salad-cc7d.davidmh0203.workers.dev
2. Google 로그인 버튼 클릭
3. OAuth 인증이 정상적으로 진행되는지 확인

## 문제 해결

### "redirect_uri_mismatch" 에러
- Google Cloud Console에서 리디렉션 URI가 정확히 일치하는지 확인
- URL에 `https://` 또는 `http://`가 포함되어 있는지 확인
- 마지막에 `/authorize`가 포함되어 있는지 확인

### "Invalid client" 에러
- Client ID가 올바른지 확인
- 환경 변수에 올바르게 설정되었는지 확인

### 로그인 후 리디렉션 실패
- 리디렉션 URI가 정확히 일치하는지 확인
- Frontend URL이 올바른지 확인

