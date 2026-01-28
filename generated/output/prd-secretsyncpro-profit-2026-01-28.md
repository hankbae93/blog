# PRD: SecretSync Pro

> 소규모 팀이 API 키와 환경변수를 HashiCorp Vault의 복잡함 없이 안전하게 공유하는 $29/월 SaaS

**문서 정보**
- 작성일: 2026-01-28
- 버전: 1.0
- 상태: Draft
- 트랙: Profit

---

## 1. 개요 (Overview)

### 1.1 문제 정의 (Problem Statement)
- **누가** 겪는 문제인가?
  - 5-20명 규모 스타트업의 Tech Lead, CTO, 개발팀
  - DevOps 전담 인력이 없는 소규모 기술 팀
  - 원격 근무 환경에서 협업하는 개발자들

- **무엇이** 문제인가?
  - API 키, 데이터베이스 비밀번호 등 민감한 정보를 Slack, 이메일로 공유하며 보안 위험 노출
  - HashiCorp Vault는 설정이 복잡하고 자체 호스팅이 필요해 소규모 팀에 부담
  - Doppler 같은 대안은 연 $7,000 이상으로 스타트업 예산에 맞지 않음
  - .env 파일이 git에 커밋되거나, 팀원 간 동기화되지 않는 문제 빈발

- **왜** 문제인가? (비용/임팩트)
  - SoundCloud 데이터 유출 사례처럼 시크릿 노출 시 회사 존망 위협
  - 시크릿 관련 보안 사고 평균 복구 비용: $4.35M (IBM 2025 보고서)
  - 개발자가 시크릿 관리에 주당 2-3시간 낭비 (연간 $5,000-10,000 인건비 손실)
  - AI 에이전트(Cursor, Claude Code)가 .env 파일에 접근하면서 새로운 보안 우려 발생

### 1.2 솔루션 요약 (Solution Summary)
- **핵심 가치 제안:** 5분 설정, $29/월로 팀 전체의 시크릿을 안전하게 동기화하는 가장 쉬운 방법

### 1.3 성공 지표 (Success Metrics)
| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| 첫 수익 (Time to First Revenue) | 14일 내 | Stripe 결제 기록 |
| 월간 반복 매출 (MRR) | $2,900 (6개월) | Stripe MRR 대시보드 |
| 유료 전환율 | 15% | 무료 체험 -> 유료 전환 비율 |
| 고객 이탈률 (Churn) | < 3%/월 | 월간 해지 비율 |
| Net Promoter Score (NPS) | > 50 | 분기별 사용자 설문 |

---

## 2. 타겟 사용자 (Target Users)

### 2.1 주요 페르소나

**페르소나 1: 민수 - 스타트업 Tech Lead**
- **직업/역할:** Series A 스타트업의 Tech Lead, 8명 개발팀 관리
- **인구통계:** 32세, 서울 거주, 연봉 8,000만원
- **기술 수준:** 시니어 개발자, 인프라 경험은 제한적
- **주요 고충점:**
  - 신규 개발자 온보딩 시 .env 파일 전달이 번거로움
  - Slack DM으로 API 키 공유 후 삭제하는 것이 습관화
  - AWS/GCP 시크릿 매니저는 클라우드 종속이 걱정됨
- **현재 대안:** 1Password Teams + Notion에 수동 문서화
- **기존 지출:** 1Password Teams $36/월 + 시크릿 관리 시간 월 4시간

**페르소나 2: 지영 - 초기 스타트업 CTO**
- **직업/역할:** Pre-seed 스타트업 CTO, 3명 공동창업팀
- **인구통계:** 28세, 원격근무, 다중 프로젝트 운영
- **기술 수준:** 풀스택 개발자, DevOps 미경험
- **주요 고충점:**
  - Vault 설정에 이틀 투자했지만 결국 포기
  - 프리랜서 개발자에게 시크릿 공유가 불안
  - 개인 .env 파일이 로컬 머신에만 있어 백업 불안
- **현재 대안:** .env.example + Slack DM 공유
- **기존 지출:** 없음 (시간 비용만 발생)

### 2.2 사용자 시나리오

> **시나리오 1:** "민수는 새 백엔드 개발자 합류 시, SecretSync CLI 설치 명령어 하나만 공유하면 모든 환경변수가 자동 동기화되어 온보딩 시간이 2시간에서 5분으로 단축된다."

