# PRD: MemoryAPI Pro

> AI 앱 개발자가 월 $49를 내고 사용자별 장기 기억을 저장/검색하는 완전관리형 API 서비스

**문서 정보**
- 작성일: 2026-01-28
- 버전: 1.0
- 상태: Draft
- 트랙: Profit

---

## 1. 개요 (Overview)

### 1.1 문제 정의 (Problem Statement)
- **누가** 겪는 문제인가?
  - AI 챗봇, AI 에이전트를 만드는 인디해커 및 1인 개발자
  - 빠르게 프로토타입을 만들어야 하는 AI 스타트업 CTO
  - Langchain, LlamaIndex, CrewAI로 에이전트를 구축하는 개발자

- **무엇이** 문제인가?
  - "기억하는 AI"를 만들려면 벡터 데이터베이스 구축이 필수이지만 학습 곡선이 높음
  - Pinecone은 월 $70-700로 비용 부담, Weaviate Cloud도 $25-250/월 발생
  - supermemory 같은 오픈소스는 강력하지만 직접 호스팅/관리/스케일링 필요
  - 사용자별 세션 기억, 장기 프로필 저장 등 AI 에이전트 특화 기능 부재

- **왜** 문제인가? (비용/임팩트)
  - AI 앱 시장 폭발적 성장: 2025-2026년 AI 에이전트 스타트업 300% 증가
  - 인디해커/1인 개발자에게 인프라 구축 시간 = 치명적 기회비용
  - 벡터DB 직접 운영 시 월 20-40시간 DevOps 부담 (연간 $15,000-30,000 인건비)
  - "기억하는 AI"는 이제 사용자 기대치 → 없으면 경쟁력 상실

### 1.2 솔루션 요약 (Solution Summary)
- **핵심 가치 제안:** 5분 연동으로 AI 앱에 장기 기억을 추가하는 가장 쉽고 저렴한 API. Pinecone보다 저렴하고, supermemory보다 편리하며, AI 에이전트에 특화된 호스팅 메모리 솔루션.

### 1.3 성공 지표 (Success Metrics)
| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| 첫 수익 (Time to First Revenue) | 21일 내 | Stripe 결제 기록 |
| 월간 반복 매출 (MRR) | $4,900 (6개월) | Stripe MRR 대시보드 |
| API 호출 성공률 | > 99.9% | 내부 모니터링 |
| 평균 응답 시간 | < 100ms | p95 레이턴시 측정 |
| 고객 이탈률 (Churn) | < 5%/월 | 월간 해지 비율 |
| 개발자 NPS | > 50 | 분기별 사용자 설문 |

---

## 2. 타겟 사용자 (Target Users)

### 2.1 주요 페르소나

**페르소나 1: 재원 - AI 챗봇 인디해커**
- **직업/역할:** 풀스택 개발자, AI 기반 고객 지원 챗봇 SaaS 개발 중
- **인구통계:** 29세, 서울 거주, 프리랜서 + 사이드 프로젝트 병행
- **기술 수준:** Python/TypeScript 능숙, 벡터DB 경험 없음
- **주요 고충점:**
  - 사용자가 "지난주에 말했던 거 기억해?"라고 물으면 AI가 답하지 못함
  - Pinecone 시작 비용 $70/월이 프로토타입 단계에서 부담
  - supermemory 설치는 시도했지만 Docker, 인프라 관리에 시간 소모
- **현재 대안:** PostgreSQL + pgvector (직접 구축, 불완전)
- **기존 지출:** 없음 (MVP 단계), 출시 후 Pinecone $70/월 예상

**페르소나 2: 성훈 - AI 스타트업 CTO**
- **직업/역할:** 5명 팀 AI 스타트업 CTO, 고객 분석 AI 에이전트 개발
- **인구통계:** 35세, 강남 소재, Series Seed 유치 완료
- **기술 수준:** 풀스택 + ML 배경, 인프라 운영 경험 있음
- **주요 고충점:**
  - 사용자별 프로필과 대화 기록을 체계적으로 저장할 벡터DB 필요
  - Pinecone 사용 중이나 월 $300+ 비용과 cold start 이슈 불만
  - Langchain 연동 시 boilerplate 코드가 많아 개발 속도 저하
- **현재 대안:** Pinecone + 자체 래퍼 코드
- **기존 지출:** Pinecone $300/월 + 개발자 시간 월 20시간

### 2.2 사용자 시나리오

> **시나리오 1:** "재원은 `npm install memoryapi && memoryapi init` 두 명령으로 API 키를 받고, 10줄의 코드로 챗봇에 사용자별 장기 기억을 추가한다. 사용자가 '지난주에 추천해준 맛집'을 물으면 AI가 정확히 기억해서 답변한다."

