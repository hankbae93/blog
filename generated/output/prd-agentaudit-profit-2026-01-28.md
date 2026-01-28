# PRD: AgentAudit

> 팀의 AI 에이전트 사용량과 코드 품질을 추적하여 AI 도구 투자 ROI를 측정하는 B2B SaaS

**문서 정보**
- 작성일: 2026-01-28
- 버전: 1.0
- 상태: Draft
- 트랙: Profit

---

## 1. 개요 (Overview)

### 1.1 문제 정의 (Problem Statement)
- **누가** 겪는 문제인가?
  - 10-100명 규모 스타트업의 Engineering Manager, VP Engineering
  - AI 도구 비용을 관리하는 CTO, 재무 담당자
  - 팀 생산성 개선을 책임지는 기술 리더

- **무엇이** 문제인가?
  - GitHub Copilot, Cursor, Claude Code 등에 팀당 월 $500-2,000 지출하지만 실제 ROI 불명확
  - 어떤 개발자가 AI를 효과적으로 활용하고, 누가 학습이 필요한지 파악 불가
  - AI 생성 코드의 버그 비율, PR 리뷰 시간 등 품질 영향 데이터 부재
  - CFO/투자자의 "AI 도구가 실제로 도움이 되나?" 질문에 답변 불가

- **왜** 문제인가? (비용/임팩트)
  - 100명 팀 기준 연간 AI 도구 비용: $120,000-240,000
  - ROI 증명 실패 시 예산 삭감 리스크
  - "Vibecoding" 논쟁으로 AI 코딩의 품질 우려 증가 (Knowledge Collapse)
  - 개발자 간 AI 활용 격차가 팀 생산성 불균형으로 이어짐

### 1.2 솔루션 요약 (Solution Summary)
- **핵심 가치 제안:** AI 에이전트 사용량과 코드 품질을 연결하여, CFO에게 보여줄 수 있는 ROI 리포트를 자동 생성

### 1.3 성공 지표 (Success Metrics)
| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| 첫 수익 (Time to First Revenue) | 45일 내 | Stripe 결제 기록 |
| 월간 반복 매출 (MRR) | $4,900 (6개월) | Stripe MRR 대시보드 |
| 평균 계약 가치 (ACV) | $490/팀/월 | 유료 팀당 평균 결제액 |
| 유료 전환율 | 20% | 무료 체험 -> 유료 전환 비율 |
| 고객 이탈률 (Churn) | < 5%/월 | 월간 해지 비율 |
| 도입 팀 수 | 10개 팀 (6개월) | 유료 구독 팀 수 |

---

## 2. 타겟 사용자 (Target Users)

### 2.1 주요 페르소나

**페르소나 1: 영호 - Series B 스타트업 VP Engineering**
- **직업/역할:** 50명 엔지니어링 조직 총괄, 기술 전략 및 생산성 책임
- **인구통계:** 42세, 강남 소재 핀테크 스타트업, 연봉 2억원
- **기술 수준:** 전 시니어 개발자, 현재는 관리 업무 위주
- **주요 고충점:**
  - 이사회에서 "개발 생산성 지표"를 매 분기 보고해야 함
  - Copilot 도입 후 생산성이 올랐다는 감(感)은 있지만 데이터 없음
  - 일부 시니어 개발자가 AI 도구 사용을 거부, 설득할 근거 필요
- **현재 대안:** GitHub Insights + 수동 스프레드시트 분석
- **기존 지출:** GitHub Copilot Business $38/user x 50 = $1,900/월

**페르소나 2: 수진 - 성장 스타트업 Engineering Manager**
- **직업/역할:** 15명 백엔드 팀 관리, 개발 프로세스 개선 담당
- **인구통계:** 35세, 원격근무 기반 SaaS 스타트업
- **기술 수준:** 테크 리드 출신, 코드 리뷰 여전히 참여
- **주요 고충점:**
  - 주니어 개발자들이 AI 코드를 이해 없이 복붙하는 것 같음
  - AI 생성 코드에서 유독 버그가 많이 나오는 느낌이지만 확인 불가
  - Cursor vs Copilot 중 팀에 더 맞는 도구 선택 근거 없음
