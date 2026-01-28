---
title: "PRD: AgentCodeQA"
description: "> AI가 생성한 코드의 버그율, 보안 취약점, 기술 부채를 자동 분석하여 \"Vibecoding 품질 지수\"를 제공하는 B2B SaaS"
keywords: "PRD, 기획서, 요구사항, MVP, AgentCodeQA"
date: "2026-01-28"
---

# PRD: AgentCodeQA

> AI가 생성한 코드의 버그율, 보안 취약점, 기술 부채를 자동 분석하여 "Vibecoding 품질 지수"를 제공하는 B2B SaaS

**문서 정보**
- 작성일: 2026-01-28
- 버전: 1.0
- 상태: Draft
- 트랙: Profit

---

## 1. 개요 (Overview)

### 1.1 문제 정의 (Problem Statement)

- **누가** 겪는 문제인가?
  - 10-50명 규모 개발팀의 Engineering Manager, Tech Lead
  - AI 코딩 도구(Cursor, Copilot, Claude Code)를 팀 전체에 도입한 CTO
  - AI 생성 코드의 품질을 관리해야 하는 시니어 개발자

- **무엇이** 문제인가?
  - Karpathy가 80% Agentic Coding으로 전환했다고 선언한 후, 많은 팀이 AI 코딩을 도입
  - 하지만 AI 생성 코드는 기존 정적 분석 도구(SonarQube, ESLint)가 제대로 잡지 못하는 패턴의 버그와 취약점을 포함
  - "Vibecoding" 2년 후 수동 코딩으로 복귀하는 사례가 나타나기 시작 - AI 코드의 기술 부채가 원인
  - AI가 생성한 코드 vs 수동 작성 코드의 품질 차이를 객관적으로 측정하는 도구가 없음
  - Cursor, Copilot, Claude Code 각각의 코드 품질을 비교 분석할 방법이 없음

- **왜** 문제인가? (비용/임팩트)
  - **품질 리스크**: AI 코드는 "동작"하지만, 엣지케이스 처리, 에러 핸들링, 보안 측면에서 취약한 경우가 많음
  - **기술 부채 폭발**: 빠르게 생성된 AI 코드가 6개월-1년 후 유지보수 비용 3-5배 증가로 이어짐
  - **보안 위협**: AI는 오래된 라이브러리, 취약한 패턴을 학습 데이터에서 가져올 수 있음 (CVE 미반영)
  - **책임 소재 불명**: AI가 만든 버그인지, 수동 코드의 버그인지 구분 불가
  - **도구 선택 근거 없음**: Cursor vs Copilot 중 어떤 도구가 팀에 더 적합한지 데이터 없음

### 1.2 솔루션 요약 (Solution Summary)

- **핵심 가치 제안:** AI 코딩 도구별로 생성된 코드를 자동 식별하고, "Vibecoding 품질 지수"로 버그율, 보안 취약점, 기술 부채를 분석하여 Engineering Manager에게 주간 품질 리포트를 제공한다.

### 1.3 성공 지표 (Success Metrics)

| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| 첫 수익 (Time to First Revenue) | 30일 내 | Stripe 결제 기록 |
| 월간 반복 매출 (MRR) | $5,000 (6개월) | Stripe MRR 대시보드 |
| 유료 팀 수 | 50개 팀 (6개월) | 유료 구독 팀 수 |
| 평균 계약 가치 (ACV) | $150/팀/월 | 유료 팀당 평균 결제액 |
| 유료 전환율 | 15% | 무료 체험 -> 유료 전환 비율 |
| 고객 이탈률 (Churn) | < 5%/월 | 월간 해지 비율 |
| NPS (Net Promoter Score) | 50+ | 분기별 NPS 설문 |

---

## 2. 타겟 사용자 (Target Users)

### 2.1 주요 페르소나

**페르소나 1: 민수 - 성장 스타트업 Engineering Manager**
- **직업/역할:** 25명 개발팀 관리, 코드 품질 및 개발 프로세스 책임
- **인구통계:** 38세, 시리즈 B 핀테크 스타트업, 연봉 1.2억원
- **기술 수준:** 전 시니어 개발자, 현재는 아키텍처 리뷰 및 팀 관리 위주
- **주요 고충점:**
  - 팀원들이 Cursor, Copilot을 적극 사용하는데, PR 리뷰 시 "이거 AI가 만든 거죠?"라고 물으면 대답을 못함
  - 지난 분기 프로덕션 버그 3건 중 2건이 AI 생성 코드에서 발생 (추정)
  - SonarQube를 쓰고 있지만, AI 코드 특유의 문제(과도한 추상화, 불필요한 패턴)를 잡지 못함
  - 팀에서 Cursor vs Copilot 논쟁이 있는데, 어떤 도구가 더 좋은지 판단할 근거가 없음