> **시나리오 2:** "성훈은 기존 Langchain 프로젝트에 `from memoryapi import LangchainMemory`를 추가하고, 한 줄로 벡터 메모리를 교체한다. Pinecone에서 MemoryAPI로 마이그레이션 후 월 비용이 $300에서 $49로 감소한다."

> **시나리오 3:** "고객 분석 AI 에이전트가 수천 명의 사용자 프로필을 처리할 때, MemoryAPI의 자동 스케일링으로 성훈은 인프라 걱정 없이 비즈니스 로직에만 집중한다."

---

## 3. 기능 요구사항 (Functional Requirements)

### 3.1 MVP 필수 기능 (Must Have)

#### F1: 메모리 저장/검색 REST API
- **설명:** 텍스트를 벡터화하여 저장하고, 시맨틱 검색으로 관련 기억을 반환하는 핵심 API
- **사용자 스토리:** As an AI app developer, I want to store and retrieve user memories with simple API calls, so that my AI can remember past conversations.
- **수용 기준:**
  - [ ] `POST /memories` - 텍스트 저장 (자동 임베딩 생성)
  - [ ] `GET /memories/search?query=...` - 시맨틱 검색 (Top K 결과)
  - [ ] `DELETE /memories/:id` - 특정 메모리 삭제
  - [ ] 사용자별 네임스페이스 지원 (`user_id` 파라미터)
  - [ ] 메타데이터 필터링 (날짜, 태그, 커스텀 필드)
  - [ ] 응답 시간 p95 < 100ms

#### F2: AI 에이전트 특화 기능 (세션 기억 + 사용자 프로필)
- **설명:** 단순 벡터 저장을 넘어, AI 에이전트 워크플로우에 맞춘 구조화된 메모리 타입 제공
- **사용자 스토리:** As an AI agent developer, I want to manage session-based short-term memory and user profiles separately, so that my agent can provide contextual responses.
- **수용 기준:**
  - [ ] 세션 메모리: 대화 세션별 단기 기억 (TTL 설정 가능, 기본 24시간)
  - [ ] 사용자 프로필: 장기 저장되는 사용자 정보 (선호도, 특성)
  - [ ] 팩트 메모리: 구조화된 key-value 형태의 사실 저장
  - [ ] 메모리 타입별 별도 API 엔드포인트
  - [ ] 세션 → 프로필 자동 승격 기능 (중요 정보 장기 저장)

#### F3: SDK 및 프레임워크 통합
- **설명:** Langchain, LlamaIndex, CrewAI 등 인기 AI 프레임워크와 원클릭 연동
- **사용자 스토리:** As a developer using Langchain, I want to integrate MemoryAPI with minimal code changes, so that I can migrate from other vector stores easily.
- **수용 기준:**
  - [ ] Python SDK (`pip install memoryapi`)
  - [ ] TypeScript/JavaScript SDK (`npm install memoryapi`)
  - [ ] Langchain Memory 어댑터 (drop-in replacement)
  - [ ] LlamaIndex 인덱스 연동
  - [ ] CrewAI 에이전트 메모리 플러그인
  - [ ] 각 프레임워크별 퀵스타트 가이드

### 3.2 향후 기능 (Nice to Have)
- **자동 요약:** 대화 기록이 길어지면 자동으로 요약하여 저장
- **멀티모달 메모리:** 이미지, 오디오 임베딩 저장 지원
- **RAG 최적화:** Chunk 분할, 하이브리드 검색 (키워드 + 시맨틱)
- **대시보드:** 메모리 사용량, API 호출 통계 시각화
- **WebSocket 실시간 동기화:** 다중 클라이언트 간 메모리 동기화
- **GDPR 준수 도구:** 사용자 데이터 삭제 요청 자동 처리

### 3.3 명시적 제외 (Out of Scope)
- LLM 제공 (메모리만 담당, 추론은 사용자 책임)
- 자체 호스팅 버전 (SaaS 전용)
- 엔터프라이즈 온프레미스 배포
- 비개발자용 노코드 인터페이스

---

## 4. 기술 요구사항 (Technical Requirements)

### 4.1 시스템 아키텍처
```
[Client SDKs] -----> [API Gateway] -----> [Memory Service]
     |                    |                    |
     v                    v                    v
[Langchain/       [Rate Limiter]      [Embedding Service]
 LlamaIndex/           |                    |
 CrewAI]               v                    v
              [Auth Service] <-----> [PostgreSQL + pgvector]
                    |                       |
                    v                       v
              [Redis Cache]          [Object Storage]
```

