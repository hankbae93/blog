# /collect - 리소스 수집 커맨드

오늘 날짜의 최신 트렌드 리소스를 수집합니다.

## 수집 대상 (9개 소스)

| 소스 | URL | 유형 |
|------|-----|------|
| Product Hunt | https://www.producthunt.com/feed | 인기 제품 |
| Hacker News | https://news.ycombinator.com | Top Stories |
| GitHub Trending | https://github.com/trending | 인기 저장소 |
| GeekNews | https://news.hada.io | 기술 뉴스 |
| Dev.to | https://dev.to/feed | 개발 아티클 |
| Lobsters | https://lobste.rs | 기술 커뮤니티 |
| Indie Hackers | https://www.indiehackers.com | 스타트업 인사이트 |
| TechCrunch | https://techcrunch.com/feed/ | 스타트업 뉴스 |
| **YouTube Trending** | YouTube Data API v3 | 인기 영상 키워드 |

## 실행 지침

### 1. 오늘 날짜 확인
```bash
date +%Y-%m-%d
```

### 2. 병렬 수집 실행
WebFetch를 사용하여 각 소스에서 병렬로 데이터를 수집합니다.

각 소스별 수집 프롬프트:

**Product Hunt:** (API 우선, WebFetch 폴백)

**방법 1: GraphQL API (권장 - 차단 없음, 빠름, 상세정보 포함)**

> API 문서: https://api.producthunt.com/v2/docs
> **중요:** GraphQL API로 모든 상세 정보를 한 번에 가져옴 (Deep Crawl 불필요)

**환경변수 (`.env.local`):**
```bash
PRODUCTHUNT_API_KEY=xxx        # Client ID
PRODUCTHUNT_API_SECRET=xxx     # Client Secret
PRODUCTHUNT_ACCESS_TOKEN=xxx   # Bearer Token (아래 명령으로 발급)
```

**Access Token 발급/갱신 (토큰 만료 시):**
```bash
# Client Credentials Grant로 Access Token 발급
bash -c 'source .env.local && curl -s -X POST https://api.producthunt.com/v2/oauth/token \
  -H "Content-Type: application/json" \
  -d "{\"client_id\": \"${PRODUCTHUNT_API_KEY}\", \"client_secret\": \"${PRODUCTHUNT_API_SECRET}\", \"grant_type\": \"client_credentials\"}"'
```
→ 응답의 `access_token` 값을 `.env.local`의 `PRODUCTHUNT_ACCESS_TOKEN`에 저장

```bash
# API 호출 (bash -c 필수) - 상세 정보 포함
bash -c 'source .env.local && curl -s -X POST https://api.producthunt.com/v2/api/graphql \
  -H "Authorization: Bearer ${PRODUCTHUNT_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"{ posts(first: 10) { edges { node { id name slug tagline description url website votesCount commentsCount reviewsRating createdAt featuredAt topics { edges { node { name } } } makers { id name headline twitterUsername } thumbnail { url } media { url type } } } } }\"}"'
```

**GraphQL 쿼리 (전체 상세정보):**
```graphql
{
  posts(first: 10) {
    edges {
      node {
        # 기본 정보
        id
        name
        slug
        tagline
        description          # 제품 상세 설명
        url                  # Product Hunt URL
        website              # 제품 공식 웹사이트 URL

        # 지표
        votesCount
        commentsCount
        reviewsRating        # 평균 리뷰 점수

        # 시간
        createdAt
        featuredAt           # 피처드 일시 (Product of the Day 등)

        # 카테고리
        topics {
          edges {
            node { name }
          }
        }

        # 제작자 정보
        makers {
          id
          name
          headline           # "Founder at X", "CEO" 등
          twitterUsername
        }

        # 미디어
        thumbnail { url }
        media {
          url
          type              # "image", "video" 등
        }
      }
    }
  }
}
```

**API 응답에서 추출할 핵심 정보:**
| 필드 | 용도 |
|------|------|
| `description` | 제품 상세 설명 (full_description 대체) |
| `tagline` | value_proposition |
| `website` | 제품 공식 사이트 (랜딩페이지 분석용) |
| `makers.headline` | 제작자 역할 (Founder, CEO 등) |
| `reviewsRating` | 사용자 평가 점수 |
| `featuredAt` | Product of the Day 여부 판단 |
| `topics` | 카테고리/태그 |