- **현재 대안:** PR 리뷰 시 직감에 의존, 주니어 코드를 더 꼼꼼히 보려고 노력
- **기존 지출:** GitHub Copilot Business $38/user x 15명 + Cursor $20/user x 10명 = $770/월

**페르소나 2: 지현 - 시리즈 A 스타트업 Tech Lead**
- **직업/역할:** 12명 백엔드 팀 기술 리드, 아키텍처 설계 및 코드 리뷰 담당
- **인구통계:** 33세, 서울 소재 B2B SaaS 스타트업
- **기술 수준:** 시니어 개발자, 코딩 80% + 관리 20%
- **주요 고충점:**
  - 본인도 Claude Code를 많이 쓰는데, 생성된 코드에서 간헐적으로 보안 취약점이 발견됨
  - 주니어 개발자들이 AI 코드를 이해 없이 복붙하는 패턴이 늘어남
  - 기술 부채가 빠르게 쌓이고 있는 느낌인데, 정량화할 방법이 없음
  - 보안팀에서 "AI 생성 코드 가이드라인"을 요청했는데, 작성할 근거 데이터가 없음
- **현재 대안:** GitHub Copilot의 "I don't accept this" 버튼 사용, 정기 보안 점검 의뢰
- **기존 지출:** Claude Code $100/user x 5명 = $500/월

**페르소나 3: 재혁 - 중견 스타트업 VP Engineering**
- **직업/역할:** 45명 엔지니어링 조직 총괄, 기술 전략 및 예산 관리
- **인구통계:** 44세, 시리즈 C 이커머스 스타트업, 연봉 2.5억원
- **기술 수준:** 전 개발자, 현재는 전략 및 관리에 집중
- **주요 고충점:**
  - AI 코딩 도구에 월 $3,000 이상 지출하는데, 품질 영향 데이터가 없음
  - 이사회에서 "AI 도구가 버그를 늘리지 않나?"라는 질문에 답변 불가
  - 보안 감사에서 AI 생성 코드에 대한 별도 검토 요구 예상
  - 경쟁사들도 AI 코딩 도입했다는데, 우리 팀이 제대로 하고 있는지 벤치마크 어려움
- **현재 대안:** 분기별 외부 보안 감사 ($10k+), 개발자 직감에 의존한 추정
- **기존 지출:** 다양한 AI 도구 믹스 $3,200/월

### 2.2 사용 시나리오

> **시나리오 1:** "민수는 금요일 오후, AgentCodeQA 주간 리포트를 확인한다. '이번 주 AI 생성 코드 중 12개 함수가 잠재적 보안 취약점 포함'이라는 알림을 보고, 해당 PR들을 다시 리뷰한다. 3건은 실제 취약점이었고, 주말 배포 전에 수정 완료."

> **시나리오 2:** "지현은 팀의 'Vibecoding 품질 지수'가 지난달 72점에서 이번 달 65점으로 하락한 것을 확인한다. 분석 결과, 주니어 A의 Cursor 사용 코드에서 기술 부채 점수가 높았다. 1:1 미팅에서 코드 리뷰 강화를 논의한다."

> **시나리오 3:** "재혁은 이사회 자료에 AgentCodeQA의 '분기별 AI 코드 품질 트렌드' 차트를 포함한다. 'AI 도구 도입 후 버그율이 초기 +15% 증가했으나, 가이드라인 도입 후 -8%로 개선되었습니다'라고 보고한다."

> **시나리오 4:** "민수는 팀에서 Cursor vs Copilot 논쟁이 있어, AgentCodeQA의 A/B 비교 기능을 사용한다. 3개월 데이터 분석 결과, Copilot 코드의 버그율이 15% 낮았지만, Cursor 코드의 개발 속도가 20% 빨랐다. 데이터를 기반으로 '프로토타이핑은 Cursor, 프로덕션은 Copilot' 가이드라인을 수립한다."

