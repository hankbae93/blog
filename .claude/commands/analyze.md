# /analyze - 데일리 인사이트 다이제스트

오늘 수집된 트렌드를 **1인 개발자 시선**으로 정리합니다.
3줄만 읽어도 오늘의 흐름을 파악할 수 있도록.

## 핵심 원칙

1. **모든 내용은 한글로 작성** - 영어 인용문도 반드시 번역
2. **제품/회사 설명 필수** - "무엇을 하는 제품인지" 명확히 설명
3. **테이블은 보조 수단** - 설명 먼저, 테이블은 요약용
4. **"오늘의 핵심 숫자", "상승 키워드" 섹션은 사용하지 않음** - 무의미한 정보 제외

---

## 사용 가능한 컴포넌트

### Nextra 기본 컴포넌트 (적극 활용할 것)

**Callout** - 핵심 인사이트, 경고, 팁 강조에 사용:
```mdx
<Callout type="info">
핵심 인사이트 내용
</Callout>

<Callout type="warning">
주의할 점이나 경고
</Callout>
```
- type: `"info"` (파란색), `"warning"` (노란색), `"error"` (빨간색), 기본 (회색)
- 각 섹션에서 가장 중요한 인사이트 1개를 Callout으로 감쌀 것

**Tabs** - 플랫폼 비교, 카테고리별 분류에 사용:
```mdx
<Tabs items={['Android', 'iOS']}>
<Tabs.Tab>
Android 분석 내용
</Tabs.Tab>
<Tabs.Tab>
iOS 분석 내용
</Tabs.Tab>
</Tabs>
```
- 앱 마켓 니치 기회 요약에서 플랫폼별 분류 시 사용

**Steps** - 액션 아이템, 실행 단계 제시에 사용:
```mdx
<Steps>
### Step 1: 첫 번째 액션
설명

### Step 2: 두 번째 액션
설명
</Steps>
```
- 교차 분석의 "기회 또는 경고" 섹션에서 구체적 실행 단계 제시 시 사용

### YouTube 컴포넌트

- `<YouTubeThumbnail>` - 그리드/목록 레이아웃에서 썸네일 카드 표시 (기존과 동일)
- `<YouTubeEmbed>` - **주목할 영상** 분석에서 인라인 재생 가능한 임베드 사용:
```mdx
<YouTubeEmbed id="{videoId}" title="{제목}" views={조회수} channel="{채널}" />
```
- 주목할 영상 2-3개는 반드시 `YouTubeEmbed`로 표시하여 바로 재생 가능하게 할 것

---

## 입력
- `generated/sources/{YYYY-MM-DD}.json` 또는 최신 파일

---

## 출력 구조

### 0. 오늘의 흐름 (3줄 요약)

**반드시 맨 위에 포함**

```markdown
## 오늘의 흐름

> **한 줄 요약**: [전체를 관통하는 메시지 - 한글]

1. **[키워드1]**: [한 줄 설명]
2. **[키워드2]**: [한 줄 설명]
3. **[키워드3]**: [한 줄 설명]
```

---

### 1. 오늘의 신호 테이블

**신호 → 의미 → 기회를 한 테이블로 - 오늘의 흐름 바로 아래에 배치**

```markdown
## 오늘의 신호

| 신호 | 의미 | 기회 |
|------|------|------|
| [관찰된 현상 - 구체적 수치 포함] | [왜 중요한가] | [1인 개발자가 할 수 있는 것] |
| [예: PH Top 3가 모두 AI 도구] | [AI UX 개선 시장 형성] | [Claude 유저 페인포인트 도구] |
```

**작성 규칙:**
- 3-5개 신호 선정
- 신호는 구체적 관찰 (숫자, 순위 포함)
- 기회는 액션 가능한 아이디어

---

### 2. Product Hunt 오늘의 제품

**중요: 제품이 무엇인지 반드시 상세히 설명할 것**

