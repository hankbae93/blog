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

**Product Hunt:**
```
Extract today's top products. For each: name, tagline, link. Format as numbered list.
```

**Hacker News:**
```
Extract top 10 stories. For each: title, points, comments, URL. Format as numbered list.
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

**Indie Hackers:**
```
Extract trending posts. For each: title, description. Format as numbered list.
```

**TechCrunch:**
```
Extract latest 10 startup articles. For each: title, summary. Format as numbered list.
```

### 3. YouTube Trending 수집 (API 방식) - 확장형

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

### 4. 데이터 저장

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

### 5. 인사이트 에이전트용 출력

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

### 6. 오류 처리
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