- **현재 대안:** PR 리뷰 시 직감에 의존, 1:1 미팅에서 개별 확인
- **기존 지출:** Cursor Business $40/user x 15 = $600/월

### 2.2 사용자 시나리오

> **시나리오 1:** "영호는 분기 이사회 전, AgentAudit 대시보드에서 'AI 도구 도입 후 PR 머지 시간 23% 단축, 개발자당 월 8시간 절감'이라는 데이터를 다운로드하여 CFO를 설득한다."

> **시나리오 2:** "수진은 팀 대시보드에서 주니어 개발자 A의 AI 수용률은 높지만 AI 생성 코드의 버그율이 팀 평균 2배라는 것을 발견하고, 맞춤형 코드 리뷰 세션을 진행한다."

> **시나리오 3:** "CTO는 Copilot과 Cursor를 동시에 파일럿 중인데, AgentAudit의 A/B 테스트 기능으로 두 도구의 생산성 영향을 비교하여 전사 도입 도구를 결정한다."

---

## 3. 기능 요구사항 (Functional Requirements)

### 3.1 MVP 필수 기능 (Must Have)

#### F1: IDE 플러그인 - AI 에이전트 사용량 수집
- **설명:** VS Code 확장으로 GitHub Copilot, Cursor, Claude Code 등의 사용량을 자동 수집
- **사용자 스토리:** As an Engineering Manager, I want to automatically collect AI usage data from my team, so that I can analyze AI adoption without manual reporting.
- **수용 기준:**
  - [ ] VS Code 확장 (Marketplace 배포)
  - [ ] Copilot 사용 감지 (수락/거부 횟수, 수락 라인 수)
  - [ ] Cursor 사용 감지 (Chat/Composer 호출 횟수)
  - [ ] 개발자 익명화 옵션 (프라이버시 보호)
  - [ ] 10초 간격 배치 전송 (성능 영향 최소화)

#### F2: AI 코드 품질 분석 대시보드
- **설명:** AI 생성 코드 vs 수동 작성 코드의 품질 지표를 비교 분석
- **사용자 스토리:** As a VP Engineering, I want to see the quality impact of AI-generated code, so that I can make data-driven decisions about AI tool investment.
- **수용 기준:**
  - [ ] GitHub/GitLab 연동으로 PR/커밋 데이터 수집
  - [ ] AI 생성 코드 추정 (플러그인 데이터 + 커밋 시간 상관관계)
  - [ ] 버그율 비교 (AI 코드 관련 이슈 추적)
  - [ ] PR 리뷰 시간 비교
  - [ ] 주간/월간 트렌드 차트

#### F3: 팀 ROI 리포트
- **설명:** AI 도구 비용 대비 시간 절감 효과를 금액으로 환산한 리포트 자동 생성
- **사용자 스토리:** As a CTO, I want to generate ROI reports for CFO/board meetings, so that I can justify our AI tool spending.
- **수용 기준:**
  - [ ] AI 도구 비용 입력 (Copilot/Cursor 구독료)
  - [ ] 개발자 시간당 비용 설정 (기본값 $75/시간)
  - [ ] 월간 시간 절감 추정 (AI 수락 코드 라인 x 평균 작성 시간)
  - [ ] ROI = (시간 절감 가치 - AI 도구 비용) / AI 도구 비용
  - [ ] PDF/CSV 다운로드, 이메일 예약 발송

### 3.2 향후 기능 (Nice to Have)
- **A/B 테스트 기능:** Copilot vs Cursor 팀 내 비교 실험
- **개인 대시보드:** 개발자 본인의 AI 활용 인사이트
- **Slack 알림:** 주간 하이라이트 자동 공유
- **벤치마크 비교:** 익명화된 업계 평균과 비교
- **JetBrains 플러그인:** IntelliJ, PyCharm 등 지원