---

## 3. 기능 요구사항 (Functional Requirements)

### 3.1 MVP 핵심 기능 (Must Have)

#### F1: AI 코드 자동 식별 및 분류
- **설명:** Cursor, Copilot, Claude Code 등 AI 도구가 생성한 코드를 커밋/PR/파일 단위로 자동 식별
- **사용자 스토리:** As an Engineering Manager, I want to automatically identify which code was AI-generated, so that I can focus quality reviews on those areas.
- **수용 기준:**
  - [ ] GitHub/GitLab 연동으로 레포지토리 자동 스캔
  - [ ] AI 생성 코드 식별 정확도 85% 이상
  - [ ] 파일별, 함수별 AI 생성 비율 표시
  - [ ] Cursor, Copilot, Claude Code 각각 구분 (IDE 플러그인 연동 시)
  - [ ] 오탐지 수동 보정 기능 ("이건 AI 아님" 표시)

#### F2: Vibecoding 품질 지수 대시보드
- **설명:** AI 생성 코드의 버그율, 보안 취약점, 기술 부채를 종합한 "Vibecoding 품질 지수" 제공
- **사용자 스토리:** As a Tech Lead, I want to see a quality score for AI-generated code, so that I can quickly assess whether our AI coding practices are healthy.
- **수용 기준:**
  - [ ] Vibecoding 품질 지수 0-100점 (높을수록 좋음)
  - [ ] 지수 구성 요소 투명 공개: 버그율 (30%), 보안 취약점 (40%), 기술 부채 (30%)
  - [ ] 시간별 추이 그래프 (일/주/월)
  - [ ] AI 도구별 품질 비교 (Cursor vs Copilot vs Claude Code)
  - [ ] 팀원별 AI 코드 품질 분포 (익명화 옵션 제공)

#### F3: 주간 품질 리포트 및 알림
- **설명:** 매주 자동으로 AI 코드 품질 요약 리포트를 생성하여 이메일/Slack으로 발송
- **사용자 스토리:** As an Engineering Manager, I want to receive weekly reports on AI code quality, so that I can stay informed without manually checking dashboards.
- **수용 기준:**
  - [ ] 주간 AI 코드 품질 요약 (점수 변화, 주요 이슈)
  - [ ] Top 5 문제 파일/함수 하이라이트
  - [ ] 이전 주 대비 개선/악화 지표
  - [ ] 권장 조치 사항 ("이 PR은 추가 리뷰 권장")
  - [ ] 이메일, Slack, Microsoft Teams 발송 지원
  - [ ] PDF 다운로드 (이사회 보고용)

### 3.2 향후 기능 (Nice to Have)
- **PR 코멘트 봇**: PR 생성 시 AI 코드 품질 분석 결과를 자동 코멘트
- **IDE 플러그인**: VS Code/JetBrains에서 실시간 품질 경고
- **보안 취약점 상세 분석**: CVE 매핑, OWASP Top 10 체크
- **팀 벤치마크**: 익명화된 업계 평균과 비교
- **AI 코드 가이드라인 생성**: 팀 데이터 기반 자동 가이드라인 추천
- **Jira/Linear 연동**: 발견된 이슈를 자동 백로그 생성

### 3.3 명시적 제외 (Out of Scope)
- **코드 생성 기능**: 기존 AI 코딩 도구와 경쟁하지 않음. 분석만.
- **일반 코드 품질 분석**: SonarQube 대체 아님. AI 코드에 특화.
- **실시간 차단**: AI 코드 커밋을 막는 게이트키퍼 역할 안 함
- **개발자 성과 평가**: 팀 수준 분석만, 개인 평가 도구로 사용 불가
- **On-premise 설치**: 클라우드 SaaS만 제공 (Enterprise도)

---

## 4. 기술 요구사항 (Technical Requirements)

### 4.1 시스템 아키텍처

