# /prd - 데일리 인사이트 파이프라인

1인 개발자를 위한 데일리 트렌드 다이제스트를 수집, 분석, 배포합니다.

## 실행 순서

```
/prd
  │
  ├─▶ Step 1: /collect (리소스 수집)
  │     └─▶ 9개 소스에서 최신 트렌드 수집
  │     └─▶ Product Hunt 상위 10개 Deep Crawl
  │     └─▶ generated/sources/{날짜}.json 저장
  │
  ├─▶ Step 2: /analyze (데일리 다이제스트)
  │     └─▶ 오늘의 핵심 흐름 3줄 요약
  │     └─▶ 각 항목별 요약 + 이미지
  │     └─▶ 교차 분석 키 테마
  │     └─▶ generated/insights/{날짜}.md 저장
  │
  └─▶ Step 3: 블로그 동기화 및 배포
        ├─▶ npm run sync
        ├─▶ git commit
        └─▶ git push (Vercel 자동 배포)
```

---

## Step 1: 리소스 수집 (/collect)

다음 소스에서 데이터를 수집합니다:

| 소스 | 수집 방법 | 핵심 추출 필드 |
|------|----------|---------------|
| Product Hunt | **GraphQL API** (권장) | name, tagline, upvotes, makers, pricing, yc_batch |
| Hacker News | WebFetch | title, points, comments, relevance_to_indie, key_insight |
| Indie Hackers | WebFetch | title, revenue, build_time, strategy, founder_type |
| GitHub Trending | WebFetch | repo, stars, stars_today, language, description |
| GeekNews | WebFetch | title, url, comments |
| Dev.to | WebFetch | title, tags, reactions |
| TechCrunch | WebFetch | title, category |
| YouTube | API v3 | title, channel, views (config.json API 키 필요) |

**Product Hunt Deep Crawl:**
- 상위 10개 제품에 대해 상세 페이지 크롤링
- 추출: full_description, pricing_details, maker_info, target_audience, differentiator

**출력:** `generated/sources/{YYYY-MM-DD}.json`

---

## Step 2: 데일리 다이제스트 (/analyze)

수집된 데이터를 1인 개발자 관점으로 정리합니다.

### 출력 구조

```markdown
# 데일리 인사이트 - {날짜}

## 오늘의 흐름
> **한 줄 요약**: [전체를 관통하는 메시지]

1. **[키워드1]**: [한 줄 설명]
2. **[키워드2]**: [한 줄 설명]
3. **[키워드3]**: [한 줄 설명]

---

## Product Hunt Today

### 1. [제품명] ⬆️ {votes}
![thumbnail]({이미지URL})
**"{tagline}"**

| 항목 | 내용 |
|------|------|
| 타겟 | [누구를 위한 제품] |
| 차별화 | [기존 대비 뭐가 다른가] |
| 수익화 | [free/freemium/paid] |
| 메이커 | [몇 명, 배경] |

**1인 개발자가 배울 점**: [한 줄]

---

## Hacker News Highlights

### [제목] 🔥 {points}pts / {comments} comments
**카테고리**: [technical/startup/ai/tools/discussion]
**관련성**: [high/medium/low]

> **핵심 인사이트**: [1인 개발자에게 어떤 의미인가]

---

## Indie Hackers 수익화 신호

### 💰 [{제목}]({url})

| 지표 | 값 |
|------|-----|
| 수익 | {revenue} |
| 빌딩 기간 | {build_time} |
| 전략 | {strategy} |

**핵심 교훈**: [이 사례에서 배울 점]

---

## GitHub Trending

| 리포 | 스타 | 언어 | 왜 뜨는가 |
|------|------|------|----------|
| [{repo}]({url}) | ⭐ {stars} (+{today}) | {lang} | [한 줄] |

---

## 기타 소스 하이라이트

**GeekNews**: [제목]: [한 줄]
**Dev.to**: [제목]: [태그] - [한 줄]
**TechCrunch**: [제목]: [한 줄]

---

## 교차 분석: 오늘의 키 테마

### 테마 1: [키워드]
- **출처**: [PH: 제품명], [HN: 제목], [IH: 제목]
- **의미**: [1인 개발자에게 왜 중요한가]
- **기회/경고**: [액션 아이템]
```

**출력:** `generated/insights/{YYYY-MM-DD}.md`

---

## Step 3: 블로그 동기화 및 배포

다이제스트 생성 완료 후 자동 배포:

```bash
# 콘텐츠 동기화
npm run sync

# Git 커밋 및 푸시
git add -A
git commit -m "Daily PRD update: {YYYY-MM-DD}"
git push
```

Vercel이 push 감지 시 자동 빌드 및 배포합니다.

---

## 커맨드 옵션

| 옵션 | 설명 |
|------|------|
| `/prd` | 전체 파이프라인 실행 (수집 → 분석 → 배포) |
| `/prd --skip-collect` | 기존 수집 데이터로 분석만 실행 |
| `/analyze` | 분석만 단독 실행 |
| `/analyze --quick` | 3줄 요약 + 키 테마만 |
| `/collect` | 수집만 단독 실행 |

---

## 출력 예시

```
═══════════════════════════════════════════════════════════════════════════════
                    DAILY INSIGHT PIPELINE
═══════════════════════════════════════════════════════════════════════════════

[Step 1/3] 📥 Collecting resources...
  ✓ Product Hunt (API): 10 items
  ✓ Product Hunt Deep Crawl: 10 items
  ✓ Hacker News: 15 items
  ✓ GitHub Trending: 9 items
  ✓ Indie Hackers: 10 items
  ✓ GeekNews: 10 items
  ✓ Dev.to: 10 items
  ✓ TechCrunch: 6 items
  → Saved: generated/sources/2026-01-28.json

[Step 2/3] 🔍 Generating daily digest...
  ✓ Executive summary: 3 key trends
  ✓ Product Hunt: 10 products analyzed
  ✓ Hacker News: 5 high-relevance items
  ✓ Indie Hackers: 3 monetization signals
  ✓ GitHub: 5 trending repos
  ✓ Cross-source themes: 2 identified
  → Saved: generated/insights/2026-01-28.md

[Step 3/3] 🚀 Deploying to blog...
  ✓ npm run sync
  ✓ git commit -m "Daily PRD update: 2026-01-28"
  ✓ git push

═══════════════════════════════════════════════════════════════════════════════
                              COMPLETE
═══════════════════════════════════════════════════════════════════════════════
Output files:
  📄 generated/sources/2026-01-28.json
  📄 generated/insights/2026-01-28.md
  🌐 https://your-site.vercel.app/insights/2026-01-28
═══════════════════════════════════════════════════════════════════════════════
```

---

## 에러 처리

- 특정 소스 수집 실패 → 해당 소스 건너뛰고 계속 진행
- Product Hunt API 실패 → WebFetch 폴백 시도
- 이미지 URL 없음 → 텍스트만 출력

---

## 파일 구조

```
generated/
├── sources/
│   └── {YYYY-MM-DD}.json    # 수집된 원본 데이터
└── insights/
    └── {YYYY-MM-DD}.md      # 데일리 다이제스트
```
