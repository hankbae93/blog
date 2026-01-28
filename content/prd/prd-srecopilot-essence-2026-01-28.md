---
title: "PRD: SRE Copilot for Solo Devs"
description: "> 1인 개발자의 새벽 3시 장애 대응을 AI가 1차 분류해, 정말 긴급할 때만 깨워주는 스마트 온콜 도구"
keywords: "PRD, 기획서, 요구사항, MVP, SRE Copilot for Solo Devs"
date: "2026-01-28"
---

# PRD: SRE Copilot for Solo Devs

> 1인 개발자의 새벽 3시 장애 대응을 AI가 1차 분류해, 정말 긴급할 때만 깨워주는 스마트 온콜 도구

**문서 정보**
- 작성일: 2026-01-28
- 버전: 1.0
- 상태: Draft
- 트랙: Essence

---

## 1. 개요 (Overview)

### 1.1 문제 정의 (Problem Statement)

- **누가** 겪는 문제인가?
  - $5k-50k MRR 규모의 1인 SaaS 운영자
  - 다중 앱 포트폴리오를 운영하는 인디해커
  - 사이드 프로젝트가 성공해 본업과 병행하며 서비스를 운영하는 개발자

- **무엇이** 문제인가?
  - 모든 서비스 알림이 운영자 1명에게 직접 전달됨
  - 알림의 90%는 "지금 당장 대응 안 해도 되는" 것이지만, 진짜 긴급한 10%를 구분하려면 결국 모든 알림을 확인해야 함
  - 새벽에 발생하는 알림 때문에 수면을 방해받거나, 알림을 끄면 진짜 장애를 놓칠 수 있다는 불안감

- **왜** 문제인가?
  - **생산성 저하**: 수면 부족으로 낮 시간 개발 효율 급감
  - **번아웃 위험**: 24/7 온콜 상태 지속으로 정신적 피로 누적
  - **성장 한계**: "혼자서 운영 가능한 규모"라는 천장이 생김
  - **전제 파괴**: "SRE/운영은 팀이 해야 한다"는 기존 상식이 1인 개발자에게는 적용 불가

### 1.2 솔루션 요약 (Solution Summary)

- **핵심 가치 제안**: AI가 알림을 실시간으로 분류해, 진짜 긴급한 장애만 즉시 알리고 나머지는 아침에 정리된 리포트로 전달함으로써 1인 개발자의 "수면권"을 보장한다.

### 1.3 성공 지표 (Success Metrics)

| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| 야간 불필요 알림 감소율 | 80% 이상 | Smart Wake 이전 vs 이후 야간 알림 수 비교 |
| Critical 알림 정확도 | 95% 이상 | 실제 긴급 장애 중 Critical로 분류된 비율 (재현율) |
| 사용자 수면 시간 증가 | +1.5시간/일 | 사용자 설문 및 앱 사용 패턴 분석 |
| 월간 이탈률 (Churn) | 5% 미만 | 유료 구독 취소율 |
| NPS | 50 이상 | 분기별 사용자 설문 |

---

## 2. 타겟 사용자 (Target Users)

### 2.1 주요 페르소나

**페르소나 이름: 민수 (Minsu)**

- **직업/역할:** 1인 SaaS 창업자, $15k MRR B2B 도구 운영
- **인구통계:** 32세, 한국 거주, 전 스타트업 백엔드 개발자
- **기술 수준:** 시니어 개발자 수준. AWS/GCP 인프라 직접 구축 및 운영 가능
- **주요 고충점:**
  - 매일 새벽 2-5시 사이 평균 3-4개의 알림 수신
  - 알림 중 실제 긴급 장애는 월 1-2회에 불과
  - 알림을 무시했다가 고객 이탈을 경험한 트라우마
  - 수면 부족으로 낮 생산성 50% 이하
- **현재 대안:**
  - Slack 알림 + 휴대폰 무음 해제 (모든 알림 수동 확인)
  - 간단한 CloudWatch 알람 (임계값 기반, 오탐 많음)
  - PagerDuty 트라이얼 경험 (월 $29/user, 1인에게 과함)

**페르소나 이름: Sarah**

- **직업/역할:** 인디해커, 3개 앱 포트폴리오 운영 ($60k/mo 합산)
- **인구통계:** 28세, 미국 거주, 풀스택 개발자
- **기술 수준:** 중급. Vercel/Railway 등 PaaS 위주, 인프라 깊이 부족
- **주요 고충점:**
  - 3개 서비스의 알림이 모두 한 채널로 들어옴
  - 어떤 서비스의 어떤 문제인지 파악에 시간 소요
  - "잠시만 꺼도 될 것 같은" 야간에도 불안해서 알림 ON
