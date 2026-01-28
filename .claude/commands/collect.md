# /collect - 리소스 수집 커맨드 (Deep Crawling)

오늘 날짜의 최신 트렌드 리소스를 **2단계 딥 크롤링**으로 수집합니다.

## 핵심 원칙

```
❌ 기존 방식 (표면적 수집)
   "Prism" - 393 points - OpenAI
   → 이게 뭔지, 왜 중요한지 모름

✅ 개선 방식 (딥 크롤링)
   "Prism" - OpenAI의 과학 연구 워크스페이스
   → 핵심: 논문 작성 + AI 통합, 학술계 타겟
   → 왜 트렌딩: 기존 도구들의 파편화 해결
   → MVP 기회: 특정 분야(법률/의료) 특화 버전
```

---

## 수집 대상 (9개 소스)

| 소스 | URL | 유형 | 딥크롤 대상 |
|------|-----|------|------------|
| Product Hunt | https://www.producthunt.com/feed | 인기 제품 | 상위 5개 제품 페이지 |
| Hacker News | https://news.ycombinator.com | Top Stories | 상위 5개 링크 |
| GitHub Trending | https://github.com/trending | 인기 저장소 | 상위 5개 README |
| GeekNews | https://news.hada.io | 기술 뉴스 | 상위 5개 원문 |
| Dev.to | https://dev.to | 개발 아티클 | 상위 3개 글 |
| Lobsters | https://lobste.rs | 기술 커뮤니티 | 상위 3개 링크 |
| Indie Hackers | https://www.indiehackers.com | 스타트업 인사이트 | 상위 3개 글 |
| TechCrunch | https://techcrunch.com/feed/ | 스타트업 뉴스 | 상위 3개 기사 |
| YouTube Trending | YouTube Data API v3 | 인기 영상 | 상위 5개 영상 설명 |

---

## 실행 지침

### Step 1: 1차 수집 (Surface-level)

각 소스에서 **타이틀 + URL 목록**을 병렬로 수집합니다.

```
WebFetch를 사용하여 9개 소스에서 병렬 수집
```

**각 소스별 1차 수집 프롬프트:**

**Product Hunt:**
```
Extract today's top 10 products. For each return:
- name
- tagline
- product_url (the /products/xxx link)
- upvotes (if visible)
Format as numbered list with URLs.
```

**Hacker News:**
```
Extract top 15 stories. For each return:
- title
- points
- comments count
- external_url (the actual article link, not the HN discussion link)
Format as numbered list with URLs.
```

**GitHub Trending:**
```
Extract top 10 trending repos. For each return:
- owner/repo
- description
- language
- stars today
- repo_url
Format as numbered list with URLs.
```

**GeekNews:**
```
Extract top 10 articles. For each return:
- title (Korean)
- original_url (the external link)
- brief summary
Format as numbered list with URLs.
```

**Dev.to:**
```
Extract top 10 articles. For each return:
- title
- author
- article_url
- tags
- reactions count
Format as numbered list with URLs.
```

**Lobsters:**
```
Extract top 10 stories. For each return:
- title
- external_url
- points
- tags
Format as numbered list with URLs.
```

**Indie Hackers:**
```
Extract top 10 trending posts. For each return:
- title
- post_url
- brief description
Format as numbered list with URLs.
```

**TechCrunch:**
```
Extract latest 10 startup articles. For each return:
- title
- article_url
- brief summary
Format as numbered list with URLs.
```

---

### Step 2: 2차 수집 (Deep Crawling)

1차 수집에서 얻은 **상위 아이템들의 URL에 직접 접근**하여 본문을 크롤링합니다.

#### 딥 크롤링 대상 선정 기준

| 소스 | 딥크롤 개수 | 선정 기준 |
|------|------------|----------|
| Product Hunt | 5개 | 상위 5개 제품 |
| Hacker News | 5개 | points 상위 5개 |
| GitHub | 5개 | stars 상위 5개 README |
| GeekNews | 5개 | 상위 5개 원문 |
| Dev.to | 3개 | reactions 상위 3개 |
| Lobsters | 3개 | points 상위 3개 |
| Indie Hackers | 3개 | 상위 3개 |
| TechCrunch | 3개 | 상위 3개 |

**총 딥크롤: 약 32개 URL**

#### 딥 크롤링 프롬프트

각 URL에 WebFetch로 접근할 때 사용할 프롬프트:

**일반 기사/블로그:**
```
Analyze this article and extract:

1. **Core Problem**: What problem does this solve or discuss?
2. **Key Insight**: What's the main takeaway or unique perspective?
3. **Why Trending**: Why is this getting attention NOW? (timing, relevance)
4. **Target Audience**: Who benefits most from this?
5. **MVP Opportunity**: What product/service opportunity does this suggest?
6. **Key Quotes**: 1-2 important sentences that capture the essence
7. **Related Trends**: What broader trends does this connect to?

Format as structured JSON.
```

