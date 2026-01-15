# 1. 개요

### 목적 및 필요성

 유튜브뮤직의 점유율이 점점 상승하여 2025년 기준 국내시장 1위를 차지하고 있으며, 저 또한 지니뮤직에서 유튜브뮤직으로 넘어가게 되면서 버려지는 지니뮤직의 플레이리스트가 아까웠습니다.  열심히 모아서 내 취향을 담은 플레이리스트를 다른 음악앱에서도 사용할수 있게 해보자 라는 목적으로 이 서비스를 제작하게 되었습니다.

 다만, 유사 서비스를 조사했을때, 이미 이러한 기능을 제공하는 서비스들이 존재했지만, 외국의 음악앱에 대한 지원만 있었고, 국내 음악앱에 대한 지원은 없었습니다. 국내 애플리케이션 중에서도, 플레이스토어에 존재하긴하지만 실제 설치해서 사용해보니 작동되지 않고, 업데이트도 이미 오래전에 멈춘 앱만 존재했습니다. 이에 국내 뮤직앱들에 대한 서비스가 필요하겠다는 필요성을 느끼게 되었습니다.

 그래서  우선, 한국의 지니뮤직의 플레이리스트 URL을 입력받아, 해당하는 곡 영상을 YouTube에서 검색하여 유튜브 재생목록을 만들어주는 서비스를 프로토타입으로 제작하게 되었습니다. 

 이번년도 초반에 이미 필요성을 인식해서 기능을 개발해보았지만, 매우 단순한 로직과 기능만을 담았어서 아쉬움이 남았었는데  이번에 배운 소프트웨어공학 원리를 통해 다양한 로직들을 통해 더욱 정확한 매칭을 통해 플레이리스트를 만들고, 요구사항을 명확히 하여 소프트웨어품질을 향상시키고자 하였습니다.

- 배포 사이트: https://davidmh.store/

# 본론

## 2. 요구사항

### 2.1 기능적 요구사항

### FR-01: Google OAuth 인증

- Google 계정으로 로그인
- OAuth 2.0으로 YouTube API 접근 권한 획득
- 토큰 갱신 및 관리

### FR-02: 재생목록 URL 입력 및 파싱

- 지니뮤직 재생목록 URL 입력
- HTML 파싱으로 곡 정보 추출 (제목, 아티스트, 앨범)
- JSON 데이터 우선 추출, 실패 시 HTML 폴백

### FR-03: YouTube 검색 및 매칭

- 곡 정보로 YouTube 검색
- 다중 검색 쿼리 변형 생성
- 매칭 알고리즘으로 최적 비디오 선택

### FR-04: 재생목록 생성 및 추가

- YouTube 재생목록 생성
- 매칭된 곡을 순서대로 추가
- 실패한 곡은 건너뛰고 계속 진행

### FR-05: 변환 이력 관리

- 변환 로그 저장 (성공/실패 개수, 처리 시간)
- 개별 곡 매칭 결과 저장
- 사용자별 이력 조회

### FR-06: 캐싱 기능

- 재생목록 파싱 결과 캐시 (1시간)
- YouTube 검색 결과 캐시 (24시간)
- API 호출 최소화

### 2.2 비기능적 요구사항

### NFR-01: 성능

- 재생목록 파싱: 5초 이내
- 곡 매칭: 곡당 평균 1초 이내
- 전체 변환: 50곡 기준 1분 이내

### NFR-02: 신뢰성

- 매칭 정확도: 80% 이상
- 에러 발생 시 부분 성공 허용
- 상세 로그 저장

### NFR-03: 확장성

- 모듈화된 구조로 다른 플랫폼 추가 용이
- 매칭 전략 확장 가능
- 서버리스 아키텍처로 자동 스케일링

### NFR-04: 보안

- HTTPS 통신
- OAuth 토큰 암호화 저장
- 사용자 데이터 분리 관리

## 3. 구현

### 3.1 시스템 아키텍처

**아키텍쳐 및 시퀀스 다이어그램**