### 3.3 명시적 제외 (Out of Scope)
- 코드 내용 수집/분석 (프라이버시 이슈)
- AI 도구 자체 기능 제공 (코드 자동완성 등)
- 개인 성과 평가 도구로 사용 (팀 수준 분석만)
- On-premise 설치 버전

---

## 4. 기술 요구사항 (Technical Requirements)

### 4.1 시스템 아키텍처
```
[VS Code Extension] ---> [Ingest API] ---> [TimescaleDB]
        |                      |                |
        v                      v                v
[GitHub/GitLab Webhook] ---> [Processing] ---> [Analytics Engine]
                                |                |
                                v                v
                          [Redis Queue]    [Dashboard API]
                                                 |
                                                 v
                                           [Web Dashboard]
```

- **데이터 수집:** 실시간 스트리밍 (Kafka/Redis Streams)
- **분석 처리:** 배치 처리 (5분 간격) + 실시간 집계
- **데이터 보관:** 90일 상세 데이터, 1년 집계 데이터

### 4.2 기술 스택
| 레이어 | 기술 | 선택 이유 |
|--------|------|-----------|
| VS Code Extension | TypeScript | VS Code 표준, 타입 안정성 |
| Frontend | Next.js 14 + shadcn/ui | 빠른 개발, 차트 라이브러리 풍부 |
| Backend API | Node.js + Fastify | 높은 처리량, JSON 스키마 검증 |
| Database | TimescaleDB (PostgreSQL) | 시계열 데이터 최적화, SQL 호환 |
| Queue | BullMQ (Redis) | 안정적 작업 큐, 재시도 로직 |
| Analytics | ClickHouse | 대용량 집계 쿼리 성능 |
| 호스팅 | Vercel (Web) + Fly.io (API) | 글로벌 엣지, 저비용 |

### 4.3 외부 의존성
- **GitHub API:** PR/이슈 데이터 수집 (OAuth App)
- **GitLab API:** 대안 Git 플랫폼 지원
- **VS Code Marketplace:** 확장 배포
- **Stripe:** 결제 처리
- **Resend:** 리포트 이메일 발송

---

## 5. 비즈니스 요구사항 (Business Requirements)

### 5.1 수익 모델
| 플랜 | 가격 | 포함 기능 |
|------|------|-----------|
| Free | $0/월 | 5명까지, 기본 대시보드, 30일 데이터 보관 |
| Pro | $49/개발자/월 | 무제한 팀원, 품질 분석, ROI 리포트, 90일 보관 |
| Enterprise | $99/개발자/월 | SSO, 전담 지원, 1년 보관, SLA, 맞춤 연동 |

**가격 책정 근거:**
- Copilot Business: $38/user/월 -> AgentAudit: Copilot 비용의 +30% 추가 투자
- Datadog APM: $31/host/월 -> 유사한 인프라 모니터링 가격대
- 타겟 고객이 이미 AI 도구에 $500-2,000/월 지출 중, 추가 10-20% 투자 의향

**최소 구매:** 5명 이상 (Pro: $245/월 최소)

### 5.2 단위 경제 (Unit Economics)
- **CAC (Customer Acquisition Cost):** $200
  - LinkedIn 광고 (Engineering Manager 타겟): $150
  - 콘텐츠 마케팅 (블로그, 웨비나): $30
  - 영업 시간 (첫 통화): $20

- **LTV (Lifetime Value):** $5,880
  - 평균 팀 규모: 10명
  - 월 결제: $49 x 10 = $490
  - 평균 구독 기간: 12개월 (B2B SaaS 평균)
  - LTV = $490 x 12 = $5,880

- **LTV/CAC Ratio:** 29.4x (목표 > 3x, 매우 우수)

- **Payback Period:** 0.4개월 (첫 월 결제로 CAC 회수)