**방법 2: WebFetch 폴백 (API 실패 시 - 제한적)**

> ⚠️ **주의:** WebFetch는 피드 페이지에서 **기본 정보만** 추출 가능합니다.
> Product Hunt 개별 제품 페이지는 JavaScript 동적 렌더링으로 WebFetch 불가!
> API Token이 없거나 만료된 경우에만 사용하세요.

**WebFetch URL:** `https://www.producthunt.com/` (메인 피드)

```
Extract today's top 10 products from the feed. For each product card visible:
- name: product name
- tagline: one-line description
- url: product page URL (do NOT attempt to crawl these individually!)
- makers: list of maker names visible on card
- upvotes: current vote count (number)
- comments: comment count (number)
- category: product category or tags if visible (array)
- badge: "Product of the Day", "#1", "#2" etc if any

Return as JSON array.
NOTE: Only extract what's visible on the feed page. Do NOT try to access individual product pages.
```

**WebFetch 제한사항:**
- 개별 제품 페이지 (`/products/xxx`, `/posts/xxx`) 접근 불가
- description, website, makers.headline 등 상세 정보 없음
- API Token 발급 권장: https://www.producthunt.com/v2/oauth/applications

**Hacker News:** (1인 개발자 관점에서 관련성 평가)
```
Extract top 10 stories with indie developer relevance analysis. For each:
- title: story title
- url: story URL
- points: upvote count (number)
- comments: comment count (number)
- category: "technical", "startup", "ai", "tools", "career", "discussion", "other"
- relevance_to_indie: "high", "medium", "low" (high = directly useful for solo devs building products)
- key_insight: one-line takeaway for indie developers (if applicable, null otherwise)

Return as JSON array. Prioritize stories about: building products, monetization, AI tools, developer experience, startup lessons.
```

**GitHub Trending:**
```
Extract top 10 trending repos. For each: owner/repo, description, language, stars. Format as numbered list.
```

**GeekNews:**
```
Extract top 10 articles. For each: title, URL, summary. Format as numbered list.
```

**Dev.to:**
```
Extract top 10 articles. For each: title, author, tags. Format as numbered list.
```

**Lobsters:**
```
Extract top 10 stories. For each: title, points, tags. Format as numbered list.
```

**Indie Hackers:** (수익화 중심 - 구체적인 숫자와 전략 추출)
```
Extract trending posts focused on MONETIZATION insights for solo developers. For each post:
- title: post title
- url: post URL
- revenue: MRR/ARR figures if mentioned (e.g. "$27k MRR", "$60k/mo", "5-figure ARR")
- build_time: development time if mentioned (e.g. "20 hours", "3 months", "weekend project")
- strategy: core strategy keyword (e.g. "Reddit SEO", "service-to-product", "multi-app portfolio", "open-source monetization")
- founder_type: "solo", "team", "bootstrapped" if mentioned
- problem_solved: one-line problem description

Return as JSON array. Focus on extracting concrete NUMBERS and STRATEGIES that indie hackers can learn from.
```

**TechCrunch:**
```
Extract latest 10 startup articles. For each: title, summary. Format as numbered list.
```

### 3. Product Hunt 상세 정보 (GraphQL API로 통합 수집)

> **중요:** 기존 WebFetch Deep Crawl 방식은 Product Hunt의 동적 렌더링/차단으로 실패합니다.
> GraphQL API에서 모든 상세 정보를 한 번에 가져오므로 **별도 Deep Crawl이 불필요**합니다.

**GraphQL API에서 가져오는 상세 정보:**

| 기존 Deep Crawl 필드 | GraphQL API 필드 | 비고 |
|---------------------|------------------|------|
| `full_description` | `description` | API에서 직접 제공 |
| `value_proposition` | `tagline` | 한 줄 설명 |
| `target_audience` | `topics` + `description` 분석 | AI가 추론 |
| `pricing_model` | `website` → 랜딩페이지 분석 | 필요시 website URL 확인 |
| `maker_names` | `makers.name` | 직접 제공 |
| `maker_titles` | `makers.headline` | "Founder", "CEO" 등 |
| `launch_date` | `featuredAt` / `createdAt` | 직접 제공 |
| `badge` | `featuredAt` 유무로 판단 | featuredAt이 있으면 피처드 |

