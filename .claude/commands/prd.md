# /prd - 전체 워크플로우 실행

리소스 수집부터 PRD 생성까지 전체 파이프라인을 한 번에 실행합니다.

## 커맨드 옵션

| 커맨드 | 설명 |
|--------|------|
| `/prd` | **투 트랙 실행** - 본질 + 수익화 페르소나 모두 실행 |
| `/prd:essence` | 본질 추구형 페르소나만 실행 |
| `/prd:profit` | 수익화 특화 페르소나만 실행 |

---

## 페르소나 설명

### 🧠 본질 추구형 (Essence)
- 파일: `generated/my-persona/essence-persona.md`
- 관점: "이 문제가 왜 존재하는가?"
- 평가 기준: 전제 파괴, 방치 이유, 비합리적 행동, 진정성
- 결과: 깊이 있는 문제 해결 아이디어

### 💰 수익화 특화 (Profit)
- 파일: `generated/my-persona/profit-persona.md`
- 관점: "누가, 얼마를, 왜 지불하는가?"
- 평가 기준: 지불자, 가격, 반복 매출, 첫 수익 속도
- 결과: 빠르게 돈 되는 아이디어

---

## 실행 순서

```
/prd (투 트랙)
  │
  ├─▶ Step 1: /collect (Deep Crawling)
  │     ├─▶ 1차: 9개 소스에서 타이틀 + URL 수집 (~80개)
  │     ├─▶ 2차: 상위 32개 URL에 WebFetch로 본문 크롤링
  │     ├─▶ 3차: Cross-source 분석 (공통 주제, 타이밍 요인)
  │     └─▶ generated/sources/{날짜}.json 저장 (deep_analysis 포함)
  │
  ├─▶ Step 2: /analyze (인사이트 추출) - 투 트랙 병렬 실행
  │     ├─▶ 🧠 Essence Track
  │     │     └─▶ 본질 추구형 페르소나 평가
  │     │     └─▶ generated/insights/{날짜}-essence.md 저장
  │     │
  │     └─▶ 💰 Profit Track
  │           └─▶ 수익화 특화 페르소나 평가
  │           └─▶ generated/insights/{날짜}-profit.md 저장
  │
  ├─▶ Step 3: /generate (PRD 생성) - 투 트랙 병렬 실행
  │     ├─▶ 🧠 Essence PRDs
  │     │     └─▶ generated/output/prd-{이름}-essence-{날짜}.md
  │     │
  │     └─▶ 💰 Profit PRDs
  │           └─▶ generated/output/prd-{이름}-profit-{날짜}.md
  │
  └─▶ Step 4: 블로그 동기화 및 배포
        ├─▶ npm run sync (콘텐츠를 pages/로 복사)
        ├─▶ git add -A
        ├─▶ git commit -m "Daily PRD update: {날짜}"
        └─▶ git push (Vercel 자동 배포 트리거)
```

---

## 실행 지침

### Step 1: 리소스 수집 (Deep Crawling)

**2단계 수집 프로세스:**

#### 1차 수집: Surface-level (병렬, ~30초)
| 소스 | URL | 딥크롤 대상 |
|------|-----|------------|
| Product Hunt | https://www.producthunt.com/feed | 상위 5개 |
| Hacker News | https://news.ycombinator.com | 상위 5개 |
| GitHub Trending | https://github.com/trending | 상위 5개 |
| GeekNews | https://news.hada.io | 상위 5개 |
| Dev.to | https://dev.to | 상위 3개 |
| Lobsters | https://lobste.rs | 상위 3개 |
| Indie Hackers | https://www.indiehackers.com | 상위 3개 |
| TechCrunch | https://techcrunch.com/feed/ | 상위 3개 |
| YouTube | YouTube Data API v3 | 상위 5개 |

#### 2차 수집: Deep Crawling (병렬, ~2-3분)
상위 32개 URL에 WebFetch로 접근하여 본문 크롤링 + 맥락 추출:
- `core_problem`: 어떤 문제를 다루는가
- `key_insight`: 핵심 인사이트
- `why_trending`: 왜 지금 뜨는가
- `mvp_opportunity`: 어떤 기회가 있는가

#### 3차: Cross-source 분석
- `converging_themes`: 여러 소스에서 동시 감지된 주제
- `timing_factors`: 왜 지금인지 근거

→ `generated/sources/{YYYY-MM-DD}.json` 저장 (deep_analysis 포함)

### Step 2: 인사이트 추출 (투 트랙)

**Deep Analysis 데이터를 적극 활용**하여 MVP 아이디어를 도출합니다:

1. **Deep Analysis 기반 클러스터링**
   - `deep_analysis.core_problem` 필드에서 반복되는 문제 패턴 식별
   - `cross_source_analysis.converging_themes` 활용

2. **Kill Zone 체크** - 대기업/기존 서비스와 경쟁 여부 확인
   - `deep_analysis.weaknesses`에서 기존 솔루션 약점 확인