```markdown
## Product Hunt 오늘의 제품

### 1. [제품명] ⬆️ {votesCount} | 💬 {commentsCount} | ⭐ {reviewsRating}
![thumbnail]({이미지URL})

🔗 [Product Hunt]({url}) | [공식 사이트]({website})
📂 {topics}

#### 이 제품은 무엇인가?
[2-3문장으로 제품이 무엇을 하는지 명확히 설명]
- 핵심 기능: [구체적으로]
- 작동 방식: [어떻게 동작하는지]

#### 왜 주목할만한가?
[1인 개발자 관점에서 이 제품이 흥미로운 이유]

| 구분 | 내용 |
|------|------|
| 타겟 사용자 | [누구를 위한 제품] |
| 기존 대비 차별점 | [뭐가 다른가] |
| 수익 모델 | [무료/프리미엄/유료 구독 등] |
| 제작자 | [인원, 배경] |
| 커뮤니티 반응 | 댓글 {commentsCount}개, 평점 {reviewsRating}/5.0 |

**배울 점**: [1인 개발자가 이 제품에서 배울 수 있는 것]
```

---

### 3. 앱 마켓 니치 트렌드

**Play Store/App Store 니치 앱 데이터 분석 - Product Hunt 바로 다음에 배치**

```markdown
## 앱 마켓 니치 트렌드

Play Store와 App Store에서 30~150위권에 있는 앱 중 **대기업이 아닌 개발사**가 만든 **평점 4.0 이상** 앱을 분석합니다. 1인 개발자가 진입할 수 있는 기회를 찾는 것이 목표입니다.

### 1. [앱 이름] 🆕 📱 {platform} | {category} #{rank}
![icon]({iconUrl})

🔗 [{Store Name}]({url})
⭐ {score} | 📊 리뷰 {reviews}개 | 📥 {installs} 설치 | 🗓️ {releaseInfo}

#### 이 앱은 무엇인가?
[2-3문장으로 앱이 무엇을 하는지 명확히 설명]
- 핵심 기능: [구체적으로]
- 작동 방식: [어떻게 동작하는지]

#### 왜 주목할만한가?
[1인 개발자 관점에서 이 앱이 흥미로운 이유]

| 구분 | 내용 |
|------|------|
| 타겟 사용자 | [누구를 위한 앱] |
| 기존 대비 차별점 | [뭐가 다른가] |
| 수익 모델 | [무료/프리미엄/유료 구독 등] |
| 개발사 규모 | [1인/소규모/스타트업] |
| 성공 요인 | [왜 성공했는지] |

**1인 개발자가 배울 점**: [이 앱에서 배울 수 있는 것]

---

### 앱 마켓 니치 기회 요약

| 기회 영역 | 사례 | 접근 전략 | 난이도 |
|-----------|------|-----------|--------|
| {니치 영역} | {앱 이름} | {전략} | ⭐/⭐⭐/⭐⭐⭐ |
```

**데이터 소스:**
- `playstore_niche`: Play Store 30-150위 니치 앱
- `appstore_niche`: App Store 30-150위 니치 앱
- `generated/app-trends/analysis-{date}.json`: 당일 분석 결과

**니치 앱 선정 기준:**
- 리뷰 100~10,000개 (검증됨 + 아직 작음)
- 평점 4.0 이상
- 대기업 앱 제외
- 인앱 결제 또는 유료 앱 (수익화 모델 있음)

**중복 방지 규칙 (필수):**
- `generated/app-trends/featured-apps.json`을 확인하세요
- `generated/app-trends/analysis-{date}.json`의 각 앱에 `recently_featured` 필드가 있습니다
- 최근 7일 이내 이미 상세 분석한 앱(`recently_featured: true`)은 **전체 분석 생략**
- 대신, 여전히 순위권에 있는 기존 앱은 하단에 요약 테이블로 표시:

```markdown
### 여전히 순위권인 앱 (이전 분석 참조)

| 앱 | 플랫폼 | 현재 순위 | 변동 | 최근 분석일 |
|----|--------|-----------|------|------------|
| [{title}]({url}) | {platform} | #{todayRank} | {change} | {last_featured_date} |
```

- **새로운 앱만 상세 분석** (recently_featured=false인 앱 우선)
- 새로운 앱이 5개 미만이면 그만큼만 분석 (억지로 채우지 않음)