```
+-------------------+     +-------------------+     +-------------------+
|   Git Repository  |     |   AgentCodeQA     |     |    Dashboard      |
| (GitHub/GitLab)   |---->|     Core          |---->|    (Web App)      |
+-------------------+     |                   |     +-------------------+
                          |  +-------------+  |
+-------------------+     |  | AI Code     |  |     +-------------------+
|   IDE Plugins     |---->|  | Detector    |  |---->|  Weekly Reports   |
| (VSCode, JetBrains|     |  +-------------+  |     |  (Email/Slack)    |
+-------------------+     |  +-------------+  |     +-------------------+
                          |  | Quality     |  |
                          |  | Analyzer    |  |
                          |  +-------------+  |
                          |  +-------------+  |
                          |  | Vibecoding  |  |
                          |  | Score Engine|  |
                          |  +-------------+  |
                          +-------------------+
                                   |
                                   v
                          +-------------------+
                          |    PostgreSQL     |
                          | (Analysis Data)   |
                          +-------------------+
                                   |
                                   v
                          +-------------------+
                          |    ClickHouse     |
                          | (Time Series)     |
                          +-------------------+
```

**데이터 흐름:**
1. GitHub/GitLab Webhook으로 PR/커밋 이벤트 수신
2. AI Code Detector가 AI 생성 코드 식별 (휴리스틱 + ML)
3. Quality Analyzer가 버그 패턴, 보안 취약점, 기술 부채 분석
4. Vibecoding Score Engine이 종합 점수 계산
5. 결과를 Dashboard에 표시 및 주간 리포트 발송

### 4.2 기술 스택

| 레이어 | 기술 | 선택 이유 |
|--------|------|-----------|
| Frontend | Next.js 14 + shadcn/ui | 빠른 개발, 대시보드 UI 컴포넌트 |
| Backend API | Python FastAPI | ML 라이브러리 연동, 비동기 처리 |
| AI Detection | Claude API (Haiku) + 커스텀 ML | 코드 분류, 패턴 인식 |
| Static Analysis | Semgrep + 커스텀 룰 | 보안 취약점, 코드 패턴 분석 |
| Database | PostgreSQL + pgvector | 코드 임베딩, 유사도 검색 |
| Time Series | ClickHouse | 품질 지표 시계열 분석 |
| Queue | BullMQ (Redis) | 비동기 분석 작업 처리 |
| Hosting | Vercel (Web) + Railway (API) | 빠른 배포, 합리적 비용 |

### 4.3 외부 의존성

| 의존성 | 용도 | 대안 |
|--------|------|------|
| GitHub API | PR/커밋 데이터 수집, Webhook | GitLab API, Bitbucket API |
| Claude API | AI 코드 패턴 분석, 복잡한 추론 | GPT-4o, Gemini |
| Semgrep | 정적 분석, 보안 취약점 탐지 | CodeQL, SonarQube API |
| Stripe | 결제 처리 | Paddle, Lemon Squeezy |
| Resend | 이메일 발송 | Mailgun, SendGrid |
| Slack API | 알림 발송 | MS Teams Webhook |

---

## 5. 비즈니스 요구사항 (Business Requirements)

### 5.1 수익 모델

| 플랜 | 가격 | 포함 기능 |
|------|------|-----------|
| Starter | $79/월 | 개발자 10명까지, 3개 레포, 기본 대시보드, 주간 리포트 |
| Team | $199/월 | 개발자 30명까지, 무제한 레포, AI 도구별 비교, PDF 리포트 |
| Enterprise | $499/월 | 무제한 개발자, SSO, 전담 지원, SLA, API 접근, 커스텀 연동 |

**가격 책정 근거:**
- Kilo Code Reviewer (Product Hunt 545 votes): 무료이지만 기능 제한
- SonarQube Cloud: $15/user/월 -> 우리는 AI 특화로 프리미엄
- 타겟 고객이 이미 AI 도구에 $500-3,000/월 지출 중, 품질 관리에 +10-15% 투자 의향

**연간 할인:** 20% (Starter $63/월, Team $159/월, Enterprise $399/월)

### 5.2 단위 경제 (Unit Economics)

- **CAC (Customer Acquisition Cost):** $150
  - 콘텐츠 마케팅 (SEO, 블로그): $50
  - LinkedIn 광고: $80
  - 영업 시간 (첫 온보딩 콜): $20

- **LTV (Lifetime Value):** $1,740
  - 평균 플랜: $145/월 (Starter와 Team 중간)
  - 평균 구독 기간: 12개월 (B2B SaaS 평균)
  - LTV = $145 x 12 = $1,740

- **LTV/CAC Ratio:** 11.6x (목표 > 3x, 우수)

- **Payback Period:** 1.0개월 (첫 월 결제로 CAC 회수)