- **HCI Layer**: React 기반 사용자 인터페이스
- **PD Layer**: 비즈니스 로직 (파서, 변환기, 매칭 엔진)
- **DM Layer**: 데이터 접근 (Repository 패턴)

![아키텍쳐](attachment:4b2c1deb-8233-43dc-b376-2a472fc18ab9:image.png)

아키텍쳐

 **3계층 원리**를 적용하여,  서버 클라이언트 구조로 설계하였습니다. 브라우저에서는 사용자로부터 URL 입력을 받고, 서버로부터 전환이 완료된 유튜브 재생목록 링크를 받아서 사용자에게 보여주게 됩니다. 또한 성공/실패 로그와 실패 요인들을 함께보여주게 됩니다. 또한, Google OAuth를 통해 구글 로그인 기능을 사용하고, 사용자의 구글 계정 정보를 통해 YouTube 계정에 접근하게 됩니다. 서버에서는 CORS를 이용해 프론트에서의 크롤링 방지를 우회하여 지니뮤직 플레이리스트를 파싱하고, 유튜브 API를 이용해 그 플레이리스트 속 각 곡들을 검색하게 됩니다. 이렇게 사용자정보, 사용자의 플레이리스트 변환 기록등을 SQL DB에 저장하고, 이미  video ID를 찾은 곡들은 추후 다시 YouTube API의 토큰을 사용해서 다시 검색하지 않도록하여 토큰을 절약할 수 있도록 Key Value 형식의 DB에 저장해둡니다.

![시퀀스 다이어그램](attachment:ee484c37-dfe9-41fb-9156-f429de3e5c77:image.png)

시퀀스 다이어그램

 지니뮤직에서 플레이리스트 목록을 파싱하는 로직이 프론트엔드에서 실행되는 경우 막히는 **문제가 있어서** 해결법을 찾아보니 superbase Edge function을 이용하면 크롤링 로직을 적용할 수 있다고하여 적용하게 되었습니다. 우선  superbase Edge function에서도 문제가 생길수 있으니 해당 부분을 모듈로 따로 분리하고, 프록시 패턴으로 구현하여, 다시 **문제가 생겨도 모듈을 변경하여 문제를 바로 해결할 수 있도록 조정하였습니다.** 

 이후 superbase를 이용하여 구현중 무료 할당량을 모두 소진하여 크롤링이 **불가능해지는 문제가** 있었습니다. superbase의 대안을 찾아보니 **cloudflare의 workers가** 있다는 것을 확인하였고, 이를 적용해보았습니다. cloudflare의 worker는 무료플랜에서도 일일 요청건수 1만건와 빠른 속도를 제공하는 가성비 좋은 서비스라는것을 확인하였고, 서버리스이기 때문에 따로 관리할 부분이 적다는점, cloudflare에서 제공하는 SQL DB인 D1 DB와, Key Value 형식의 DB인 KV DB 또한 무료로 사용할 수 있어서 cloudflare의  제공 기능들을 활용하여 개발하였습니다.  서버는 cloudflare의 workers만 지원하는 서버는 Hono라는 서버 뿐이라서 이를 적용하였습니다.  

 이렇게 cloudflare의 worker로 로직을 수정하는 등 크롤링 문제가 생겼을때 대안 모듈을 가져와서 사용하니  수정해야할 부분이 많지 않았고, 손쉽게 개발을 이어나갈수 있었습니다. 특히 프록시 패턴을 통해 크롤링 모듈을 프록시 인터페이스 뒤에 두어, 백엔드 실행 환경을 Supabase Edge에서 Cloudflare Worker로 교체해도 호출부 코드는 변경이 최소화되었습니다. **소프트웨어공학 속 개념이 힘을 발하던 순간이었습니다.**

### 3.2 핵심 기능 구현

### 3.2.1 재생목록 파싱 (GenieParser)

```jsx
// JSON 데이터 우선 추출
const jsonPatterns = [
/var\s+PLIST_SONG_DATA\s*=\s*(\[.*?\]);/s,
/var\s+SONG_DATA\s*=\s*(\[.*?\]);/s,
// ...
];

// HTML 폴백 파싱
const rowPatterns = [
/<tr[^>]*>(.*?)<\/tr>/gis,
/<li[^>]*class="[^"]list[^"]"[^>]*>(.*?)<\/li>/gis
];
```

