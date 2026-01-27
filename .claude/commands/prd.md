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
- 파일: `my-persona/essence-persona.md`
- 관점: "이 문제가 왜 존재하는가?"
- 평가 기준: 전제 파괴, 방치 이유, 비합리적 행동, 진정성
- 결과: 깊이 있는 문제 해결 아이디어

### 💰 수익화 특화 (Profit)
- 파일: `my-persona/profit-persona.md`
- 관점: "누가, 얼마를, 왜 지불하는가?"
- 평가 기준: 지불자, 가격, 반복 매출, 첫 수익 속도
- 결과: 빠르게 돈 되는 아이디어

---

## 실행 순서

```
/prd (투 트랙)
  │
  ├─▶ Step 1: /collect (리소스 수집)
  │     └─▶ 9개 소스에서 최신 트렌드 수집
  │     └─▶ sources/{날짜}.json 저장
  │
  ├─▶ Step 2: /analyze (인사이트 추출) - 투 트랙 병렬 실행
  │     ├─▶ 🧠 Essence Track
  │     │     └─▶ 본질 추구형 페르소나 평가
  │     │     └─▶ insights/{날짜}-essence.md 저장
  │     │
  │     └─▶ 💰 Profit Track
  │           └─▶ 수익화 특화 페르소나 평가
  │           └─▶ insights/{날짜}-profit.md 저장
  │
  ├─▶ Step 3: /generate (PRD 생성) - 투 트랙 병렬 실행
  │     ├─▶ 🧠 Essence PRDs
  │     │     └─▶ output/prd-{이름}-essence-{날짜}.md
  │     │
  │     └─▶ 💰 Profit PRDs
  │           └─▶ output/prd-{이름}-profit-{날짜}.md
  │
  └─▶ Step 4: 블로그 동기화 및 배포
        ├─▶ npm run sync (콘텐츠를 pages/로 복사)
        ├─▶ git add -A
        ├─▶ git commit -m "Daily PRD update: {날짜}"
        └─▶ git push (Vercel 자동 배포 트리거)
```

---

## 실행 지침

### Step 1: 리소스 수집

다음 9개 소스에서 병렬로 데이터를 수집합니다:

| 소스 | URL |
|------|-----|
| Product Hunt | https://www.producthunt.com/feed |
| Hacker News | https://news.ycombinator.com |
| GitHub Trending | https://github.com/trending |
| GeekNews | https://news.hada.io |
| Dev.to | https://dev.to/feed |
| Lobsters | https://lobste.rs |
| Indie Hackers | https://www.indiehackers.com |
| TechCrunch | https://techcrunch.com/feed/ |
| **YouTube Trending** | YouTube Data API v3 (config.json의 API 키 사용) |

WebFetch 또는 API를 사용하여 각 소스에서 최신 콘텐츠를 추출하고, `sources/{YYYY-MM-DD}.json`에 저장합니다.

### Step 2: 인사이트 추출 (투 트랙)

수집된 데이터를 분석하여 MVP 아이디어를 도출합니다:

1. **트렌드 클러스터링** - 공통 키워드/주제 그룹화
2. **Kill Zone 체크** - 대기업/기존 서비스와 경쟁 여부 확인
3. **차별화 전략** - 니치/로컬/통합/가격/프라이버시 중 택1+
4. **"왜 지금?" 분석** - 타이밍 근거
5. **교차 조합** - 최소 2개 소스 트렌드 조합
6. **페르소나 평가 (서브에이전트)** - 선택된 트랙에 따라 실행

#### 🧠 Essence Track 평가 기준
```
Task 도구 호출 - subagent_type: "general-purpose"
페르소나 파일: my-persona/essence-persona.md

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
페르소나 파일: my-persona/profit-persona.md

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
- 본질 트랙: `insights/{YYYY-MM-DD}-essence.md`
- 수익 트랙: `insights/{YYYY-MM-DD}-profit.md`

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
- 본질 트랙: `output/prd-{이름}-essence-{날짜}.md`
- 수익 트랙: `output/prd-{이름}-profit-{날짜}.md`

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

[Step 1/4] 📥 Collecting resources...
  ✓ Product Hunt: 10 items
  ✓ Hacker News: 15 items
  ✓ GitHub Trending: 9 items
  ✓ GeekNews: 10 items
  ✓ Dev.to: 10 items
  ✓ Indie Hackers: 10 items
  ✓ TechCrunch: 6 items
  ✓ YouTube Trending (API v3): 10 items
  → Saved: sources/2026-01-26.json (80 items)

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
  → Saved: insights/2026-01-26-essence.md

  ───────────────────────────────────────────────────────────────────────────
  💰 PROFIT TRACK (수익화 특화)
  ───────────────────────────────────────────────────────────────────────────
  ✓ Trend clustering: 6 clusters
  ✓ Revenue model check: 4 strong, 8 weak
  ✓ Persona evaluation (sub-agent)...
    → Idea #1: ✅ 추천 (6/7 passed) - $49/mo potential
    → Idea #2: ✅ 추천 (5/7 passed) - $29/mo potential
    → Idea #3: ⚠️ 보완 필요 (4/7 passed)
  → Saved: insights/2026-01-26-profit.md

[Step 3/4] 📝 Generating PRDs...

  🧠 ESSENCE PRDs:
  ✓ prd-modubokji-essence-2026-01-26.md (18/20)
  ✓ prd-localflash-essence-2026-01-26.md (17/20)
  ✓ prd-mcpmarket-essence-2026-01-26.md (15/20)

  💰 PROFIT PRDs:
  ✓ prd-reviewbot-profit-2026-01-26.md (17/20) - $49/mo
  ✓ prd-invoiceai-profit-2026-01-26.md (16/20) - $29/mo
  ✓ prd-leadgen-profit-2026-01-26.md (15/20) - $99/mo

[Step 4/4] 🚀 Deploying to blog...
  ✓ npm run sync - 콘텐츠 동기화 완료
  ✓ git add -A
  ✓ git commit -m "Daily PRD update: 2026-01-26"
  ✓ git push - Vercel 배포 트리거됨

═══════════════════════════════════════════════════════════════════════════════
                              COMPLETE (DUAL TRACK)
═══════════════════════════════════════════════════════════════════════════════
Output files:
  📄 sources/2026-01-26.json

  🧠 ESSENCE TRACK:
  📄 insights/2026-01-26-essence.md
  📄 output/prd-modubokji-essence-2026-01-26.md
  📄 output/prd-localflash-essence-2026-01-26.md
  📄 output/prd-mcpmarket-essence-2026-01-26.md

  💰 PROFIT TRACK:
  📄 insights/2026-01-26-profit.md
  📄 output/prd-reviewbot-profit-2026-01-26.md
  📄 output/prd-invoiceai-profit-2026-01-26.md
  📄 output/prd-leadgen-profit-2026-01-26.md
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
| 인사이트 | `insights/{날짜}-essence.md` | `insights/{날짜}-profit.md` |
| PRD | `output/prd-{이름}-essence-{날짜}.md` | `output/prd-{이름}-profit-{날짜}.md` |