- **Gross Margin:** 75%
  - 월 매출 $145 - 인프라 비용 ~$36 = $109 마진
  - (Claude API, ClickHouse, 호스팅 비용 포함)

### 5.3 시장 분석

- **TAM (Total Addressable Market):** $12B
  - 글로벌 코드 품질/보안 도구 시장 (2026년)

- **SAM (Serviceable Addressable Market):** $1.2B
  - AI 코딩 도구 사용 팀 대상 품질 분석 세그먼트 (TAM의 10%)

- **SOM (Serviceable Obtainable Market):** $6M
  - 첫 2년 목표: SAM의 0.5% 점유

**경쟁사 분석:**

| 경쟁사 | 강점 | 약점 | 가격 |
|--------|------|------|------|
| SonarQube | 업계 표준, 광범위한 언어 지원 | AI 코드 특화 없음 | $15/user/월 |
| Snyk | 보안 취약점 전문 | AI 코드 맥락 없음 | $25/user/월 |
| CodeClimate | 깔끔한 UX | AI 특화 X, 정체된 개발 | $16/user/월 |
| Kilo Code Reviewer | Product Hunt 인기, 무료 | 기업용 기능 부족 | 무료 |
| GitHub Copilot Metrics | 공식 데이터 | 품질 분석 없음, Copilot만 | 무료 (번들) |

**핵심 차별화:**
1. **"AI가 만든 코드" 전용 분석**: 기존 도구는 수동 코드 기준 설계
2. **Vibecoding 품질 지수**: 직관적인 단일 점수로 AI 코드 건강도 파악
3. **멀티툴 통합 분석**: Cursor, Copilot, Claude Code 동시 분석 및 비교
4. **팀 리드 최적화**: 주간 리포트, PDF 다운로드, 이사회 보고용 자료

### 5.4 Go-to-Market 전략

**초기 사용자 확보 방법:**

1. **콘텐츠 마케팅 (Week 1-4)**
   - "Vibecoding 2년 후: 수동 코딩으로 돌아간 팀들" 블로그 시리즈
   - "AI 코드 품질 측정하기: Engineering Manager 가이드" eBook
   - "Karpathy처럼 80% AI 코딩? 품질은 괜찮을까?" 유튜브 분석

2. **개발자 커뮤니티 (Week 3-6)**
   - Product Hunt 런칭 (Kilo Code Reviewer 545 votes 타겟)
   - Hacker News "Show HN" 포스트
   - Reddit r/ExperiencedDevs, r/cscareerquestions
   - Dev.to, Hashnode 기술 블로그

3. **LinkedIn 아웃바운드 (Week 5-8)**
   - Engineering Manager, Tech Lead 타겟 광고
   - "무료 AI 코드 품질 진단" 리드 마그넷
   - 14일 무료 체험 후 자동 결제

4. **파트너십 (Month 2-3)**
   - AI 코딩 도구 리셀러/컨설팅 회사 협력
   - DevOps 컨설팅 회사 제휴

**마케팅 채널:**

| 채널 | 예상 CAC | 우선순위 |
|------|----------|----------|
| Product Hunt | $0 | 높음 (초기 인지도) |
| Hacker News | $0 | 높음 (개발자 커뮤니티) |
| Organic (SEO/콘텐츠) | $50 | 높음 (장기) |
| LinkedIn 광고 | $200 | 중간 (정확한 타겟팅) |
| Cold Outreach | $100 | 중간 |

---

## 6. 마일스톤 (Milestones)

### Phase 1: MVP (Week 1-4)

**Week 1: 데이터 수집 파이프라인**
- [ ] GitHub OAuth 연동 및 레포 접근 권한 획득
- [ ] Webhook 설정으로 PR/커밋 이벤트 실시간 수신
- [ ] 커밋 diff 데이터 파싱 및 저장 스키마 설계
- [ ] 기본 PostgreSQL + ClickHouse 인프라 구축

**Week 2: AI 코드 탐지 엔진**
- [ ] AI 생성 코드 탐지 휴리스틱 개발 (커밋 패턴, 코드 스타일, 메타데이터)
- [ ] Claude API 연동 - 코드 분류 프롬프트 개발
- [ ] 파일별/함수별 AI 생성 비율 계산 로직 구현
- [ ] 탐지 정확도 테스트 (목표 85%)