> **시나리오 2:** "지영은 외주 프론트엔드 개발자에게 'Read Only' 권한으로 필요한 API 키만 제한적으로 공유하고, 계약 종료 시 원클릭으로 접근 권한을 회수한다."

> **시나리오 3:** "AWS 키가 GitHub에 실수로 푸시되었을 때, SecretSync의 자동 감지 알림을 받고 즉시 키를 로테이션하여 보안 사고를 예방한다."

---

## 3. 기능 요구사항 (Functional Requirements)

### 3.1 MVP 필수 기능 (Must Have)

#### F1: 웹 UI 시크릿 관리
- **설명:** 직관적인 웹 인터페이스에서 시크릿을 프로젝트별, 환경별(dev/staging/prod)로 분리 관리
- **사용자 스토리:** As a Tech Lead, I want to organize secrets by project and environment, so that I can prevent accidental use of production keys in development.
- **수용 기준:**
  - [ ] 프로젝트 생성/수정/삭제 기능
  - [ ] 환경(dev/staging/prod) 분리 지원
  - [ ] 시크릿 키-값 쌍 추가/수정/삭제
  - [ ] 시크릿 값 마스킹 처리 (클릭 시 표시)
  - [ ] 시크릿 변경 이력 조회 (최근 30일)

#### F2: CLI 동기화 도구
- **설명:** 명령줄에서 `secretsync pull` 한 번으로 로컬 .env 파일을 자동 생성/업데이트
- **사용자 스토리:** As a developer, I want to sync secrets with one command, so that I can start coding immediately without manual configuration.
- **수용 기준:**
  - [ ] `secretsync login` - 인증 (API 토큰 기반)
  - [ ] `secretsync pull [project] [env]` - .env 파일 생성
  - [ ] `secretsync push` - 로컬 .env를 서버에 업로드
  - [ ] `.secretsyncrc` 설정 파일로 기본 프로젝트/환경 지정
  - [ ] CI/CD 환경에서 환경변수로 직접 주입 지원

#### F3: 팀원 권한 관리
- **설명:** 팀원을 이메일로 초대하고, 프로젝트별로 세분화된 접근 권한 부여
- **사용자 스토리:** As a CTO, I want to control who can access which secrets, so that I can maintain security while enabling collaboration.
- **수용 기준:**
  - [ ] 이메일 초대 및 수락 플로우
  - [ ] 권한 레벨: Admin (전체) / Write (읽기+쓰기) / Read (읽기만)
  - [ ] 프로젝트별 권한 설정
  - [ ] 즉시 접근 권한 회수 기능
  - [ ] 활동 로그 (누가 언제 어떤 시크릿에 접근했는지)

### 3.2 향후 기능 (Nice to Have)
- **GitGuardian 연동:** 코드 저장소에서 시크릿 노출 감지 및 알림
- **시크릿 자동 로테이션:** AWS/GCP 키 주기적 자동 갱신
- **Slack 알림:** 시크릿 변경 시 팀 채널에 알림
- **VS Code 확장:** IDE 내에서 시크릿 조회/관리
- **SOC 2 준수 리포트:** 엔터프라이즈 고객용 컴플라이언스 문서

### 3.3 명시적 제외 (Out of Scope)
- 자체 호스팅 옵션 (SaaS 전용으로 시작)
- 비개발자용 비밀번호 관리 기능 (1Password 영역)
- 모바일 앱
- 엔터프라이즈 SSO/SAML (v2에서 고려)

---

## 4. 기술 요구사항 (Technical Requirements)

### 4.1 시스템 아키텍처
```
[Web UI] -----> [API Server] -----> [PostgreSQL]
                    |                    |
                    v                    v
[CLI Tool] <-----[Auth]           [Encrypted Storage]
                    |
                    v
              [Redis Cache]
```

- **암호화:** AES-256-GCM으로 시크릿 저장 (서버에서도 평문 접근 불가)
- **키 관리:** AWS KMS 또는 자체 HSM 키 래핑
- **전송 보안:** TLS 1.3 필수

### 4.2 기술 스택
| 레이어 | 기술 | 선택 이유 |
|--------|------|-----------|
| Frontend | Next.js 14 + Tailwind CSS | 빠른 개발, SEO, 서버 컴포넌트 |
| Backend API | Node.js + Hono | 경량, 빠른 개발, Edge 배포 가능 |
| Database | Supabase (PostgreSQL) | 인증 내장, 빠른 설정, Row-Level Security |
| CLI | Go | 단일 바이너리 배포, 크로스 플랫폼 |
| 암호화 | libsodium (Go), Web Crypto API (JS) | 검증된 암호화 라이브러리 |
| 호스팅 | Vercel (Web) + Railway (API) | 빠른 배포, 자동 스케일링 |
| 캐싱 | Upstash Redis | 서버리스 Redis, 저비용 |