3. **차별화 전략** - 니치/로컬/통합/가격/프라이버시 중 택1+
   - `deep_analysis.differentiator`와 `gaps_limitations` 참조

4. **"왜 지금?" 분석**
   - `deep_analysis.why_trending`, `why_now` 필드 활용
   - `cross_source_analysis.timing_factors` 참조

5. **교차 조합** - 최소 2개 소스의 deep_analysis 인사이트 조합
   - 단순 타이틀 조합 ❌, 인사이트 조합 ✅

6. **페르소나 평가 (서브에이전트)** - 선택된 트랙에 따라 실행

#### 🧠 Essence Track 평가 기준
```
Task 도구 호출 - subagent_type: "general-purpose"
페르소나 파일: generated/my-persona/essence-persona.md

5가지 질문:
1. 전제 파괴: 이 제품은 어떤 전제를 깨거나 드러내는가?
2. 방치 이유: 이 문제는 왜 지금까지 방치되었는가?
3. 비합리적 행동: 사용자가 지금 어떤 비합리한 행동을 하고 있는가?
4. 기능-가설 연결: 기능이 문제 가설과 직접 연결되는가?
5. 진정성: 만드는 사람이 문제를 겪어본 것처럼 보이는가?
```

#### 💰 Profit Track 평가 기준
```
Task 도구 호출 - subagent_type: "general-purpose"
페르소나 파일: generated/my-persona/profit-persona.md

7가지 질문:
1. 누가 돈을 내는가? - 지불자가 명확한가?
2. 얼마를 내는가? - 구체적 가격이 있는가?
3. 왜 지금 돈을 내는가? - 지불 동기가 강한가?
4. 이미 돈을 쓰고 있는가? - 기존 지출을 대체하는가?
5. 첫 수익까지 얼마나 걸리는가? - 30일 내 가능한가?
6. 반복 매출인가? - 구독/리텐션 구조인가?
7. 단위 경제가 맞는가? - CAC < LTV인가?
```

**출력 파일:**
- 본질 트랙: `generated/insights/{YYYY-MM-DD}-essence.md`
- 수익 트랙: `generated/insights/{YYYY-MM-DD}-profit.md`

### Step 3: PRD 생성 (투 트랙)

각 트랙의 상위 3개 아이디어에 대해 상세 PRD를 생성합니다:

PRD 구조:
1. 개요 (문제 정의, 솔루션, 성공 지표)
2. 타겟 사용자 (페르소나, 시나리오)
3. 기능 요구사항 (MVP 3개, 향후, 제외)
4. 기술 요구사항 (아키텍처, 스택)
5. 비즈니스 요구사항 (수익, 시장, GTM)
6. 마일스톤
7. 리스크
8. 부록

**출력 파일:**
- 본질 트랙: `generated/output/prd-{이름}-essence-{날짜}.md`
- 수익 트랙: `generated/output/prd-{이름}-profit-{날짜}.md`

### Step 4: 블로그 동기화 및 배포

PRD 생성이 완료되면 자동으로 블로그에 반영하고 배포합니다:

1. **콘텐츠 동기화** - `npm run sync` 실행
   - `insights/` → `pages/insights/`로 복사
   - `output/` → `pages/prd/`로 복사
   - `_meta.ts` 파일 자동 생성

2. **Git 커밋 및 푸시**
   ```bash
   git add -A
   git commit -m "Daily PRD update: {YYYY-MM-DD}"
   git push
   ```

3. **Vercel 자동 배포**
   - push 시 Vercel이 자동으로 빌드 및 배포

**실행 방법:**
```
Bash 도구로 다음 명령어를 순차 실행:
npm run sync && git add -A && git commit -m "Daily PRD update: {날짜}" && git push
```

---

## 출력 형식