**작성 규칙:**
- 니치 점수가 높은 **신규 앱** 5-10개를 상세 분석
- 각 앱에 대해 Product Hunt 제품처럼 상세 설명 제공
- "1인 개발자가 배울 점"은 필수
- 마지막에 니치 기회 요약 테이블 포함

---

### 4. 앱 마켓 급상승 알림

**순위 변동 분석 (history.json 기반)**

```markdown
## 앱 마켓 급상승 알림

### 오늘의 급상승 앱 (전일 대비 +10위 이상)

| 앱 | 플랫폼 | 카테고리 | 어제 | 오늘 | 변동 |
|----|--------|----------|------|------|------|
| [{title}]({url}) | {platform} | {category} | #{yesterdayRank} | #{todayRank} | +{rankChange} |

**급상승 원인 분석:**
- [앱 이름]: [가능한 급상승 이유 - 마케팅, 앱 업데이트, 계절성 등]

### 신규 진입 앱

| 앱 | 플랫폼 | 카테고리 | 진입 순위 | 리뷰 | 평점 |
|----|--------|----------|-----------|------|------|
| [{title}]({url}) | {platform} | {category} | #{rank} | {reviews} | {score} |

**신규 진입 앱 분석:**
- 어떤 앱인지, 왜 갑자기 순위에 진입했는지

### 3일 연속 상승 중

| 앱 | 플랫폼 | 카테고리 | 3일간 변동 | 현재 순위 |
|----|--------|----------|------------|-----------|
| [{title}]({url}) | {platform} | {category} | +{totalRise} | #{todayRank} |

**모멘텀 신호:**
- 꾸준히 상승 중인 앱은 성장 초기 단계일 가능성
- 참고할 점: [해당 앱의 특징, 배울 점]
```

**데이터 소스:**
- `generated/app-trends/history.json`: 일별 순위 히스토리
- `generated/app-trends/analysis-{date}.json`: 당일 분석 결과

**작성 규칙:**
- 급상승/신규 진입 데이터가 없으면 해당 섹션 생략
- 니치 점수 70 이상인 앱 우선 분석
- 가능하면 급상승 원인 추측 (앱 업데이트, 마케팅, 계절성 등)

---

### 5. 해커뉴스 하이라이트

**영어 제목/내용도 반드시 번역 - HackerNewsCard 컴포넌트 활용 가능**

```markdown
## 해커뉴스 하이라이트

### 주요 토론 (상위 6개를 카드로 표시)

<div className="hn-card-grid">
<HackerNewsCard title="[번역된 제목]" url="{url}" points={points} comments={comments} />
<HackerNewsCard title="[번역된 제목]" url="{url}" points={points} comments={comments} />
<HackerNewsCard title="[번역된 제목]" url="{url}" points={points} comments={comments} />
<HackerNewsCard title="[번역된 제목]" url="{url}" points={points} comments={comments} />
<HackerNewsCard title="[번역된 제목]" url="{url}" points={points} comments={comments} />
<HackerNewsCard title="[번역된 제목]" url="{url}" points={points} comments={comments} />
</div>

### 주목할 기사

#### [번역된 제목] 🔥 {points}점 | 💬 {comments}개
**원문**: [{영어 제목}]({url})

**무슨 내용인가?**
[기사/토론 내용을 2-3문장으로 요약 설명 - 한글]

**1인 개발자에게 의미하는 바**
[이 기사가 왜 중요한지, 어떤 시사점이 있는지]
```

**점수별 표시 기준:**
- 300점 이상: 🔥🔥 (카드에서 주황색 보더)
- 100점 이상: 🔥 (카드에서 노란색 보더)
- 그 외: 기본 (회색 보더)

---

### 6. 깃허브 트렌딩

**레포지토리가 무엇인지 설명 필수 - GitHubRepoCard 컴포넌트 활용**