**Week 3: 품질 분석 엔진**
- [ ] Semgrep 연동 - AI 코드 특화 룰셋 개발
- [ ] 버그 패턴 탐지 (에러 핸들링 누락, 엣지케이스 미처리)
- [ ] 보안 취약점 스캔 (SQL Injection, XSS, Secrets 노출)
- [ ] 기술 부채 점수 산정 (복잡도, 중복, 주석 부족)

**Week 4: 대시보드 MVP**
- [ ] Next.js + shadcn/ui 기본 UI 구축
- [ ] Vibecoding 품질 지수 계산 및 표시
- [ ] 시간별 추이 그래프 (Chart.js/Recharts)
- [ ] 팀 가입/설정 플로우
- [ ] **Week 4 목표: 내부 팀 1개 레포 연결하여 데모 가능**

### Phase 2: Beta Launch (Week 5-6)

**Week 5: 리포트 및 알림**
- [ ] 주간 품질 리포트 생성 로직
- [ ] 이메일 발송 연동 (Resend)
- [ ] Slack 알림 연동
- [ ] PDF 다운로드 기능
- [ ] AI 도구별 비교 분석 기능

**Week 6: 결제 및 베타 런칭**
- [ ] Stripe 결제 연동 (월간/연간)
- [ ] 플랜별 기능 제한 로직
- [ ] 랜딩 페이지 제작
- [ ] 10개 베타 팀 온보딩
- [ ] **First revenue target: $790 (10개 Starter 팀)**

### Phase 3: Public Launch (Week 7-8)

**Week 7: 퍼블릭 준비**
- [ ] 베타 피드백 기반 버그 수정 및 UX 개선
- [ ] 탐지 정확도 90% 달성
- [ ] 온보딩 튜토리얼 및 헬프 문서
- [ ] Product Hunt 런칭 페이지 준비

**Week 8: 런칭**
- [ ] Product Hunt 런칭
- [ ] Hacker News "Show HN" 포스트
- [ ] LinkedIn 광고 시작
- [ ] **MRR target: $2,000 (25개 팀 믹스)**

### Phase 4: Growth (Month 3-6)

- [ ] GitLab, Bitbucket 지원 추가
- [ ] VS Code 플러그인 개발 (실시간 AI 코드 식별)
- [ ] PR 코멘트 봇 기능
- [ ] Team, Enterprise 플랜 고객 확보
- [ ] **MRR target: $5,000 (50개 팀)**

---

## 7. 리스크 및 의존성 (Risks & Dependencies)

| 리스크 | 영향도 | 발생 확률 | 대응 방안 |
|--------|--------|-----------|-----------|
| AI 코드 탐지 정확도 부족 | 치명적 | 중간 | 휴리스틱 + ML 하이브리드, 사용자 피드백 루프로 지속 개선 |
| GitHub/Copilot이 유사 기능 출시 | 높음 | 중간 | 멀티툴 통합(Cursor+Copilot+Claude) 차별화, 분석 깊이 강화 |
| 개발자 프라이버시 우려 | 높음 | 높음 | 코드 내용 비저장 원칙, 메타데이터만 분석, 명확한 정책 공개 |
| 느린 B2B 영업 사이클 | 중간 | 높음 | 14일 무료 체험, 셀프서브 온보딩, 저가 Starter 플랜 |
| Semgrep/Claude API 비용 초과 | 중간 | 낮음 | 분석 빈도 조절, 캐싱 최적화, 플랜별 분석 한도 설정 |
| 경쟁사 무료 제품 (Kilo Code Reviewer) | 중간 | 높음 | 엔터프라이즈 기능, 팀 분석, 주간 리포트로 차별화 |

**주요 의존성:**
- GitHub/GitLab API 안정성 및 Rate Limit
- Claude API 가용성 및 비용
- Semgrep 오픈소스 룰셋 품질
- AI 코딩 도구 시장 성장 지속

---

## 부록 A: Vibecoding 품질 지수 산정 방법론

### 지수 구성 요소

**Vibecoding 품질 지수 = 100 - (버그 점수 x 0.3 + 보안 점수 x 0.4 + 부채 점수 x 0.3)**

각 하위 점수는 0-100 범위 (높을수록 나쁨)