- **임베딩 모델:** OpenAI text-embedding-3-small (기본), 커스텀 모델 지원 예정
- **벡터 저장:** PostgreSQL + pgvector (비용 효율, 검증된 기술)
- **캐싱:** 자주 조회되는 메모리는 Redis 캐싱 (레이턴시 최적화)
- **멀티테넌트:** 테넌트별 논리적 격리 (shared infra, isolated data)

### 4.2 기술 스택
| 레이어 | 기술 | 선택 이유 |
|--------|------|-----------|
| API Gateway | Cloudflare Workers | 글로벌 엣지, 저레이턴시, DDoS 보호 |
| Backend | Node.js + Hono | 경량, Edge 호환, 빠른 개발 |
| Embedding | OpenAI API | 검증된 품질, 간편한 연동 |
| Vector DB | Neon PostgreSQL + pgvector | 서버리스, 오토스케일, 비용 효율 |
| Cache | Upstash Redis | 서버리스, 글로벌 복제 |
| Queue | Upstash QStash | 비동기 임베딩 처리 |
| Auth | Clerk | 빠른 개발자 인증 구현 |
| 호스팅 | Cloudflare (API) + Vercel (Dashboard) | 글로벌 배포, 저비용 |

### 4.3 외부 의존성
- **OpenAI API:** 임베딩 생성 ($0.02/1M tokens)
- **Neon:** PostgreSQL + pgvector ($25/월 시작)
- **Upstash:** Redis + QStash ($10/월 시작)
- **Cloudflare Workers:** API 호스팅 (사용량 기반)
- **Stripe:** 결제 처리
- **Clerk:** 인증 서비스 ($25/월)

### 4.4 성능 요구사항
| 지표 | 목표 | 근거 |
|------|------|------|
| API 응답 시간 (p95) | < 100ms | 실시간 대화 경험 유지 |
| API 응답 시간 (p50) | < 50ms | 경쟁사 대비 우위 |
| 처리량 | 1,000 RPS/테넌트 | Pro 플랜 기준 |
| 가용성 | 99.9% | SLA 보장 |
| 데이터 내구성 | 99.99% | PostgreSQL 복제 |

---

## 5. 비즈니스 요구사항 (Business Requirements)

### 5.1 수익 모델
| 플랜 | 가격 | 포함 기능 |
|------|------|-----------|
| Hobby | $29/월 | 10K API calls, 100K 메모리, 1 프로젝트, 커뮤니티 지원 |
| Pro | $49/월 | 50K API calls, 500K 메모리, 5 프로젝트, 이메일 지원, 세션/프로필 기능 |
| Scale | $149/월 | 500K API calls, 5M 메모리, 무제한 프로젝트, 우선 지원, SLA 99.9% |
| Enterprise | 협의 | 무제한, 전용 인프라, 맞춤 SLA, 전담 엔지니어 |

**초과 사용 요금:**
- API 호출: $0.001/call (Hobby), $0.0008/call (Pro), $0.0005/call (Scale)
- 메모리 저장: $0.01/1K 메모리/월

**가격 책정 근거:**
- Pinecone Starter: $70/월 (무제한 벡터 제한적) → MemoryAPI Pro: $49/월 = 30% 저렴
- Weaviate Cloud: $25-250/월 → 비슷한 가격대, 더 많은 AI 에이전트 특화 기능
- supermemory 셀프 호스팅: 무료 + 인프라 $50-200/월 + 관리 시간 → 동등 이상 가치

### 5.2 단위 경제 (Unit Economics)
- **CAC (Customer Acquisition Cost):** $40
  - 콘텐츠 마케팅 (블로그, 튜토리얼): $15
  - Product Hunt / Hacker News: $0
  - 개발자 커뮤니티 광고: $25

- **LTV (Lifetime Value):** $588
  - 평균 구독 기간: 12개월 (API 의존성으로 이탈 낮음)
  - 평균 월 결제: $49 (Pro 플랜 기준)
  - LTV = $49 x 12 = $588

- **LTV/CAC Ratio:** 14.7x (목표 > 3x, 매우 건강함)

- **Payback Period:** 0.8개월 (첫 월 결제로 CAC 회수)

- **Gross Margin:** 75%
  - 월 매출 $49 - 인프라 비용 ~$12 (OpenAI, Neon, Upstash) = $37 마진
  - OpenAI 임베딩 비용이 주요 변동 비용

### 5.3 시장 분석
- **TAM (Total Addressable Market):** $12B
  - 글로벌 벡터 데이터베이스 및 AI 인프라 시장 (2026년)