**특징**:

- JSON 우선, HTML 폴백
- 정규식으로 곡 정보 추출
- HTML 엔티티 디코딩

### 3.2.2 매칭 엔진 (MatchingEngine)

**전략 패턴 적용**: 3가지 매칭 전략을 가중치와 함께 조합

1. **TitleExactMatch** (가중치: 1.0)
    - 완전 일치: 1.0
    - 제목 포함 + 아티스트 포함: 0.95
    - 제목 포함: 0.8
2. **KoreanNormalizeMatch** (가중치: 0.9)
    - 한국어 정규화 (소문자, 공백 제거, NFD 정규화)
    - 완전 일치: 1.0
    - 제목 포함 + 아티스트 포함: 0.95
    - 제목 포함: 0.85
    - 유사도 계산: 공통 문자 비율
3. **FuzzyMatch** (가중치: 0.7)
    - Levenshtein Distance 기반 유사도 계산
    - 정규화: 소문자, 특수문자 제거
    - 아티스트 포함 시 보너스 (+0.2)

**매칭 프로세스**:

```jsx
// 각 후보에 대해 모든 전략으로 점수 계산
for (const candidate of candidates) {
for (const { name, strategy, weight } of this.strategies) {
const score = strategy.match(song, candidate) * weight;
if (score > bestScore) {
bestScore = score;
bestMatch = candidate;
bestStrategy = name;
}
// 높은 점수면 조기 종료
if (score >= 0.95) return result;
}
}
// 임계값 0.4 이상이면 매칭 성공
if (bestScore >= 0.4 && bestMatch) return result;

```

### 3.2.3 검색 쿼리 생성
다양한 검색 쿼리 변형 생성으로 매칭률 향상:

- 기본: "제목 아티스트"
- 아티스트 먼저: "아티스트 제목"
- 괄호 제거: "(Inst.)", "(Feat. ...)" 등 제거
- 영어 이름 추출: 한글명에서 영어명 추출
- Inst. 제거: 기악곡 검색 최적화

### 3.2.4 캐싱 전략

- **재생목록 캐시**: URL → ParsedSong[] (TTL: 1시간)
- **검색 결과 캐시**: 쿼리 → {videoId, title} (TTL: 24시간)
- Cloudflare KV 사용

## **3.3 데이터베이스 설계**

![Playlist Conversion Flow-2025-12-23-151157.png](attachment:ff574dcc-c411-4f76-b91e-2dce5ba356cb:Playlist_Conversion_Flow-2025-12-23-151157.png)

### 3.3.1 스키마

- **users**: 사용자 정보 및 OAuth 토큰
- **convert_logs**: 변환 이력
- **convert_log_items**: 개별 곡 매칭 결과
- **api_logs**: API 호출 로그

### 3.3.2 인덱스

- user_id, created_at, log_id 등에 인덱스 생성

## **3.4 API 엔드포인트**

- POST /api/parse-genie: 재생목록 파싱
- POST /api/search-youtube: YouTube 검색
- POST /api/convert: 전체 변환 프로세스
- GET /api/logs: 변환 이력 조회
- GET /api/logs/:logId/items: 개별 곡 결과 조회

## **4. 소프트웨어공학 원리 적용**

**4.1 모듈화 (Modularity)**

**적용 사례**

- 크롤링 로직을 GenieParser로 분리
- 매칭 로직을 MatchingEngine과 전략 클래스로 분리
- 데이터 접근을 Repository 패턴으로 분리

**효과**

- Supabase → Cloudflare Workers 전환 시 호출부 변경 최소화
- 유지보수성 향상

**4.2 설계 패턴**

**4.2.1 전략 패턴 (Strategy Pattern)**

**적용**: 매칭 알고리즘

```jsx
interface MatchStrategy {

match(*song*: ParsedSong, *video*: YouTubeVideo): number;

}

class MatchingEngine {

private strategies: { name: string; strategy: MatchStrategy; weight: number }[];

*// ...*

}
```