```markdown
## 깃허브 트렌딩

<div className="github-card-grid">
<GitHubRepoCard name="{owner/repo}" description="{description}" language="{language}" stars={stars} url="{url}" />
<GitHubRepoCard name="{owner/repo}" description="{description}" language="{language}" stars={stars} url="{url}" />
<GitHubRepoCard name="{owner/repo}" description="{description}" language="{language}" stars={stars} url="{url}" />
</div>

### 주목할 프로젝트

#### [{owner/repo}]({url})
<SourceTag tag="{language}" /> ⭐ {stars}

**이 프로젝트는 무엇인가?**
[레포지토리가 무엇을 하는 프로젝트인지 2-3문장 설명]

**왜 뜨고 있나?**
[현재 트렌드와 연결지어 설명]

**1인 개발자 활용법**
[이 프로젝트를 어떻게 활용할 수 있는지]
```

**지원 언어 색상:**
TypeScript(파랑), JavaScript(노랑), Python(초록), Rust(주황), Go(청록), Java(빨강), C++(핑크), Swift(주황), Kotlin(보라), Dart(청록), Shell(초록)

---

### 7. 기타 소스 하이라이트

**Lobsters는 태그 시각화 - SourceTag 컴포넌트 활용**

```markdown
## 기타 소스 하이라이트

### Lobsters (개발자 커뮤니티)

**[제목]** - {points}점
<div className="source-tags">
<SourceTag tag="{tag1}" />
<SourceTag tag="{tag2}" />
</div>

[2줄 요약 및 시사점]

---

### TechCrunch (테크 뉴스)

**[제목]**
[2줄 요약]
```

**Lobsters 태그 색상 지원:**
security(빨강), api(파랑), performance(초록), ml(보라), practices(주황), programming(남색), web(청록), devops(노랑), linux(회색), retrocomputing(호박색), vibecoding(보라)

---

### 8. YouTube 개발 콘텐츠

**프로그래밍/개발 관련 영상만 - YouTubeThumbnail + YouTubeEmbed 컴포넌트 활용**

```markdown
## YouTube 개발 콘텐츠

<div className="youtube-grid">
<YouTubeThumbnail id="{videoId}" title="{title}" views={views} channel="{channel}" />
<YouTubeThumbnail id="{videoId}" title="{title}" views={views} channel="{channel}" />
<YouTubeThumbnail id="{videoId}" title="{title}" views={views} channel="{channel}" />
<YouTubeThumbnail id="{videoId}" title="{title}" views={views} channel="{channel}" />
</div>

### 더 많은 영상

| # | 제목 | 채널 | 조회수 |
|---|------|------|-------:|
| 5 | [{title}](https://www.youtube.com/watch?v={videoId}) | {channel} | {views} |
| ... | ... | ... | ... |

### 주목할 영상

<YouTubeEmbed id="{videoId}" title="{제목}" views={views} channel="{channel}" />

**왜 뜨고 있나**: [1-2문장 분석]
**1인 개발자 시사점**: [배울 점이나 아이디어]
```

**작성 규칙:**
- `youtube_trending`에서 개발/프로그래밍 관련 영상 선별
- **상위 4개는 YouTubeThumbnail 컴포넌트로 표시** (그리드 레이아웃)
- 나머지는 테이블로 표시 (스캔 용이)
- 조회수 높은 순으로 최대 10개
- **주목할 영상 2-3개는 `YouTubeEmbed`로 인라인 재생 가능하게 표시** (상세 분석 포함)

---

### 9. 테크 시그널 (검색 트렌드 기반)

**기술/스타트업 시그널만 추출 - 연예, 스포츠, 날씨 등 무관한 검색어는 완전히 제외**

```markdown
## 테크 시그널

### Google Trends 기술 관련 검색어

`google_trends` 데이터에서 `tech_relevant: true`인 항목만 추출합니다.
기술 관련 검색어가 없으면 이 하위 섹션을 생략하세요.

| 검색어 | 트래픽 | 왜 뜨고 있나 | 1인 개발자 시사점 |
|--------|--------|-------------|-----------------|
| {title} | {traffic} | [관련 뉴스 기반 분석] | [기회 또는 참고 사항] |

### 한국 테크 커뮤니티 트렌드

`korean_tech_trends` 데이터에서 추출합니다.

**Naver DataLab 키워드 동향** (데이터가 있는 경우):
| 키워드 | 최근 검색량 | 주간 변동 | 의미 |
|--------|-----------|----------|------|
| {title} | {ratio} | {change_value} | [분석] |

**Disquiet 인기 제품** (데이터가 있는 경우):
- [{제품명}]({url}) - [한 줄 설명]
```