- **현재 대안:**
  - Discord 웹훅 + 개인 서버 (채널 분리했으나 여전히 수동)
  - Uptime Robot (다운 알림만, 원인 분석 불가)

### 2.2 사용자 시나리오

> "민수는 새벽 3시에 서버 CPU 사용량 급증 알림을 받았다. 잠결에 일어나 노트북을 열어보니 크론잡이 겹쳐서 일시적으로 높아진 것이었다. 10분 확인하고 다시 잠들었지만, 이미 깊은 수면은 깨졌다. 아침에 일어나니 피곤하고, 오늘 예정된 신기능 개발은 내일로 미뤄야 할 것 같다."

> "Sarah는 주말 아침, 밤새 쌓인 47개의 알림을 확인한다. 대부분은 일반적인 로그 경고이지만, 그 중 하나가 실제 결제 실패였다. 47개를 하나씩 보다가 3시간이 지났다. 주말이 사라졌다."

---

## 3. 기능 요구사항 (Functional Requirements)

### 3.1 MVP 필수 기능 (Must Have)

#### F1: Alert Triage AI
- **설명:** 들어오는 모든 알림(로그, 메트릭, 에러)을 AI가 실시간 분석하여 Critical / Warning / Info 3단계로 자동 분류
- **사용자 스토리:** As a solo developer, I want to have my alerts automatically categorized by severity, so that I don't have to manually review every notification.
- **수용 기준:**
  - [ ] 알림 수신 후 10초 이내 분류 완료
  - [ ] Critical 분류 재현율(Recall) 95% 이상
  - [ ] 사용자가 분류 결과에 피드백(Correct/Wrong) 가능
  - [ ] 피드백 기반 모델 fine-tuning 파이프라인 구축
  - [ ] 지원 소스: CloudWatch, Datadog, Sentry, 커스텀 웹훅

#### F2: Smart Wake
- **설명:** Critical 알림만 즉시 전화/SMS로 전달하고, Warning/Info는 조용히 대기열에 저장
- **사용자 스토리:** As a solo developer, I want to be woken up only for truly critical issues, so that I can sleep through non-urgent alerts.
- **수용 기준:**
  - [ ] Critical 알림 발생 시 30초 이내 전화 발신
  - [ ] 전화 미응답 시 3분 간격 3회 재시도 후 SMS
  - [ ] 사용자별 "조용한 시간대(Quiet Hours)" 설정 가능
  - [ ] Quiet Hours 중 Warning/Info는 무음, Critical만 돌파
  - [ ] 전화/SMS 발신 비용 사용자에게 투명하게 표시

#### F3: Morning Digest
- **설명:** 밤새 쌓인 Warning/Info 알림을 아침에 요약 리포트로 전달
- **사용자 스토리:** As a solo developer, I want to receive a summarized report of overnight alerts every morning, so that I can quickly understand what happened without reviewing each alert.
- **수용 기준:**
  - [ ] 사용자 지정 시간에 이메일/Slack으로 리포트 전송
  - [ ] 알림을 서비스별, 유형별로 그룹화
  - [ ] 각 그룹에 대해 AI가 1-2문장 요약 제공
  - [ ] "이 알림은 자주 발생합니다" 패턴 감지 및 표시
  - [ ] 리포트 내에서 개별 알림 상세 보기 가능

### 3.2 향후 기능 (Nice to Have)
- **Auto-Remediation Suggestions**: Critical 알림 발생 시 AI가 권장 조치 제안 (예: "이전 유사 장애 시 서버 재시작으로 해결됨")
- **Root Cause Analysis**: 여러 알림을 연결해 근본 원인 추론
- **Cost Anomaly Detection**: Cloud 비용 급증 시 별도 알림
- **Multi-Service Dashboard**: 여러 서비스의 상태를 한눈에 파악
- **Incident Timeline**: 장애 발생부터 해결까지 타임라인 자동 생성

### 3.3 명시적 제외 (Out of Scope)
- **팀 협업 기능**: 에스컬레이션, 온콜 로테이션, 팀 대시보드 등은 1인 타겟이므로 제외
- **직접 모니터링 에이전트 설치**: 기존 도구(CloudWatch, Datadog 등)와 연동만, 자체 에이전트 개발 안 함
- **로그 저장/검색**: 알림 분류만, 로그 자체 저장은 기존 도구 활용
- **APM 기능**: 성능 프로파일링, 분산 트레이싱 등은 범위 밖

---

## 4. 기술 요구사항 (Technical Requirements)

### 4.1 시스템 아키텍처

