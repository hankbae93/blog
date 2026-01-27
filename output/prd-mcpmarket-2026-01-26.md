# PRD: MCP Market

**MCP 서버/플러그인 마켓플레이스**

---

## 1. 개요

### 1.1 문제 정의

Anthropic이 2024년 말 **Model Context Protocol (MCP)**를 발표하면서 AI 에이전트 생태계의 새로운 표준이 등장했다. 개발자들이 MCP 서버를 만들고 사용하는데 다음 문제를 겪고 있다:

**핵심 문제:**
- **발견의 어려움**: "MCP 서버 어디서 찾지? GitHub 뒤져야 함"
- **설치의 마찰**: "설치 방법이 프로젝트마다 달라서 귀찮음"
- **배포 채널 부재**: "내가 만든 MCP 서버 어디에 올리지?"
- **품질 검증 없음**: "이 MCP 서버 안전한지 어떻게 알지?"

**방치된 이유:**
- MCP가 2024년 말 발표된 신기술
- 아직 생태계 초기 단계
- Anthropic이 공식 마켓을 만들지 않음 (현재까지)

### 1.2 솔루션

**MCP Market**은 MCP 생태계를 위한 마켓플레이스:
1. MCP 서버 **등록 및 검색**
2. **원클릭 설치** 스크립트 제공
3. 사용자 **리뷰/평점**으로 품질 검증
4. **카테고리별** 탐색 (DB, API, 도구 등)

### 1.3 성공 지표 (MVP 기준)

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| 등록된 MCP 서버 | 100개 | 플랫폼 데이터 |
| 월간 방문자 | 5,000명 | Google Analytics |
| 설치 스크립트 사용 | 1,000회/월 | 다운로드 카운트 |
| 리뷰 작성 | 200개 | 사용자 제출 |

---

## 2. 타겟 사용자

### 2.1 Primary Persona: 박개발 (32세, 백엔드 개발자)

**배경:**
- 스타트업 시니어 개발자
- Claude Code, Cursor 등 AI 도구 적극 사용
- 최신 기술 트렌드에 민감

**Pain Points:**
- "MCP 서버 좋다는데, 쓸만한 거 찾기가 힘듦"
- "awesome-mcp 리스트 보는데 설명이 부실함"
- "설치했더니 안 됨. 버전 문제인 것 같은데..."

**행동 패턴:**
- 새 도구 나오면 바로 테스트
- GitHub Stars로 품질 판단
- 커뮤니티 추천 중시

### 2.2 Secondary Persona: 김빌더 (28세, MCP 서버 개발자)

**배경:**
- 사이드 프로젝트로 MCP 서버 개발
- Notion + GitHub 연동 MCP 만듦
- 오픈소스 기여 경험

**Pain Points:**
- "만들었는데 홍보할 곳이 없음"
- "GitHub에 올려도 아무도 안 봄"
- "피드백 받고 싶은데 채널이 없음"

### 2.3 사용 시나리오

**시나리오 1: MCP 서버 찾기**
1. "Slack 연동 MCP" 검색
2. MCP Market에서 3개 결과 확인
3. 리뷰/평점 비교
4. "원클릭 설치" 버튼 클릭
5. 터미널에 붙여넣기 → 완료

**시나리오 2: MCP 서버 등록**
1. GitHub 로그인
2. "새 MCP 서버 등록"
3. GitHub URL 입력
4. 자동으로 README, 설치법 추출
5. 카테고리, 태그 지정
6. 리뷰 대기 후 공개

---

## 3. 기능 요구사항

### 3.1 MVP 기능 (v1.0)

#### F1. MCP 서버 검색/탐색
**설명:** MCP 서버 검색 및 카테고리 탐색
- 키워드 검색
- 카테고리 필터 (Database, API, Tools, IDE, etc.)
- 정렬 (인기순, 최신순, 평점순)

**수용 기준:**
- [ ] 검색 응답 < 500ms
- [ ] 10개 이상 카테고리
- [ ] 결과 페이지네이션

#### F2. MCP 서버 상세 페이지
**설명:** 각 MCP 서버의 상세 정보 표시
- README 렌더링
- 설치 방법
- GitHub 통계 (Stars, Issues, Last Update)
- 사용자 리뷰/평점

**수용 기준:**
- [ ] GitHub API 연동
- [ ] Markdown 렌더링
- [ ] 평점 평균 계산

#### F3. 원클릭 설치 스크립트
**설명:** 복사-붙여넣기로 설치 가능한 스크립트 생성
- npx/pip/brew 등 패키지 매니저 지원
- Claude Desktop config 자동 추가 옵션
- 환경별 스크립트 (macOS, Linux, Windows)