### /prd (투 트랙) 실행 시:
```
═══════════════════════════════════════════════════════════════════════════════
                    PRD GENERATION WORKFLOW (DUAL TRACK)
═══════════════════════════════════════════════════════════════════════════════

[Step 1/4] 📥 Deep Crawling...

  1차 Surface Collection:
  ✓ Product Hunt: 10 items
  ✓ Hacker News: 15 items
  ✓ GitHub Trending: 10 items
  ✓ GeekNews: 10 items
  ✓ Dev.to: 10 items
  ✓ Indie Hackers: 10 items
  ✓ TechCrunch: 10 items
  ✓ YouTube Trending: 10 items

  2차 Deep Crawling (32 URLs):
  ✓ [HN] "Vibecoding 2년 후 수동 코딩으로 복귀" - deep_analysis 완료
  ✓ [PH] "Moltbot" - deep_analysis 완료
  ✓ [GitHub] "supermemory" - deep_analysis 완료
  ... (29 more)

  3차 Cross-source Analysis:
  ✓ Converging themes: 4개 감지
  ✓ Timing factors: 3개 식별

  → Saved: generated/sources/2026-01-26.json (80 items, 32 deep crawled)

[Step 2/4] 🔍 Analyzing insights...

  ───────────────────────────────────────────────────────────────────────────
  🧠 ESSENCE TRACK (본질 추구형)
  ───────────────────────────────────────────────────────────────────────────
  ✓ Trend clustering: 6 clusters
  ✓ Kill Zone check: 8 killed, 6 passed
  ✓ Persona evaluation (sub-agent)...
    → Idea #1: ✅ 추천 (5/5 passed)
    → Idea #2: ⚠️ 보완 필요 (3/5 passed)
    → Idea #3: ❌ 폐기 (1/5 passed)
  → Saved: generated/insights/2026-01-26-essence.md

  ───────────────────────────────────────────────────────────────────────────
  💰 PROFIT TRACK (수익화 특화)
  ───────────────────────────────────────────────────────────────────────────
  ✓ Trend clustering: 6 clusters
  ✓ Revenue model check: 4 strong, 8 weak
  ✓ Persona evaluation (sub-agent)...
    → Idea #1: ✅ 추천 (6/7 passed) - $49/mo potential
    → Idea #2: ✅ 추천 (5/7 passed) - $29/mo potential
    → Idea #3: ⚠️ 보완 필요 (4/7 passed)
  → Saved: generated/insights/2026-01-26-profit.md

[Step 3/4] 📝 Generating PRDs...

  🧠 ESSENCE PRDs:
  ✓ generated/output/prd-modubokji-essence-2026-01-26.md (18/20)
  ✓ generated/output/prd-localflash-essence-2026-01-26.md (17/20)
  ✓ generated/output/prd-mcpmarket-essence-2026-01-26.md (15/20)

  💰 PROFIT PRDs:
  ✓ generated/output/prd-reviewbot-profit-2026-01-26.md (17/20) - $49/mo
  ✓ generated/output/prd-invoiceai-profit-2026-01-26.md (16/20) - $29/mo
  ✓ generated/output/prd-leadgen-profit-2026-01-26.md (15/20) - $99/mo

[Step 4/4] 🚀 Deploying to blog...
  ✓ npm run sync - 콘텐츠 동기화 완료
  ✓ git add -A
  ✓ git commit -m "Daily PRD update: 2026-01-26"
  ✓ git push - Vercel 배포 트리거됨

═══════════════════════════════════════════════════════════════════════════════
                              COMPLETE (DUAL TRACK)
═══════════════════════════════════════════════════════════════════════════════
Output files:
  📄 generated/sources/2026-01-26.json

  🧠 ESSENCE TRACK:
  📄 generated/insights/2026-01-26-essence.md
  📄 generated/output/prd-modubokji-essence-2026-01-26.md
  📄 generated/output/prd-localflash-essence-2026-01-26.md
  📄 generated/output/prd-mcpmarket-essence-2026-01-26.md

  💰 PROFIT TRACK:
  📄 generated/insights/2026-01-26-profit.md
  📄 generated/output/prd-reviewbot-profit-2026-01-26.md
  📄 generated/output/prd-invoiceai-profit-2026-01-26.md
  📄 generated/output/prd-leadgen-profit-2026-01-26.md
═══════════════════════════════════════════════════════════════════════════════
```

### /prd:profit (단일 트랙) 실행 시:
```
═══════════════════════════════════════════════════════════════════════════════
                    PRD GENERATION WORKFLOW (💰 PROFIT TRACK)
═══════════════════════════════════════════════════════════════════════════════
...
```

---

## 커맨드 분기 처리

### 커맨드 파싱
- `/prd` → dual_track = true, tracks = ["essence", "profit"]
- `/prd:essence` → dual_track = false, tracks = ["essence"]
- `/prd:profit` → dual_track = false, tracks = ["profit"]

### 투 트랙 실행 시 병렬 처리
Step 2와 Step 3에서 두 서브에이전트를 **병렬**로 실행:
```
Task 도구를 두 번 호출 (같은 메시지에서):
1. Essence 평가 에이전트
2. Profit 평가 에이전트
```

---

## 옵션

| 옵션 | 설명 | 예시 |
|------|------|------|
| (기본) | 투 트랙 전체 실행 | `/prd` |
| `:essence` | 본질 트랙만 | `/prd:essence` |
| `:profit` | 수익 트랙만 | `/prd:profit` |
| `--skip-collect` | 기존 수집 데이터 사용 | `/prd --skip-collect` |
| `--ideas N` | 트랙당 PRD 생성 개수 | `/prd --ideas 5` |

---

## 에러 처리

- 특정 소스 수집 실패 → 해당 소스 건너뛰고 계속 진행
- 특정 트랙 분석 실패 → 해당 트랙 건너뛰고 다른 트랙 계속
- PRD 생성 실패 → 해당 아이디어 건너뛰고 계속 진행

---

## 파일명 규칙

| 파일 유형 | 본질 트랙 | 수익 트랙 |
|----------|-----------|-----------|
| 인사이트 | `generated/insights/{날짜}-essence.md` | `generated/insights/{날짜}-profit.md` |
| PRD | `generated/output/prd-{이름}-essence-{날짜}.md` | `generated/output/prd-{이름}-profit-{날짜}.md` |