- **SAM (Serviceable Addressable Market):** $1.2B
  - 중소규모 AI 앱 개발자, 스타트업 시장 (TAM의 10%)

- **SOM (Serviceable Obtainable Market):** $6M
  - 첫 2년 목표: SAM의 0.5% 점유

- **경쟁사:**
  | 경쟁사 | 강점 | 약점 | 가격 |
  |--------|------|------|------|
  | Pinecone | 시장 선도, 안정성 | 비쌈, AI 에이전트 특화 X | $70-700/월 |
  | Weaviate Cloud | 오픈소스 기반, 유연 | 복잡한 설정 | $25-250/월 |
  | Chroma Cloud | 경량, 개발자 친화 | 기능 제한적 | $25-100/월 |
  | supermemory | 오픈소스, 무료 | 셀프 호스팅 필요 | 무료 (호스팅 별도) |
  | Zep | AI 에이전트 특화 | 신규, 안정성 미검증 | $50-200/월 |

- **차별화 포인트:**
  1. **AI 에이전트 특화:** 세션 기억, 사용자 프로필, 팩트 메모리 등 구조화된 메모리 타입
  2. **원클릭 통합:** Langchain, LlamaIndex, CrewAI 공식 어댑터 제공
  3. **합리적 가격:** Pinecone의 30% 비용, supermemory의 편의성
  4. **완전 관리형 + SLA:** 호스팅, 스케일링, 모니터링 모두 포함
  5. **개발자 경험:** 5분 온보딩, 명확한 문서, 활성 커뮤니티

### 5.4 Go-to-Market 전략

**초기 사용자 확보 방법:**
1. **콘텐츠 마케팅 (Week 1-4)**
   - "Pinecone vs MemoryAPI: 비용 50% 절감하면서 AI에 기억 추가하기" 블로그
   - "Langchain으로 기억하는 챗봇 만들기 (10분 튜토리얼)" 시리즈
   - "supermemory를 셀프 호스팅 없이 사용하는 법" 비교 가이드

2. **개발자 커뮤니티 (Week 3-6)**
   - Hacker News "Show HN: MemoryAPI - Memory as a Service for AI Apps"
   - Reddit r/LocalLLaMA, r/LangChain 소개
   - Discord 개발자 서버 (AI Builders, Langchain Community)

3. **프레임워크 생태계 (Week 5-8)**
   - Langchain 공식 Integration 등록
   - LlamaIndex Hub 등록
   - CrewAI 공식 플러그인 PR 제출

4. **인플루언서 파트너십 (Month 2-3)**
   - AI/ML 유튜버 스폰서십 (Fireship, AI Jason 등)
   - 인디해커 뉴스레터 광고 (Indie Hackers, SaaS Weekly)

**마케팅 채널:**
| 채널 | 예상 CAC | 우선순위 |
|------|----------|----------|
| Organic (SEO/콘텐츠) | $15 | 높음 |
| Hacker News / Product Hunt | $0 | 높음 |
| 개발자 커뮤니티 (Reddit, Discord) | $25 | 높음 |
| YouTube 스폰서십 | $60 | 중간 |
| 뉴스레터 광고 | $80 | 중간 |
| Twitter/X 광고 | $50 | 낮음 |

---

## 6. 마일스톤 (Milestones)

### Phase 1: MVP (Week 1-3)
- [ ] 핵심 REST API 개발 (저장/검색/삭제)
- [ ] PostgreSQL + pgvector 스키마 설계
- [ ] OpenAI 임베딩 연동
- [ ] API 키 인증 구현
- [ ] Python SDK v0.1
- [ ] **Week 3: 내부 베타 테스트**

### Phase 2: Beta Launch (Week 4-5)
- [ ] TypeScript SDK v0.1
- [ ] 세션 메모리 + 사용자 프로필 기능
- [ ] Langchain 어댑터
- [ ] Stripe 결제 연동
- [ ] 5개 베타 팀 온보딩
- [ ] **First revenue target: $145 (5 Hobby 플랜)**

### Phase 3: Public Launch (Week 6-8)
- [ ] Product Hunt 런칭
- [ ] LlamaIndex, CrewAI 어댑터
- [ ] 문서 사이트 완성
- [ ] 기본 대시보드
- [ ] **MRR target: $980 (20 혼합 플랜)**

### Phase 4: Growth (Month 3-6)
- [ ] Scale 플랜 출시
- [ ] 자동 요약 기능
- [ ] 대시보드 고도화 (사용량 분석)
- [ ] SOC 2 Type 1 준비
- [ ] **MRR target: $4,900 (100 고객)**

---

## 7. 리스크 및 의존성 (Risks & Dependencies)