**수용 기준:**
- [ ] 3가지 이상 설치 방법 지원
- [ ] 스크립트 복사 버튼
- [ ] 설치 가이드 문서 연결

#### F4. MCP 서버 등록
**설명:** 개발자가 MCP 서버 등록
- GitHub OAuth 로그인
- GitHub URL로 자동 정보 추출
- 카테고리/태그 선택
- 관리자 승인 후 공개

**수용 기준:**
- [ ] GitHub URL 유효성 검증
- [ ] README 자동 파싱
- [ ] 중복 등록 방지

### 3.2 향후 기능 (v2.0+)

| 우선순위 | 기능 | 설명 |
|---------|------|------|
| High | 버전 관리 | 버전별 설치 스크립트 |
| High | 호환성 배지 | Claude/Cursor 호환 표시 |
| Medium | 통계 대시보드 | 개발자용 설치 통계 |
| Medium | 의존성 그래프 | MCP 서버 간 의존 관계 |
| Low | CLI 도구 | `mcp install <name>` |

### 3.3 명시적 제외 범위

- **MCP 서버 호스팅**: 직접 호스팅은 제공 안 함
- **결제 시스템**: MVP에서는 무료만
- **자동 테스트**: 보안 검증은 수동 리뷰

---

## 4. 기술 요구사항