**API 응답 데이터 구조 (통합):**
```json
{
  "product_hunt": {
    "source": "GraphQL API",
    "items": [
      {
        "id": "123456",
        "name": "Scout Out",
        "slug": "scout-out-2",
        "tagline": "60-second AI estimates that win more jobs",
        "description": "Upload building plans and Scout Out automatically generates accurate material and labor estimates...",
        "url": "https://www.producthunt.com/posts/scout-out-2",
        "website": "https://scoutout.ai",
        "votesCount": 450,
        "commentsCount": 32,
        "reviewsRating": 4.8,
        "createdAt": "2026-01-28T08:00:00Z",
        "featuredAt": "2026-01-28T08:00:00Z",
        "topics": ["Artificial Intelligence", "Construction", "Productivity"],
        "makers": [
          {
            "name": "Nolan Rossi",
            "headline": "Founder at Scout Out",
            "twitterUsername": "nolanrossi"
          }
        ],
        "thumbnail": "https://ph-files.imgix.net/...",
        "media": [
          {"url": "https://...", "type": "image"},
          {"url": "https://...", "type": "video"}
        ]
      }
    ]
  }
}
```

**Pricing 정보가 필요한 경우 (선택적):**
GraphQL API에는 pricing 필드가 없습니다. 필요시 `website` URL로 랜딩페이지를 확인하세요:
```
WebFetch로 website URL 접근 → pricing 정보 추출
(단, 모든 사이트가 WebFetch로 접근 가능한 것은 아님)
```

---

### 4. YouTube Trending 수집 (API 방식) - 확장형

YouTube Data API v3를 사용하여 **다중 카테고리, 다중 지역, 키워드 검색**으로 포괄적인 트렌드를 수집합니다.

> **스킬 참조:** `.claude/skills/youtube/SKILL.md`
> **API 할당량:** 하루 10,000 포인트 (videos.list: 1pt, search.list: 100pt)
> 아래 설정으로 약 500~800 포인트 사용 예상

#### 환경변수 로드 (필수)

**중요:** Claude Code에서 파이프(|)를 사용할 때 환경변수가 사라지는 버그가 있습니다.
반드시 `bash -c 'source .env.local && ...'` 형식으로 호출해야 합니다.

```bash
# 올바른 호출 방식
bash -c 'source .env.local && curl -s "https://www.googleapis.com/youtube/v3/videos?..." | jq .'

# 잘못된 호출 방식 (환경변수가 사라짐)
source .env.local && curl -s "..." | jq .
```

---

#### 3-1. 카테고리별 인기 영상 (videos.list)

**5개 카테고리 × 2개 지역 = 10회 API 호출**

| 카테고리 | ID | 설명 |
|----------|-----|------|
| Science & Technology | 28 | 기술/스타트업/AI |
| Education | 27 | 강의/튜토리얼/How-to |
| People & Blogs | 22 | 1인 개발자/브이로그 |
| News & Politics | 25 | 비즈니스/경제 뉴스 |
| How-to & Style | 26 | 생산성/라이프핵 |

**지역:**
- `KR` - 한국 (로컬 트렌드)
- `US` - 미국 (글로벌 트렌드)

**API 호출 명령어:**
```bash
# Trending 영상 조회 (카테고리별)
bash -c 'source .env.local && curl -s "https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode={REGION}&maxResults=15&videoCategoryId={CATEGORY_ID}&key=${YOUTUBE_API_KEY}"'
```

**병렬 호출할 URL 목록:**
```
# 한국 (KR)
1. regionCode=KR&videoCategoryId=28  (Science & Tech)
2. regionCode=KR&videoCategoryId=27  (Education)
3. regionCode=KR&videoCategoryId=22  (People & Blogs)
4. regionCode=KR&videoCategoryId=25  (News)
5. regionCode=KR&videoCategoryId=26  (How-to)

# 미국 (US)
6. regionCode=US&videoCategoryId=28  (Science & Tech)
7. regionCode=US&videoCategoryId=27  (Education)
8. regionCode=US&videoCategoryId=22  (People & Blogs)
9. regionCode=US&videoCategoryId=25  (News)
10. regionCode=US&videoCategoryId=26 (How-to)
```