| 리스크 | 영향도 | 발생 확률 | 대응 방안 |
|--------|--------|-----------|-----------|
| OpenAI API 가격 인상 | 높음 | 중간 | 다중 임베딩 모델 지원 (Cohere, Voyage), 자체 모델 옵션 |
| Pinecone 가격 인하 대응 | 높음 | 낮음 | AI 에이전트 특화 기능으로 차별화, 가격 외 가치 강조 |
| supermemory 호스팅 버전 출시 | 높음 | 중간 | 먼저 시장 점유, 더 나은 DX와 통합 생태계 구축 |
| 느린 개발자 획득 | 중간 | 중간 | 프레임워크 공식 통합으로 유기적 유입, 무료 체험 확대 |
| 벡터DB 성능 이슈 | 중간 | 낮음 | pgvector 최적화, 필요시 전용 벡터DB로 마이그레이션 |
| GDPR/개인정보 규제 | 중간 | 중간 | 데이터 삭제 API 제공, EU 리전 옵션, 규정 준수 문서화 |

**주요 의존성:**
- OpenAI Embedding API 가용성
- Neon PostgreSQL 안정성
- Cloudflare Workers 성능
- Langchain/LlamaIndex API 호환성 유지

---

## 부록 A: API 설계 명세

### 핵심 엔드포인트

```
# 메모리 저장
POST /v1/memories
{
  "content": "사용자가 피자를 좋아한다고 함",
  "user_id": "user_123",
  "type": "profile",  // session | profile | fact
  "metadata": {"category": "food_preference"}
}

# 메모리 검색
GET /v1/memories/search?query=음식 취향&user_id=user_123&limit=5

# 메모리 삭제
DELETE /v1/memories/{memory_id}

# 사용자별 전체 삭제 (GDPR)
DELETE /v1/users/{user_id}/memories
```

### SDK 예시 (Python)

```python
from memoryapi import MemoryAPI

client = MemoryAPI(api_key="mk_...")

# 메모리 저장
client.add(
    content="사용자는 채식주의자입니다",
    user_id="user_123",
    type="profile"
)

# 메모리 검색
results = client.search(
    query="식단 선호도",
    user_id="user_123",
    limit=5
)

# Langchain 통합
from memoryapi.integrations import LangchainMemory
memory = LangchainMemory(api_key="mk_...")
```

## 부록 B: 경쟁사 상세 비교

| 기능 | MemoryAPI Pro | Pinecone | Weaviate Cloud | supermemory |
|------|--------------|----------|----------------|-------------|
| 월 가격 (50K calls) | $49 | $70+ | $75 | 무료+호스팅 |
| 설정 시간 | 5분 | 15분 | 30분 | 2시간+ |
| AI 에이전트 특화 | O | X | X | O |
| 세션/프로필 분리 | O | X | X | 일부 |
| Langchain 통합 | 공식 | 공식 | 공식 | 비공식 |
| LlamaIndex 통합 | 공식 | 공식 | 공식 | X |
| CrewAI 통합 | 공식 | X | X | X |
| SLA | 99.9% | 99.9% | 99.5% | X |
| 호스팅 관리 | 완전 관리 | 완전 관리 | 완전 관리 | 셀프 |

## 부록 C: 첫 45일 세부 로드맵

**Week 1:**
- Day 1-2: 프로젝트 셋업, Cloudflare Workers 구성
- Day 3-4: PostgreSQL + pgvector 스키마, Neon 연동
- Day 5-7: 기본 CRUD API (저장/검색/삭제)

**Week 2:**
- Day 8-10: OpenAI 임베딩 연동, 벡터 검색 최적화
- Day 11-12: API 키 인증, 사용량 추적
- Day 13-14: Python SDK v0.1 개발

**Week 3:**
- Day 15-17: 세션 메모리, 사용자 프로필 기능
- Day 18-19: 내부 테스트, 성능 튜닝
- Day 20-21: TypeScript SDK v0.1

**Week 4:**
- Day 22-24: Langchain 어댑터 개발
- Day 25-26: Stripe 결제 연동
- Day 27-28: 베타 사용자 온보딩

**Week 5:**
- Day 29-31: 피드백 반영, 버그 수정
- Day 32-35: 문서 사이트 완성, 퀵스타트 가이드

**Week 6:**
- Day 36-38: LlamaIndex, CrewAI 어댑터
- Day 39-40: Product Hunt 준비 (스크린샷, 영상)
- Day 41-42: Product Hunt 런칭

**Week 7:**
- Day 43-45: 런칭 피드백 대응, 첫 유료 고객 온보딩