**효과**

- 새로운 매칭 전략 추가 용이
- 각 전략 독립 테스트 가능
- 가중치 조정으로 정확도 튜닝

**4.2.2 프록시 패턴 (Proxy Pattern)**

**적용**: 크롤링 모듈 분리

**배경**

- 프론트엔드 크롤링 → CORS 차단
- Supabase Edge Function → 할당량 소진
- Cloudflare Workers로 최종 이전

**구현**

- 크롤링 로직을 인터페이스 뒤에 배치
- 백엔드 환경 변경 시 구현체만 교체

**효과**

- 환경 변경 시 호출부 코드 변경 최소화
- 대안 모듈 교체 용이

**4.2.3 Repository 패턴**

**적용**: 데이터 접근 계층

```jsx
class ConvertLogRepository {

async create(*data*): Promise<ConvertLog> { }

async findByUserId(*userId*): Promise<ConvertLog[]> { }

}
```

**효과**

- 데이터베이스 변경 시 Repository만 수정
- 비즈니스 로직과 데이터 접근 분리

**4.3 관심사의 분리 (Separation of Concerns)**

- **HCI Layer**: UI 렌더링 및 사용자 입력 처리
- **PD Layer**: 비즈니스 로직 (파싱, 매칭, 변환)
- **DM Layer**: 데이터 영속성

**4.4 의존성 역전 원칙 (Dependency Inversion Principle)**

**적용**

- PlaylistConverter는 MatchStrategy 인터페이스에 의존
- 구체적인 전략 클래스는 런타임에 주입

**효과**

- 높은 수준 모듈이 낮은 수준 모듈에 의존하지 않음
- 확장성 향상

**4.5 단일 책임 원칙 (Single Responsibility Principle)**

- GenieParser: 파싱만 담당
- MatchingEngine: 매칭만 담당
- YouTubeAdapter: YouTube API 호출만 담당
- PlaylistConverter: 전체 흐름 제어

**4.6 개방-폐쇄 원칙 (Open-Closed Principle)**

**적용**

- 새로운 매칭 전략 추가 시 기존 코드 수정 없이 확장
- 전략 패턴으로 구현

**4.7 에러 처리 및 로깅**

- 모든 API 호출 로그 저장
- 변환 실패 시 부분 성공 허용
- 상세 에러 메시지 저장

# 결론

### **6.1 프로젝트 성과**

지니뮤직 → YouTube Music 자동 변환 기능을 구현한 서비스를 배포까지 완료하게 되었습니다.

소프트웨어공학 원리를 적용하여 모듈화된 구조로 유지보수성 확보하였고, 서버리스 아키텍처로 비용 효율적 운영 할 수 있었습니다.

### **6.2 소프트웨어공학 원리 적용 효과**

모듈화를 사용하여 Supabase에서 Cloudflare Workers로 전환 시 수정 범위 최소화할 수 있었습니다.

 **단순히 True/Flase로만 곡을 검색하는 것이 아닌**  **전략 패턴을 사용하여** 매칭 알고리즘 확장으로 매칭 정확도를 높일 수 있었습니다.

**프록시 패턴**: 크롤링 환경 변경 대응 용이

지속적인 사용자 피드백을 적용하여  사용자를 더욱 더 담으면서, 사용자 요구사항 정의와 분석을 통해 모호하던 기존의 로직과 기능들을 명확하게 하고 사용성, 기능, 매칭 정확도 조정 등 프로젝트의 품질이 향상하게 되었습니다.

### **6.3 향후 개선 사항**

1. 매칭 알고리즘 정확도 향상
2. "Too many subrequests" 문제 해결 (검색 최적화)
3. 실패한 곡 재매칭 기능
4. 다른 플랫폼 지원 확대 (멜론, 벅스 등)
5. 지역 제한 영상 처리 방안 수립
요구사항 분석 및 , 설계패턴 적용등 제품 품질을 한층 발전시키기 위하여 소프트웨어 공학 원리를 적용하여 발전시킨 프로젝트입니다.