---

#### 3-2. 키워드 기반 검색 (search.list)

**핵심 키워드로 최신 인기 영상 검색 (5회 호출 × 100pt = 500pt)**

| 검색어 | 목적 |
|--------|------|
| `indie hacker 2026` | 인디해커/1인개발 트렌드 |
| `AI startup SaaS` | AI/SaaS 스타트업 |
| `side project monetize` | 사이드프로젝트 수익화 |
| `developer tools productivity` | 개발자 도구 |
| `no code automation` | 노코드/자동화 |

**API 호출 명령어:**
```bash
# 키워드 검색 (7일 내 인기순)
bash -c 'source .env.local && curl -s "https://www.googleapis.com/youtube/v3/search?part=snippet&q={QUERY}&type=video&order=viewCount&publishedAfter={7일전ISO날짜}&maxResults=10&relevanceLanguage=en&key=${YOUTUBE_API_KEY}"'
```

**예시:**
```bash
bash -c 'source .env.local && curl -s "https://www.googleapis.com/youtube/v3/search?part=snippet&q=indie%20hacker&type=video&order=viewCount&publishedAfter=2026-01-21T00:00:00Z&maxResults=10&key=${YOUTUBE_API_KEY}"'
```

---

#### 3-3. 수집 프롬프트

**videos.list 결과:**
```
Extract video data. For each video return:
- title
- channelTitle
- viewCount
- tags (array)
- description (first 200 chars)
- publishedAt

Focus on extracting keywords related to: startup, SaaS, AI, indie, developer, productivity, automation.
Format as JSON array.
```

**search.list 결과:**
```
Extract search results. For each video return:
- title
- channelTitle
- publishedAt
- videoId

Format as JSON array.
```

---

#### 3-4. 수집 데이터 구조

```json
{
  "youtube_trending": {
    "status": "success",
    "collected_at": "2026-01-27T10:00:00Z",
    "api_calls_used": 15,

    "by_category": {
      "science_tech": {
        "KR": [...],
        "US": [...]
      },
      "education": {
        "KR": [...],
        "US": [...]
      },
      "people_blogs": {
        "KR": [...],
        "US": [...]
      },
      "news": {
        "KR": [...],
        "US": [...]
      },
      "howto": {
        "KR": [...],
        "US": [...]
      }
    },

    "by_keyword_search": {
      "indie_hacker": [...],
      "ai_startup_saas": [...],
      "side_project": [...],
      "developer_tools": [...],
      "no_code": [...]
    },

    "aggregated_keywords": {
      "top_30": ["AI", "startup", "automation", ...],
      "trending_topics": ["생성AI", "1인개발", "SaaS"],
      "emerging": ["MCP", "Claude", "agent"]
    }
  }
}
```

---

#### 3-5. 키워드 추출 및 분석