- **Gross Margin:** 80%
  - 월 매출 $490 - 인프라 비용 ~$98 = $392 마진
  - (TimescaleDB, ClickHouse 클라우드 비용 고려)

### 5.3 시장 분석
- **TAM (Total Addressable Market):** $8.5B
  - 글로벌 개발자 생산성 도구 시장 (2026년)

- **SAM (Serviceable Addressable Market):** $850M
  - AI 코딩 도구 분석/모니터링 세그먼트 (TAM의 10%)

- **SOM (Serviceable Obtainable Market):** $4.25M
  - 첫 2년 목표: SAM의 0.5% 점유

- **경쟁사:**
  | 경쟁사 | 강점 | 약점 | 가격 |
  |--------|------|------|------|
  | GitHub Copilot Metrics | 공식 데이터, 무료 | Copilot만, 품질 분석 없음 | 무료 |
  | LinearB | 포괄적 개발 분석 | AI 특화 X, 비쌈 | $50/user/월 |
  | Jellyfish | 경영진 대시보드 | AI 특화 X, 엔터프라이즈만 | 협의 |
  | Trails (오픈소스) | 무료, LLM 인사이트 | SaaS 없음, 셀프 호스팅 | 무료 |

- **차별화 포인트:**
  1. **AI 도구 전문:** Copilot, Cursor, Claude Code 크로스 플랫폼 통합
  2. **ROI 포커스:** 품질 분석 + 비용 계산 = CFO 설득 가능
  3. **개발자 친화적:** 프라이버시 존중, 개인 성과 평가 도구 아님
  4. **빠른 가치:** 설치 후 1주일 내 첫 인사이트 제공

### 5.4 Go-to-Market 전략

**초기 사용자 확보 방법:**
1. **콘텐츠 마케팅 (Week 1-4)**
   - "Karpathy처럼 80% AI 코딩, 당신 팀은 몇 %?" 블로그
   - "AI 코딩 ROI 계산법: CFO 설득 가이드" eBook
   - YouTube: "팀의 AI 생산성 측정하는 법" 웨비나

2. **개발자 커뮤니티 (Week 3-6)**
   - Hacker News "Show HN" 포스트
   - Reddit r/ExperiencedDevs, r/startups
   - Dev.to, Hashnode 기술 블로그

3. **LinkedIn 아웃바운드 (Week 5-8)**
   - Engineering Manager, VP Engineering 타겟
   - "무료 AI ROI 분석 리포트" 제안
   - 첫 30일 무료 체험 후 자동 결제

4. **파트너십 (Month 2-3)**
   - Copilot/Cursor 리셀러 협력 문의
   - 스타트업 액셀러레이터 제휴 (Y Combinator 배치 대상)

**마케팅 채널:**
| 채널 | 예상 CAC | 우선순위 |
|------|----------|----------|
| LinkedIn 광고 | $200 | 높음 (정확한 타겟팅) |
| Organic (SEO/콘텐츠) | $50 | 높음 (장기) |
| Hacker News | $0 | 높음 (초기) |
| Cold Outreach | $100 | 중간 |
| 웨비나/이벤트 | $150 | 중간 |

---

## 6. 마일스톤 (Milestones)

### Phase 1: MVP (Week 1-4)
- [ ] VS Code 확장 개발 (Copilot 사용량 수집)
- [ ] 기본 대시보드 (사용량 차트)
- [ ] GitHub OAuth 연동
- [ ] 팀 가입/설정 플로우
- [ ] **Week 4: VS Code Marketplace 배포**

### Phase 2: Beta Launch (Week 5-6)
- [ ] 품질 분석 기능 (PR/버그율)
- [ ] ROI 리포트 생성
- [ ] Stripe 결제 연동
- [ ] 5개 베타 팀 온보딩
- [ ] **First revenue target: $245 (1개 팀 x 5명 Pro)**