### 4.3 외부 의존성
- **Supabase:** 인증 및 데이터베이스 ($25/월 Pro 플랜)
- **Vercel:** 웹 호스팅 (Pro $20/월)
- **Railway:** API 서버 ($5/월 시작)
- **Resend:** 트랜잭션 이메일 ($20/월)
- **Stripe:** 결제 처리 (2.9% + $0.30)

---

## 5. 비즈니스 요구사항 (Business Requirements)

### 5.1 수익 모델
| 플랜 | 가격 | 포함 기능 |
|------|------|-----------|
| Free | $0/월 | 1 프로젝트, 2명, 50 시크릿, 커뮤니티 지원 |
| Starter | $29/월 | 3 프로젝트, 5명, 500 시크릿, 이메일 지원 |
| Team | $49/월 | 10 프로젝트, 20명, 2,000 시크릿, 활동 로그 |
| Pro | $99/월 | 무제한 프로젝트, 50명, 10,000 시크릿, 우선 지원 |

**가격 책정 근거:**
- Doppler: $240/월 (10명 기준) vs SecretSync: $49/월 = 80% 저렴
- 1Password Teams: $7.99/사용자/월 (10명 = $80) vs SecretSync: $49/월 (팀 단위) = 39% 저렴
- 타겟 시장의 월 SaaS 예산: $100-500 (Startup 평균)

### 5.2 단위 경제 (Unit Economics)
- **CAC (Customer Acquisition Cost):** $50
  - 콘텐츠 마케팅 (블로그, "SoundCloud 유출 교훈" 시리즈): $20
  - Product Hunt 런칭 비용: $0 (시간만 투자)
  - 개발자 커뮤니티 광고 (Reddit, HN): $30

- **LTV (Lifetime Value):** $696
  - 평균 구독 기간: 24개월 (시크릿 저장소는 이탈 어려움)
  - 평균 월 결제: $29 (Starter 플랜 기준)
  - LTV = $29 x 24 = $696

- **LTV/CAC Ratio:** 13.9x (목표 > 3x, 매우 건강함)

- **Payback Period:** 1.7개월
  - CAC $50 / ARPU $29 = 1.7개월

- **Gross Margin:** 85%
  - 월 매출 $29 - 인프라 비용 ~$4 = $25 마진

### 5.3 시장 분석
- **TAM (Total Addressable Market):** $2.1B
  - 글로벌 시크릿 관리 시장 (2026년 예상)

- **SAM (Serviceable Addressable Market):** $210M
  - 5-50명 규모 스타트업/SMB 시장 (TAM의 10%)

- **SOM (Serviceable Obtainable Market):** $2.1M
  - 첫 2년 목표: SAM의 1% 점유

- **경쟁사:**
  | 경쟁사 | 강점 | 약점 | 가격 |
  |--------|------|------|------|
  | HashiCorp Vault | 기능 풍부, 엔터프라이즈 검증 | 복잡한 설정, 자체 호스팅 | 무료 (호스팅 비용 별도) |
  | Doppler | 개발자 친화적, 좋은 DX | 비싼 가격 | $240/월 (10명) |
  | AWS Secrets Manager | AWS 통합, 안정적 | 클라우드 종속, 복잡한 IAM | $0.40/시크릿/월 |
  | 1Password Teams | 친숙한 UX, 범용성 | 개발자 워크플로우 미최적화 | $80/월 (10명) |

- **차별화 포인트:**
  1. **가격:** Doppler의 1/5, 1Password Teams의 60%
  2. **설정 용이성:** 5분 온보딩 vs Vault 2일
  3. **개발자 중심:** CLI 우선, .env 네이티브 지원
  4. **팀 단위 가격:** 인당 과금 아닌 팀 단위 정액제

### 5.4 Go-to-Market 전략

**초기 사용자 확보 방법:**
1. **콘텐츠 마케팅 (Week 1-2)**
   - "SoundCloud 데이터 유출: 당신의 팀은 안전한가?" 블로그 포스트
   - "HashiCorp Vault 없이 시크릿 관리하기" 튜토리얼
   - Hacker News / Reddit r/devops 공유