수집된 모든 영상에서:
1. **제목** - 핵심 명사/키워드 추출
2. **tags** - 전체 수집
3. **description** - 해시태그(#) 및 주요 키워드 추출
4. **채널명** - 반복 등장 채널 식별

**키워드 랭킹 방법:**
- 등장 빈도 × 조회수 가중치
- 카테고리/지역 교차 등장 시 가중치 증가
- 최근 7일 내 급상승 키워드 별도 표시

---

#### 3-6. API Key

> **환경변수 위치:** `.env.local` 파일
> **스킬 참조:** `.claude/skills/youtube/SKILL.md`
>
> ```bash
> # API 키 확인 (bash -c 필수!)
> bash -c 'source .env.local && echo "Key: ${YOUTUBE_API_KEY:0:15}..."'
> ```
>
> **중요:** 반드시 `bash -c 'source .env.local && ...'` 형식으로 호출해야 합니다.
> 파이프(|)를 사용할 때 환경변수가 사라지는 Claude Code 버그가 있습니다.

**카테고리 옵션 전체:**
- `28` - Science & Technology
- `27` - Education
- `26` - How-to & Style
- `25` - News & Politics
- `24` - Entertainment
- `22` - People & Blogs
- `10` - Music

### 5. 데이터 저장

수집된 데이터를 `generated/sources/{YYYY-MM-DD}.json` 파일로 저장합니다.

**YouTube 데이터 형식 (확장형):**
```json
{
  "youtube_trending": {
    "status": "success",
    "collected_at": "2026-01-27T10:00:00Z",
    "total_videos": 150,
    "api_calls_used": 15,

    "by_category": {
      "science_tech_KR": [...],
      "science_tech_US": [...],
      "education_KR": [...],
      "education_US": [...]
    },

    "by_keyword_search": {
      "indie_hacker": [...],
      "ai_startup_saas": [...]
    },

    "aggregated_keywords": {
      "top_30": ["AI", "startup", "Claude", "automation"],
      "by_frequency": {"AI": 45, "startup": 32, ...},
      "trending_topics": ["생성AI", "1인개발", "에이전트"],
      "emerging_7d": ["MCP", "Claude Code", "Cursor"]
    }
  }
}
```

### 6. 인사이트 에이전트용 출력

수집 완료 후, 다음 형식으로 콘솔에 요약을 출력합니다:

```
═══════════════════════════════════════════════════════════════════════════════
               COLLECTED DATA FOR INSIGHT EXTRACTION
═══════════════════════════════════════════════════════════════════════════════
Date: {날짜}
Total Sources: 9
Total Items: {총 개수}

───────────────────────────────────────────────────────────────────────────────
[소스명] 카테고리
───────────────────────────────────────────────────────────────────────────────
1. 제목 - 설명 (지표)
...

───────────────────────────────────────────────────────────────────────────────
[YouTube Trending] 다중 카테고리 & 키워드 검색 (150+ 영상)
───────────────────────────────────────────────────────────────────────────────

🇰🇷 한국 트렌딩:
  📡 Science & Tech: {제목1}, {제목2}...
  📚 Education: {제목1}, {제목2}...
  👤 People & Blogs: {제목1}, {제목2}...

🇺🇸 미국 트렌딩:
  📡 Science & Tech: {제목1}, {제목2}...
  📚 Education: {제목1}, {제목2}...
  👤 People & Blogs: {제목1}, {제목2}...

🔍 키워드 검색 결과:
  "indie hacker": {제목1}, {제목2}...
  "AI startup SaaS": {제목1}, {제목2}...

📊 Top 30 Keywords: AI, startup, automation, Claude, agent, SaaS, ...

═══════════════════════════════════════════════════════════════════════════════
                        KEY TRENDS DETECTED
═══════════════════════════════════════════════════════════════════════════════
🔥 트렌드1: 관련 키워드들
🔥 트렌드2: 관련 키워드들
...

═══════════════════════════════════════════════════════════════════════════════
File saved: generated/sources/{날짜}.json
Next step: Run /analyze to extract MVP insights
```

### 7. 오류 처리
- 특정 소스 수집 실패 시 해당 소스를 건너뛰고 계속 진행
- 실패한 소스는 status: "failed"로 표시
- YouTube API 실패 시 WebFetch 대안 URL로 시도

## YouTube API 설정

### 환경변수 설정
API 키는 `.env.local` 파일에서 관리합니다 (Git에서 제외됨):

```bash
# .env.local
YOUTUBE_API_KEY=your_api_key_here
```

**API 호출 시 환경변수 사용 (필수 형식):**
```bash
# 올바른 방식 - bash -c로 감싸서 호출
bash -c 'source .env.local && curl -s "https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=KR&maxResults=5&key=${YOUTUBE_API_KEY}"'

# 잘못된 방식 - 파이프 사용 시 환경변수 사라짐
source .env.local && curl -s "..." | jq .  # ❌ 환경변수가 사라짐
```

> **참고:** 자세한 API 사용법은 `.claude/skills/youtube/SKILL.md` 참조

### API Key 재발급 방법 (필요시)
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. APIs & Services > Library > "YouTube Data API v3" 활성화 확인
3. APIs & Services > Credentials > Create Credentials > API Key
4. 발급된 API Key를 config.json의 `youtube_api.api_key`에 저장

## 예상 소요 시간
병렬 수집으로 약 30초~1분 내외