**작성 규칙:**
- **기술/스타트업과 무관한 검색어(연예, 스포츠, 날씨, 사건사고)는 무조건 제외**
- Google Trends에서 `tech_relevant: true`인 항목이 0개이면 "오늘은 기술 관련 급상승 검색어가 없습니다." 한 줄만 표시
- 최대 3-5개 기술 관련 검색어에 대해 **깊은 분석** 제공 (단순 나열 금지)
- "왜 뜨는가 + 1인 개발자 시사점" 분석 필수

---

### 10. 교차 분석: 오늘의 키 테마

```markdown
## 교차 분석: 오늘의 키 테마

### 테마 1: [키워드]

#### 어디서 발견되었나?
- Product Hunt: [제품명] - [연관성]
- App Store/Play Store: [앱 이름] - [연관성]
- Hacker News: [기사 제목] - [연관성]
- GitHub: [레포명] - [연관성]
- 테크 시그널: [검색어] - [연관성]

#### 무엇을 의미하는가?

<Callout type="info">
[이 테마의 핵심 인사이트 1문장]
</Callout>

[추가 분석 2-3문장]

#### 기회 또는 경고

<Steps>
### 아이디어 1: [제목]
[구체적 실행 방법]

### 아이디어 2: [제목]
[구체적 실행 방법]
</Steps>
```

---

## 번역 가이드라인

### 제품명
- 영어 제품명은 그대로 유지하되, 설명에서 한글 병기 가능
- 예: "Kilo Code Reviewer (킬로 코드 리뷰어)"

### 인용문/태그라인
- 반드시 한글로 번역
- ❌ "Automatic AI-powered code reviews the moment you open a PR"
- ✅ "PR을 열면 바로 AI가 자동으로 코드 리뷰를 해주는 도구"

### 기술 용어
- PR, API, MRR 등 업계 표준 약어는 그대로 사용
- 풀어쓰면 더 이해하기 쉬운 경우 풀어쓰기

---

## 파일 저장

- **경로**: `generated/insights/{YYYY-MM-DD}.md`
- **인코딩**: UTF-8
- **참고**: `npm run sync` 실행 시 `content/insights/{YYYY-MM-DD}.mdx`로 변환됨 (SEO 메타데이터 자동 추가)

### 파일 양식 (필수)

**모든 인사이트 파일은 반드시 다음 양식으로 시작해야 합니다:**

```markdown
---
title: "{YYYY-MM-DD} 데일리 인사이트"
date: "{YYYY-MM-DD}"
description: "[오늘의 한 줄 요약 - 60자 이내]"
keywords: ["키워드1", "키워드2", "키워드3"]
---

# {YYYY-MM-DD} 데일리 인사이트

## 오늘의 흐름
...
```

**주의사항:**
- frontmatter는 기본 정보만 포함 (title, date, description, keywords)
- openGraph, twitter, canonical 등 SEO 메타데이터는 `npm run sync`가 자동 생성
- description은 오늘의 흐름의 한 줄 요약과 동일하게
- keywords는 오늘의 주요 테마 3-5개 (JSON 배열 형식)

---

## 제외 섹션 (사용하지 않음)

다음 섹션들은 무의미하거나 정보가 불충분하므로 포함하지 않음:
- ❌ 오늘의 핵심 숫자 (StatCard 대시보드)
- ❌ 상승 키워드 (TrendBadge)
- ❌ 트렌드 히스토리 연동 (history.json 참조)

---

## 옵션

| 옵션 | 설명 |
|------|------|
| `/analyze` | 기본 - 전체 다이제스트 |
| `/analyze --quick` | 요약만 (오늘의 흐름 + 신호 + 키 테마) |