**GitHub README:**
```
Analyze this GitHub repository and extract:

1. **What it does**: Core functionality in 1-2 sentences
2. **Key Features**: Top 3 unique features
3. **Tech Stack**: Main technologies used
4. **Why Trending**: Why is this gaining stars NOW?
5. **Use Cases**: Who would use this and for what?
6. **Integration Opportunities**: What could be built on top of this?
7. **Gaps/Limitations**: What's missing that could be an opportunity?

Format as structured JSON.
```

**Product Hunt 제품:**
```
Analyze this product and extract:

1. **Problem Solved**: What pain point does this address?
2. **Solution**: How does it solve it?
3. **Target User**: Specific persona (not just "developers")
4. **Pricing Model**: Free/Freemium/Paid and price points
5. **Differentiator**: What makes this unique vs alternatives?
6. **Why Now**: Why is this product relevant today?
7. **Potential Weaknesses**: What could competitors do better?

Format as structured JSON.
```

**Indie Hackers 포스트:**
```
Analyze this indie hacker story and extract:

1. **Revenue/Traction**: Key numbers (MRR, users, etc.)
2. **Business Model**: How do they make money?
3. **Growth Strategy**: How did they acquire users?
4. **Key Lesson**: Main actionable insight for other builders
5. **Validation Method**: How did they validate before building?
6. **Time to First Revenue**: How long did it take?
7. **Replicable Elements**: What can others copy from this approach?

Format as structured JSON.
```

---

### Step 3: YouTube 딥 수집

YouTube Data API v3를 사용합니다.

> **환경변수:** `.env.local` 파일의 `YOUTUBE_API_KEY`
> **호출 방식:** `bash -c 'source .env.local && curl -s "..."'`

#### 트렌딩 영상 조회

```bash
bash -c 'source .env.local && curl -s "https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=KR&maxResults=10&videoCategoryId=28&key=${YOUTUBE_API_KEY}"'
```

#### YouTube 딥 분석 포인트

각 트렌딩 영상에서 추출할 정보:
- **title**: 영상 제목
- **description**: 설명 전문 (키워드, 해시태그 포함)
- **tags**: 태그 배열
- **viewCount**: 조회수
- **channelTitle**: 채널명
- **publishedAt**: 게시일

**분석 관점:**
```
1. 왜 이 영상이 트렌딩인가?
2. 어떤 키워드/주제가 반복되는가?
3. 조회수 대비 댓글 비율 (engagement)
4. 최근 7일 내 급상승 주제는?
```

---

### Step 4: 데이터 통합 및 맥락 추출

모든 수집이 완료되면 **크로스 소스 분석**을 수행합니다.

#### 크로스 소스 패턴 찾기

```
여러 소스에서 동시에 언급되는 주제를 식별:
- HN + GeekNews + Dev.to = 개발자 커뮤니티 관심사
- PH + Indie Hackers + TechCrunch = 스타트업 트렌드
- GitHub + HN = 기술 트렌드
```

#### 맥락 추출 질문

각 트렌드에 대해:
1. **왜 지금?** - 이 주제가 오늘 뜨는 이유
2. **누가 관심?** - 어떤 그룹이 주목하는가
3. **기존 해결책** - 현재 어떻게 해결하고 있는가
4. **Gap** - 무엇이 부족한가
5. **MVP 기회** - 어떤 제품을 만들 수 있는가

---

### Step 5: 데이터 저장

수집된 데이터를 `generated/sources/{YYYY-MM-DD}.json`에 저장합니다.

#### 저장 구조 (Deep Crawling 버전)

```json
{
  "date": "2026-01-28",
  "collected_at": "2026-01-28T10:00:00Z",
  "collection_depth": "deep",
  "total_items": 80,
  "deep_crawled_items": 32,

  "product_hunt": {
    "status": "success",
    "surface_items": [...],
    "deep_crawled": [
      {
        "name": "Prism",
        "tagline": "AI workspace for scientists",
        "url": "https://...",
        "deep_analysis": {
          "problem_solved": "Scientists juggle multiple tools for research",
          "solution": "Unified workspace with AI-assisted paper writing",
          "target_user": "Academic researchers and PhD students",
          "pricing": "Free tier + $29/mo Pro",
          "differentiator": "Integration with academic databases",
          "why_now": "LLMs now capable enough for scientific writing",
          "weaknesses": "May struggle with highly technical domains"
        }
      }
    ]
  },

  "hacker_news": {
    "status": "success",
    "surface_items": [...],
    "deep_crawled": [
      {
        "title": "Vibecoding 2년 후 수동 코딩으로 복귀",
        "url": "https://...",
        "points": 287,
        "deep_analysis": {
          "core_problem": "AI-generated code lacks structural consistency",
          "key_insight": "Speed gains don't offset debugging costs for complex projects",
          "why_trending": "Many devs hitting same wall after 1-2 years of AI coding",
          "target_audience": "Senior developers on complex codebases",
          "mvp_opportunity": "AI code quality checker / debt tracker",
          "key_quotes": ["AI writes code fast but I spend 3x time debugging"],
          "related_trends": ["Technical debt", "AI limitations", "Developer productivity"]
        }
      }
    ]
  },

  "cross_source_analysis": {
    "converging_themes": [
      {
        "theme": "AI Coding Fatigue",
        "sources": ["HN", "GeekNews", "Dev.to"],
        "summary": "개발자들이 AI 코딩 도구의 한계를 경험하고 있음",
        "mvp_opportunities": ["AI 코드 품질 분석기", "하이브리드 코딩 워크플로우 도구"]
      },
      {
        "theme": "Developer Tool Fragmentation",
        "sources": ["PH", "GitHub", "Indie Hackers"],
        "summary": "너무 많은 도구들이 파편화되어 있음",
        "mvp_opportunities": ["통합 대시보드", "도구 간 브릿지 서비스"]
      }
    ],
    "timing_factors": {
      "why_now": [
        "LLM API 가격 하락으로 AI 기반 도구 진입장벽 낮아짐",
        "원격근무 정착으로 비동기 협업 도구 수요 증가",
        "Anthropic $20B 펀딩으로 AI 도구 경쟁 심화"
      ]
    }
  },

  "key_trends": {
    "top_5": [
      {
        "trend": "AI Agent 폭발",
        "evidence": ["Moltbot viral", "Ralph PRD agent", "pi-mono toolkit"],
        "depth": "여러 소스에서 동시 언급, 실제 사용 사례 다수"
      }
    ]
  }
}
```