#### 1. 버그 점수 (30%)
```
버그 점수 = (AI 코드 관련 버그 수 / 전체 버그 수) x (AI 코드 버그 심각도 가중 평균) x 100

심각도 가중치:
- Critical: 10
- High: 5
- Medium: 2
- Low: 1
```

#### 2. 보안 취약점 점수 (40%)
```
보안 점수 = Semgrep 발견 취약점 수 x 심각도 가중치 / (AI 코드 라인 수 / 1000)

취약점 심각도:
- Critical (CVE 매핑): 25점
- High (OWASP Top 10): 15점
- Medium: 5점
- Low: 1점
```

#### 3. 기술 부채 점수 (30%)
```
부채 점수 = (복잡도 점수 + 중복 점수 + 문서화 점수) / 3

복잡도 점수: Cyclomatic Complexity 평균 (정규화)
중복 점수: 코드 중복률 x 100
문서화 점수: 주석/문서 부족 함수 비율 x 100
```

### 점수 해석 가이드

| 점수 범위 | 등급 | 의미 | 권장 조치 |
|-----------|------|------|-----------|
| 90-100 | A+ | 우수 | 현재 프랙티스 유지 |
| 80-89 | A | 양호 | 모니터링 지속 |
| 70-79 | B | 보통 | 주요 이슈 리뷰 권장 |
| 60-69 | C | 주의 | 리팩토링 계획 수립 |
| 50-59 | D | 경고 | 즉시 품질 개선 필요 |
| 0-49 | F | 위험 | 긴급 조치 필요 |

---

## 부록 B: AI 코드 탐지 휴리스틱

### 1. 커밋 패턴 기반
- 커밋 메시지에 "Copilot", "AI", "generated" 등 키워드
- 짧은 시간에 대량의 코드 변경 (분당 100줄 이상)
- 특정 시간대에 집중된 커밋 패턴

### 2. 코드 스타일 기반
- 과도한 주석 (특히 "This function does X" 패턴)
- 불필요하게 상세한 에러 메시지
- 표준적이지만 비효율적인 패턴 사용
- 일관되지 않은 네이밍 컨벤션

### 3. 구조 기반
- 과도한 추상화 (불필요한 인터페이스/클래스)
- 사용되지 않는 import/변수
- 반복적인 보일러플레이트 코드
- 특정 프레임워크 패턴의 과도한 사용

### 4. IDE 플러그인 연동 (정확도 향상)
- Cursor/Copilot 사용 이벤트 실시간 캡처
- AI 제안 수락/거부 기록
- 파일별 AI 생성 비율 직접 측정

---

## 부록 C: 데이터 프라이버시 정책

### 수집하는 데이터
- 커밋 메타데이터 (타임스탬프, 작성자 ID, 파일 경로, 라인 수)
- 코드 복잡도 지표 (Cyclomatic Complexity, 중복률)
- Semgrep 분석 결과 (취약점 유형, 위치)
- AI 탐지 결과 (AI 생성 확률, 도구 분류)

### 수집하지 않는 데이터
- 코드 원본 내용 (변수명, 로직 등)
- 개발자 개인 정보 (이름, 이메일 - 해시만 저장)
- 커밋 메시지 전문 (키워드 추출만)
- 비공개 레포 접근 권한 저장

### 데이터 보호
- 전송 암호화: TLS 1.3
- 저장 암호화: AES-256
- 데이터 보관: 90일 (상세), 1년 (집계)
- GDPR/CCPA 준수
- SOC 2 Type 2 인증 목표 (Y1)

---

## 부록 D: 참고 자료

### 시장 배경
- **Karpathy 발언 (2024)**: "I code ~80% with agentic tools now"
- **Vibecoding 현상**: 자연어로 대화하며 코딩하는 새로운 패러다임
- **Knowledge Collapse 우려**: AI 생성 코드를 이해하지 못하는 개발자 증가

### 경쟁/유사 제품
- **Kilo Code Reviewer**: Product Hunt 545 votes, AI 코드 리뷰 자동화
- **SonarQube**: 전통적인 정적 분석 도구, AI 특화 없음
- **GitHub Copilot Metrics**: 공식 사용량 지표, 품질 분석 없음

### 기술 참고
- **Semgrep**: 오픈소스 정적 분석, 커스텀 룰 작성 용이
- **Tree-sitter**: 다양한 언어 파싱, 코드 구조 분석
- **CodeBERT**: 코드 임베딩, 유사도 분석