```
+------------------+     +------------------+     +------------------+
|  Alert Sources   |     |   SRE Copilot    |     |    Delivery      |
|  (CloudWatch,    |---->|   Core Engine    |---->|    Channels      |
|   Datadog, etc)  |     |                  |     |  (Phone/SMS/     |
+------------------+     |  +------------+  |     |   Email/Slack)   |
                         |  | Triage AI  |  |     +------------------+
                         |  +------------+  |
                         |  +------------+  |
                         |  | Alert Queue|  |
                         |  +------------+  |
                         |  +------------+  |
                         |  | Digest Gen |  |
                         |  +------------+  |
                         +------------------+
                                  |
                                  v
                         +------------------+
                         |    PostgreSQL    |
                         |  (Alert History) |
                         +------------------+
```

### 4.2 기술 스택

| 레이어 | 기술 | 선택 이유 |
|--------|------|-----------|
| Backend API | Go / Fiber | 고성능, 낮은 메모리 사용, 실시간 처리에 적합 |
| AI Inference | Claude API (Haiku) | 비용 효율적, 빠른 응답, 충분한 분류 정확도 |
| Database | PostgreSQL + TimescaleDB | 시계열 알림 데이터 효율적 저장, 쿼리 |
| Message Queue | Redis Streams | 알림 대기열, 실시간 처리, 낮은 지연 |
| Telephony | Twilio | 글로벌 커버리지, 신뢰성, 합리적 가격 |
| Hosting | Railway / Fly.io | 빠른 배포, 글로벌 엣지, 1인 개발에 적합한 운영 부담 |
| Frontend | Next.js + Tailwind | 빠른 대시보드 개발, SSR로 초기 로딩 최적화 |

### 4.3 외부 의존성

| 의존성 | 용도 | 대안 |
|--------|------|------|
| Twilio | 전화/SMS 발신 | Vonage, AWS SNS |
| Claude API | 알림 분류 AI | OpenAI GPT-4o-mini, Gemini Flash |
| CloudWatch API | AWS 알림 수집 | - |
| Datadog API | Datadog 알림 수집 | - |
| Sentry API | 에러 트래킹 연동 | - |
| SendGrid | 이메일 발송 (Digest) | Resend, AWS SES |

---

## 5. 비즈니스 요구사항 (Business Requirements)

### 5.1 수익 모델

**Freemium + Usage-based 하이브리드**

| 플랜 | 가격 | 포함 내용 |
|------|------|-----------|
| Free | $0/mo | 월 100개 알림 분류, Morning Digest, 이메일 알림만 |
| Pro | $9/mo | 월 5,000개 알림, Smart Wake (전화/SMS), 3개 서비스 연동 |
| Unlimited | $29/mo | 무제한 알림, 무제한 서비스, 우선 지원 |

**추가 과금**
- 전화 발신: $0.05/분 (Twilio 원가 + 20% 마진)
- SMS 발신: $0.02/건

**수익 목표**
- Y1 목표: 1,000 유료 사용자, $10k MRR
- Y2 목표: 5,000 유료 사용자, $50k MRR

### 5.2 시장 분석

**TAM (Total Addressable Market)**
- 글로벌 1인 SaaS 운영자: 약 50만 명 (추정)
- 연간 모니터링 도구 지출 평균: $200-500
- TAM: $100M - $250M

**SAM (Serviceable Addressable Market)**
- 영어권 + 한국어권 1인 개발자 중 유료 의지 있는 층: 약 10만 명
- SAM: $20M - $50M

**SOM (Serviceable Obtainable Market)**
- 초기 2년 내 확보 가능 시장: 5,000명
- SOM: $600k ARR

**경쟁 환경**
| 경쟁사 | 강점 | 약점 | 우리 차별점 |
|--------|------|------|-------------|
| PagerDuty | 엔터프라이즈 신뢰도 | 1인에게 과함, 비쌈($29+) | 1인 최적화, $9 가격 |
| Opsgenie | Atlassian 연동 | 팀 기능 중심 | 팀 기능 제거로 단순화 |
| Uptime Robot | 간단함 | 다운 여부만, 원인 분석 없음 | AI 분류로 원인 파악 |

### 5.3 Go-to-Market 전략

**Phase 1: 커뮤니티 침투 (Week 1-4)**
- Indie Hackers 포럼 글 게시 ("내가 새벽 장애에서 해방된 방법")
- Twitter/X 인디해커 인플루언서 시딩
- Product Hunt 런칭 준비

**Phase 2: 콘텐츠 마케팅 (Week 5-12)**
- "1인 SRE 가이드" 블로그 시리즈
- YouTube 튜토리얼 (설정 가이드)
- 인디해커 팟캐스트 게스트 출연

**Phase 3: 파트너십 (Week 13-24)**
- Railway, Vercel 등 PaaS 마켓플레이스 등록
- 인디해커 커뮤니티 스폰서십
- 한국: GeekNews 스폰서 광고

