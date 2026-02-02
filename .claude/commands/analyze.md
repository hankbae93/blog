# /analyze - 데일리 인사이트 다이제스트

오늘 수집된 트렌드를 **1인 개발자 시선**으로 정리합니다.
3줄만 읽어도 오늘의 흐름을 파악할 수 있도록.

## 핵심 원칙

1. **모든 내용은 한글로 작성** - 영어 인용문도 반드시 번역
2. **제품/회사 설명 필수** - "무엇을 하는 제품인지" 명확히 설명
3. **테이블은 보조 수단** - 설명 먼저, 테이블은 요약용
4. **"오늘의 핵심 숫자", "상승 키워드" 섹션은 사용하지 않음** - 무의미한 정보 제외

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

### 3. 해커뉴스 하이라이트

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

### 4. 깃허브 트렌딩

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

### 5. 기타 소스 하이라이트

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

### 6. YouTube 개발 콘텐츠

**프로그래밍/개발 관련 영상만 - YouTubeThumbnail 컴포넌트 활용**

```markdown
## YouTube 개발 콘텐츠

### 주요 영상

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

**[영상 제목]** - {channel}
- 조회수: {views}
- **왜 뜨고 있나**: [1-2문장 분석]
- **1인 개발자 시사점**: [배울 점이나 아이디어]
```

**작성 규칙:**
- `youtube_trending`에서 개발/프로그래밍 관련 영상 선별
- **상위 4개는 YouTubeThumbnail 컴포넌트로 표시** (시각적 임팩트)
- 나머지는 테이블로 표시 (스캔 용이)
- 조회수 높은 순으로 최대 10개
- 주목할 영상 2-3개는 상세 분석

---

### 7. 교차 분석: 오늘의 키 테마

```markdown
## 교차 분석: 오늘의 키 테마

### 테마 1: [키워드]

#### 어디서 발견되었나?
- Product Hunt: [제품명] - [연관성]
- Hacker News: [기사 제목] - [연관성]
- GitHub: [레포명] - [연관성]

#### 무엇을 의미하는가?
[이 테마가 1인 개발자에게 왜 중요한지 2-3문장]

#### 기회 또는 경고
[액션 아이템 또는 주의사항]
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