---

## 실행 흐름 요약

```
Step 1: Surface Collection (병렬, ~30초)
├── 9개 소스에서 타이틀 + URL 수집
└── 총 ~80개 아이템

Step 2: Deep Crawling (병렬, ~2-3분)
├── 상위 32개 URL에 WebFetch 접근
├── 본문 크롤링 + 맥락 추출
└── 구조화된 분석 데이터 생성

Step 3: YouTube API (~30초)
├── 트렌딩 영상 조회
└── 키워드/태그 분석

Step 4: Cross-Source Analysis
├── 소스 간 공통 주제 식별
├── 타이밍 요인 분석
└── MVP 기회 도출

Step 5: Save to JSON
└── generated/sources/{날짜}.json
```

---

## 출력 형식

```
═══════════════════════════════════════════════════════════════════════════════
               DEEP COLLECTION COMPLETE
═══════════════════════════════════════════════════════════════════════════════
Date: 2026-01-28
Surface Items: 80 | Deep Crawled: 32

───────────────────────────────────────────────────────────────────────────────
🔥 CONVERGING THEMES (여러 소스에서 동시 감지)
───────────────────────────────────────────────────────────────────────────────

1. AI Coding Fatigue [HN + GeekNews + Dev.to]
   → 핵심: AI 코드의 장기 유지보수 비용이 드러나고 있음
   → MVP 기회: AI 코드 품질 추적기, 하이브리드 워크플로우 도구

2. Developer Tool Fragmentation [PH + GitHub + Indie Hackers]
   → 핵심: 도구 파편화로 인한 컨텍스트 스위칭 비용
   → MVP 기회: 통합 대시보드, 브릿지 서비스

───────────────────────────────────────────────────────────────────────────────
📊 DEEP CRAWL HIGHLIGHTS
───────────────────────────────────────────────────────────────────────────────

[Hacker News] "Vibecoding 2년 후 수동 코딩으로 복귀" (287 pts)
  • 핵심 인사이트: AI 코드 속도 이점이 디버깅 비용으로 상쇄됨
  • 왜 트렌딩: 1-2년 AI 코딩 경험자들이 같은 벽에 부딪힘
  • MVP 기회: AI 코드 품질 분석 / 기술부채 추적기

[Product Hunt] "Moltbot" - The AI that actually does things
  • 문제: 기존 AI 어시스턴트는 조언만 하고 실행은 안 함
  • 차별화: 실제 쉘/파일시스템 접근, 작업 자동 실행
  • 약점: 보안 우려, 기업 환경 도입 어려움

[GitHub] "supermemory/supermemory" (15,561 stars)
  • 핵심: AI 시대를 위한 초고속 메모리 엔진
  • 왜 트렌딩: RAG 애플리케이션 증가로 메모리 레이어 수요 급증
  • 통합 기회: 기존 AI 앱에 메모리 레이어 추가 서비스

═══════════════════════════════════════════════════════════════════════════════
File saved: generated/sources/2026-01-28.json
Next step: Run /analyze to extract MVP insights
═══════════════════════════════════════════════════════════════════════════════
```

---

## 에러 처리

- 특정 URL 접근 실패 → 해당 아이템 `deep_analysis: null`로 표시하고 계속 진행
- Rate limit (429) → 해당 소스 건너뛰고 계속 진행
- Paywall/로그인 필요 → `"blocked": true` 표시
- YouTube API 실패 → `status: "failed"` 표시

---

## 예상 소요 시간

- Surface Collection: ~30초 (병렬)
- Deep Crawling: ~2-3분 (병렬, 32개 URL)
- YouTube API: ~30초
- **총: 약 3-4분**
