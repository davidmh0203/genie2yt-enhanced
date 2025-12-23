# 로컬 개발 환경 설정

## 로컬 D1 데이터베이스 마이그레이션

로컬 개발 서버를 실행하기 전에 로컬 D1 데이터베이스에 스키마를 적용해야 합니다.

### 마이그레이션 실행

```bash
cd worker
npm run db:migrate:local
```

또는 직접 실행:

```bash
cd worker
npx wrangler d1 execute genie2yt-db --local --file=../database/schema.sql
```

### 확인

마이그레이션이 성공하면 다음과 같은 메시지가 표시됩니다:
```
🌀 Executing on local database genie2yt-db...
✅ Successfully applied migration
```

### 문제 해결

#### `convert_log_items` 테이블이 없다는 에러
- 로컬 마이그레이션이 실행되지 않았을 수 있습니다
- 위의 마이그레이션 명령어를 실행하세요

#### 마이그레이션 후에도 에러가 발생하는 경우
- 로컬 개발 서버를 재시작하세요 (`npm run dev`)
- `.wrangler` 폴더를 삭제하고 다시 시도하세요