### Phase 3: Public Launch (Week 7-8)
- [ ] Product Hunt 런칭
- [ ] Cursor 지원 추가
- [ ] 주간 이메일 리포트
- [ ] **MRR target: $1,470 (3개 팀 x 평균 10명)**

### Phase 4: Growth (Month 3-6)
- [ ] Claude Code 지원
- [ ] A/B 테스트 기능
- [ ] Enterprise 플랜 기능
- [ ] LinkedIn 광고 스케일업
- [ ] **MRR target: $4,900 (10개 팀 x 평균 10명)**

---

## 7. 리스크 및 의존성 (Risks & Dependencies)

| 리스크 | 영향도 | 발생 확률 | 대응 방안 |
|--------|--------|-----------|-----------|
| GitHub Copilot 공식 분석 출시 | 치명적 | 중간 | 크로스 플랫폼 차별화, 품질 분석 강화 |
| 개발자 프라이버시 우려 | 높음 | 높음 | 익명화 옵션, 개인 성과 평가 아님 강조 |
| VS Code 확장 성능 이슈 | 중간 | 중간 | 경량화, 배치 전송, 성능 테스트 |
| 느린 B2B 영업 사이클 | 중간 | 높음 | 무료 체험 30일, 셀프서브 가능하게 |
| AI 도구 시장 변화 | 중간 | 중간 | 플러그인 아키텍처로 새 도구 빠른 지원 |

**주요 의존성:**
- VS Code Marketplace 승인
- GitHub/GitLab API 안정성
- TimescaleDB/ClickHouse 클라우드 가용성

---

## 부록 A: 프라이버시 및 보안 정책

**수집하는 데이터:**
- AI 도구 사용 통계 (수락/거부 횟수, 코드 라인 수)
- 커밋/PR 메타데이터 (타임스탬프, 작성자, 파일 경로)
- 개발자 식별자 (이메일 또는 익명 ID)

**수집하지 않는 데이터:**
- 코드 내용 (한 줄도 수집 안 함)
- AI 프롬프트 내용
- 개인 파일 시스템 정보

**데이터 보호:**
- 전송 암호화: TLS 1.3
- 저장 암호화: AES-256
- 데이터 보관: 90일 (Pro), 1년 (Enterprise) 후 자동 삭제
- SOC 2 Type 2 목표 (12개월 내)

## 부록 B: ROI 계산 방법론

**시간 절감 추정 공식:**
```
시간 절감 = AI 수락 코드 라인 수 x 평균 수동 작성 시간(분/라인) / 60

- 평균 수동 작성 시간: 2분/라인 (연구 기반 기본값)
- 사용자 조정 가능: 1-5분/라인
```

**ROI 계산:**
```
월간 ROI = (시간 절감 시간 x 개발자 시간당 비용 - AI 도구 월 비용) / AI 도구 월 비용 x 100%

예시:
- AI 수락 코드: 1,000 라인/월
- 시간 절감: 1,000 x 2 / 60 = 33시간/월
- 가치: 33 x $75 = $2,475
- AI 도구 비용: $500/월
- ROI = ($2,475 - $500) / $500 = 395%
```

## 부록 C: 첫 60일 세부 로드맵

**Week 1-2:**
- VS Code 확장 아키텍처 설계
- Copilot 사용량 감지 로직 개발
- 수집 데이터 스키마 정의

**Week 3-4:**
- 백엔드 API 개발 (Fastify)
- TimescaleDB 스키마 구축
- 기본 대시보드 UI

**Week 5-6:**
- GitHub 연동 (OAuth, Webhook)
- 품질 분석 로직 (PR/이슈 상관관계)
- ROI 리포트 생성기

**Week 7-8:**
- Stripe 결제 연동
- VS Code Marketplace 배포
- 베타 사용자 온보딩

**Week 9-10 (Month 3 시작):**
- 피드백 기반 개선
- Cursor 지원 추가
- Product Hunt 런칭 준비