### 4.1 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                          │
│               (Next.js + Vercel)                     │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│                 API Routes                           │
│              (Next.js API)                           │
├─────────────────────┬───────────────────────────────┤
│                     │                                │
│  ┌──────────────────▼──────────────────┐            │
│  │          GitHub API                  │            │
│  │     (Repo info, README)              │            │
│  └──────────────────────────────────────┘            │
│                     │                                │
│  ┌──────────────────▼──────────────────┐            │
│  │         PostgreSQL                   │            │
│  │        (Supabase)                    │            │
│  │   MCP Servers / Users / Reviews      │            │
│  └──────────────────────────────────────┘            │
│                     │                                │
│  ┌──────────────────▼──────────────────┐            │
│  │       Search Index                   │            │
│  │       (Algolia Free)                 │            │
│  └──────────────────────────────────────┘            │
└─────────────────────────────────────────────────────┘
```

### 4.2 기술 스택

| 영역 | 기술 | 선택 이유 |
|------|------|----------|
| Frontend | Next.js 14 + App Router | SSR, SEO |
| Styling | TailwindCSS + shadcn/ui | 빠른 개발 |
| Backend | Next.js API Routes | 풀스택 통합 |
| Database | Supabase (PostgreSQL) | Auth 내장, 무료 티어 |
| Search | Algolia | 빠른 검색, 무료 티어 |
| Auth | GitHub OAuth | 타겟 사용자에 적합 |
| Hosting | Vercel | 배포 자동화 |

### 4.3 데이터 모델

```sql
-- MCP 서버
mcp_servers (
  id UUID PRIMARY KEY,
  name VARCHAR,
  description TEXT,
  github_url VARCHAR UNIQUE,
  github_stars INTEGER,
  github_updated_at TIMESTAMP,
  readme_content TEXT,
  install_commands JSONB,  -- {npm: "...", pip: "..."}
  category VARCHAR,
  tags VARCHAR[],
  author_id UUID REFERENCES users,
  status VARCHAR,  -- pending, approved, rejected
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- 사용자
users (
  id UUID PRIMARY KEY,
  github_id VARCHAR UNIQUE,
  github_username VARCHAR,
  created_at TIMESTAMP
)

-- 리뷰
reviews (
  id UUID PRIMARY KEY,
  server_id UUID REFERENCES mcp_servers,
  user_id UUID REFERENCES users,
  rating INTEGER,  -- 1-5
  content TEXT,
  created_at TIMESTAMP
)

-- 설치 로그
install_logs (
  id UUID PRIMARY KEY,
  server_id UUID REFERENCES mcp_servers,
  install_method VARCHAR,
  created_at TIMESTAMP
)
```

---

## 5. 비즈니스 요구사항

### 5.1 수익 모델

**Phase 1: 무료 (Month 1-6)**
- 모든 기능 무료
- 커뮤니티 성장 우선

**Phase 2: 프리미엄 (Month 7+)**
| 티어 | 가격 | 기능 |
|------|------|------|
| Free | 무료 | 등록 3개, 기본 통계 |
| Pro | $5/월 | 무제한 등록, 상세 통계, 배지 |
| Sponsor | $20/월 | 홈페이지 노출, 배너 광고 |

**대안 수익원:**
- AI 도구 회사 스폰서십 (Anthropic, Cursor, etc.)
- 프리미엄 MCP 서버 중개 수수료

### 5.2 시장 분석

**MCP 생태계 현황 (2026.01):**
- GitHub MCP 관련 저장소: 약 500개
- awesome-mcp-servers: 200+ 등록
- 일일 MCP 관련 검색: 추정 10,000+

**성장 예측:**
- AI 에이전트 도구 사용 증가
- Claude Code, Cursor 등 MCP 지원 확대
- 기업용 MCP 수요 증가

### 5.3 GTM 전략

**Phase 1: 시드 콘텐츠 (Week 1-2)**
- awesome-mcp-servers 목록 전량 등록
- GitHub 트렌딩 MCP 프로젝트 초대

**Phase 2: 개발자 커뮤니티 (Month 1-2)**
- Hacker News "Show HN" 포스트
- Reddit r/ClaudeAI, r/MachineLearning
- Twitter/X AI 개발자 인플루언서

**Phase 3: 공식 연계 (Month 3+)**
- Anthropic Developer Relations 접촉
- Claude Desktop 공식 문서 링크 요청

---

## 6. 마일스톤

| Week | 목표 | 산출물 |
|------|------|--------|
| 1 | DB 설계 + GitHub API | Supabase 스키마, API 연동 |
| 2 | 검색 + 목록 UI | 홈페이지, 검색 결과 |
| 3 | 상세 페이지 + 설치 | MCP 서버 페이지, 스크립트 |
| 4 | 등록 + 리뷰 | 등록 폼, 리뷰 시스템 |
| 5 | 시드 데이터 + 테스트 | 100개 MCP 등록 |
| 6 | 출시 + 홍보 | HN 포스트, 소셜 미디어 |

---

## 7. 리스크

| 리스크 | 영향 | 완화 방안 |
|--------|------|----------|
| **Anthropic 공식 마켓** | 경쟁력 상실 | 커뮤니티/독립 개발자 포지셔닝, 빠른 선점 |
| 악성 MCP 서버 등록 | 보안 이슈, 신뢰 하락 | 수동 리뷰, 커뮤니티 신고 |
| MCP 표준 변경 | 호환성 문제 | 버전별 설치 스크립트 |
| 낮은 트래픽 | 수익 불가 | SEO 집중, 콘텐츠 마케팅 |

### 7.1 플랫폼 리스크 대응 전략

**만약 Anthropic이 공식 마켓을 만든다면:**

1. **차별화 포인트 강화**
   - 커뮤니티 중심 (리뷰, 토론)
   - 독립 개발자 지원 (통계, 배지)
   - 크로스 플랫폼 (Claude 외 Cursor, Windsurf 등)

2. **피벗 옵션**
   - MCP 개발 튜토리얼/문서 사이트
   - MCP 서버 개발 서비스 (B2B)
   - 공식 마켓의 서드파티 도구

---

## 8. 부록

### 8.1 경쟁 환경

| 서비스 | 장점 | 단점 | 우리의 차별점 |
|--------|------|------|--------------|
| awesome-mcp | 방대한 목록 | 검색 불가, 정적 | 검색, 리뷰, 설치 스크립트 |
| GitHub | 소스 접근 | 발견 어려움 | 큐레이션, 카테고리 |
| npm/pypi | 패키지 관리 | MCP 특화 아님 | MCP 전용 메타데이터 |

### 8.2 페르소나 검증 결과

**전제 파괴:** ⚠️
- "MCP 서버는 직접 설치해야 한다" → 마켓에서 원클릭
- 단, 이게 큰 문제인지는 검증 필요

**방치된 이유:** ✅
- MCP가 신기술이라 생태계 부재. 타이밍 논리 명확

**비합리적 행동:** ✅
- 개발자들이 GitHub 뒤지며 MCP 서버 찾고, 수동 설정

**기능-가설 연결:** ✅
- 등록/검색/원클릭 설치는 "발견과 설치의 마찰" 가설과 직결

**진정성 검증 필요:**
- "MCP 생태계가 Anthropic 주도로 공식 마켓이 생기면?"
- → 대응: 선점 효과 + 커뮤니티 차별화 + 피벗 옵션 준비

### 8.3 MCP 카테고리 초안

| 카테고리 | 예시 |
|----------|------|
| Database | PostgreSQL, MongoDB, SQLite |
| API Integration | Slack, Discord, GitHub |
| File System | Local Files, Cloud Storage |
| Web | Browser, Web Scraping |
| IDE | VS Code, IntelliJ |
| AI/ML | Embeddings, Vector DB |
| Utilities | Time, Math, Crypto |
| Custom | Domain-specific |

---

*PRD Version: 1.0*
*Created: 2026-01-26*
*Author: PRD Agent*

⚠️ **플랫폼 리스크 경고:** 이 아이디어는 Anthropic의 공식 마켓 출시 가능성으로 인해 리스크가 있습니다. 빠른 실행과 커뮤니티 차별화가 핵심입니다.