2. **Product Hunt 런칭 (Week 3)**
   - "Show HN" 포스트 동시 진행
   - 런칭 당일 무료 Pro 플랜 1개월 제공

3. **개발자 커뮤니티 (Week 4+)**
   - Dev.to, Hashnode 기술 블로그 연재
   - 오픈소스 프로젝트에 무료 플랜 제공

**마케팅 채널:**
| 채널 | 예상 CAC | 우선순위 |
|------|----------|----------|
| Organic (SEO/콘텐츠) | $20 | 높음 |
| Product Hunt | $0 | 높음 |
| Reddit r/devops, r/startups | $40 | 중간 |
| Twitter/X 개발자 인플루언서 | $60 | 중간 |
| LinkedIn 광고 | $100 | 낮음 (후순위) |

---

## 6. 마일스톤 (Milestones)

### Phase 1: MVP (Week 1-2)
- [ ] 웹 UI 기본 기능 (프로젝트/환경/시크릿 CRUD)
- [ ] CLI 도구 v0.1 (login, pull, push)
- [ ] Supabase 인증 연동
- [ ] 기본 암호화 구현 (AES-256-GCM)
- [ ] **First revenue target: $87 (3 Starter 플랜)**

### Phase 2: Launch (Week 3-4)
- [ ] Product Hunt 런칭
- [ ] 팀 초대 및 권한 관리 기능
- [ ] Stripe 결제 연동
- [ ] 활동 로그 기능
- [ ] **MRR target: $580 (20 Starter 플랜)**

### Phase 3: Growth (Week 5-8)
- [ ] Team/Pro 플랜 기능 완성
- [ ] CLI v1.0 (CI/CD 연동)
- [ ] 블로그 콘텐츠 10개 발행
- [ ] **MRR target: $1,450 (50 혼합 플랜)**

### Phase 4: Scale (Month 3-6)
- [ ] GitGuardian 연동
- [ ] VS Code 확장
- [ ] SOC 2 Type 1 준비
- [ ] **MRR target: $2,900 (100 팀)**

---

## 7. 리스크 및 의존성 (Risks & Dependencies)

| 리스크 | 영향도 | 발생 확률 | 대응 방안 |
|--------|--------|-----------|-----------|
| 보안 취약점 발견 | 치명적 | 중간 | 출시 전 보안 감사, 버그 바운티 프로그램 |
| Doppler 가격 인하 | 높음 | 낮음 | 니치 집중 (5-20명), 추가 기능 차별화 |
| 느린 유료 전환 | 높음 | 중간 | 무료 플랜 제한 강화, 14일 체험판 모델 |
| CLI 크로스 플랫폼 이슈 | 중간 | 중간 | Go로 개발, CI/CD 멀티 플랫폼 테스트 |
| Supabase 의존성 | 중간 | 낮음 | 추상화 레이어로 마이그레이션 가능하게 |

**주요 의존성:**
- Supabase 가용성 (99.9% SLA)
- Stripe 결제 API
- Vercel/Railway 호스팅 안정성

---

## 부록 A: 경쟁사 상세 비교

| 기능 | SecretSync Pro | Doppler | Vault | 1Password |
|------|---------------|---------|-------|-----------|
| 가격 (10명) | $49/월 | $240/월 | 무료+호스팅 | $80/월 |
| 설정 시간 | 5분 | 30분 | 2일 | 15분 |
| CLI 지원 | O | O | O | O |
| .env 직접 생성 | O | O | X | X |
| 웹 UI | O | O | O | O |
| 활동 로그 | O (Team+) | O | O | O |
| SOC 2 | 준비중 | O | O | O |

## 부록 B: 첫 30일 세부 로드맵

**Week 1:**
- Day 1-2: Next.js 프로젝트 셋업, Supabase 스키마 설계
- Day 3-4: 인증 플로우, 프로젝트 CRUD
- Day 5-7: 시크릿 암호화/복호화 로직

**Week 2:**
- Day 8-10: CLI 도구 (Go) - login, pull 명령
- Day 11-12: 웹 UI 완성 (Tailwind)
- Day 13-14: 내부 테스트, 버그 수정

**Week 3:**
- Day 15-17: Stripe 결제 연동
- Day 18-19: 랜딩 페이지 완성
- Day 20-21: Product Hunt 준비, 스크린샷, GIF

**Week 4:**
- Day 22: Product Hunt 런칭
- Day 23-28: 피드백 대응, 핫픽스
- Day 29-30: 첫 유료 고객 온보딩, MRR 목표 달성 확인