---

## 6. 마일스톤 (Milestones)

### Phase 1: MVP (Week 1-2)

**Week 1: 핵심 인프라**
- [ ] 프로젝트 셋업 (Go + PostgreSQL + Redis)
- [ ] CloudWatch 웹훅 수신 엔드포인트 구현
- [ ] Claude API 연동 - 알림 분류 프롬프트 개발
- [ ] 기본 분류 테스트 (샘플 알림 100개)

**Week 2: 알림 전달**
- [ ] Twilio 연동 - 전화/SMS 발신
- [ ] Smart Wake 로직 구현 (Quiet Hours 포함)
- [ ] Morning Digest 이메일 생성 및 발송
- [ ] 간단한 웹 대시보드 (알림 히스토리, 설정)

**MVP 완료 기준:**
- CloudWatch 알림 → AI 분류 → 전화/이메일 파이프라인 동작
- 본인 서비스에 연결하여 1주일간 테스트 완료

### Phase 2: Beta Launch (Week 3-4)

**Week 3: 확장 및 안정화**
- [ ] Datadog, Sentry 연동 추가
- [ ] 분류 피드백 UI 구현
- [ ] 과금 시스템 구현 (Stripe 연동)
- [ ] 랜딩 페이지 제작

**Week 4: 베타 런칭**
- [ ] 10명 베타 테스터 모집 (Indie Hackers 커뮤니티)
- [ ] 베타 피드백 수집 및 긴급 버그 수정
- [ ] Product Hunt 런칭 페이지 준비
- [ ] 런칭 블로그 포스트 작성

**Beta 완료 기준:**
- 10명 베타 사용자 1주일 사용
- Critical 분류 정확도 90% 이상 달성
- 치명적 버그 0건

---

## 7. 리스크 및 의존성 (Risks & Dependencies)

| 리스크 | 영향도 | 발생 가능성 | 대응 방안 |
|--------|--------|-------------|-----------|
| AI 분류 오류로 Critical 알림 누락 | 치명적 | 중간 | 초기에는 모든 알림을 기본적으로 Warning 이상으로 분류, 점진적으로 신뢰도 향상 후 조정 |
| Twilio 장애로 전화 발신 불가 | 높음 | 낮음 | 백업 SMS 채널 자동 전환, 이메일 폴백 |
| Claude API 비용 급증 | 중간 | 중간 | 캐싱 레이어 도입, 유사 알림 그룹화 후 대표 1건만 AI 분류 |
| 경쟁사(PagerDuty 등)가 1인 플랜 출시 | 중간 | 낮음 | 인디해커 커뮤니티 내 브랜드 구축, 사용자 락인 |
| 1인 운영자 시장이 예상보다 작음 | 높음 | 중간 | 소규모 팀(2-5인)으로 타겟 확장 가능성 열어둠 |

**핵심 의존성:**
1. **Claude API 안정성**: 알림 분류의 핵심. 다운 시 서비스 전체 영향
2. **Twilio 신뢰성**: 긴급 알림 전달의 핵심
3. **사용자의 직접 경험**: 제품 개발자가 1인 서비스 운영 경험이 없으면 "진짜 긴급함"의 기준 설정 실패 가능

---

## 부록: Essence Track 관점

### 파괴하는 전제
> "서비스 운영은 팀이 해야 한다"

기존 SRE/DevOps 도구는 모두 팀을 가정한다. 온콜 로테이션, 에스컬레이션, 팀 대시보드... 하지만 인디해커 시대에 1인이 $50k MRR 서비스를 운영하는 것이 가능해졌다. 이들에게 "팀용 도구"는 과하고, "팀 없이도 잘 수 있는 도구"가 필요하다.

### 방치된 이유
- 1인 운영자 시장이 너무 작아서 기존 모니터링 회사들이 관심 없음
- "진짜 서비스면 팀이 있어야지"라는 업계 편견
- AI 코딩 도구 발전으로 1인 개발이 폭발적으로 늘어난 것은 최근 2-3년

### 비합리적 행동의 증거
- 인디해커들이 새벽에 Slack 알림을 수동으로 확인하며 잠을 못 잠
- "알림 끄면 불안해서" 무음 해제하고 자는 사람들
- 월 $29 내기 싫어서 $0 도구로 버티다 장애 놓치는 사람들

### 진정성 요구사항
이 제품은 반드시 **본인이 1인 서비스를 6개월 이상 운영해본 사람**이 만들어야 한다. 그렇지 않으면:
- "진짜 긴급"과 "무시해도 되는" 알림의 경계를 못 잡음
- 새벽에 깨어났을 때의 공포를 모름
- 사용자의 언어로 말할 수 없음
