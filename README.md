# PRD Agent

트렌드 데이터를 분석하여 MVP 아이디어를 도출하고 PRD를 생성하는 도구입니다.

## 🚀 시작하기

### 설치

```bash
npm install
```

### 개발 서버

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

## 🔐 환경변수 설정

`.env.example`을 복사하여 `.env.local`을 생성하고 API 키를 설정하세요.

```bash
cp .env.example .env.local
```

**Vercel 배포 시:**
- Vercel 대시보드 → Settings → Environment Variables에서 설정
- `YOUTUBE_API_KEY` 추가

## 📁 프로젝트 구조

```
prd-agent/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 홈페이지
│   ├── insights/          # 인사이트 목록/상세
│   └── persona/           # 페르소나 설정
├── components/            # React 컴포넌트
├── lib/                   # 유틸리티 함수
├── insights/              # 생성된 인사이트 (Markdown)
├── my-persona/            # 페르소나 설정 파일
├── sources/               # 수집된 트렌드 데이터
├── .claude/commands/      # Claude Code 명령어
└── config.json            # 소스 설정
```

## 📝 명령어 (Claude Code)

| 명령어 | 설명 |
|--------|------|
| `/collect` | 트렌드 데이터 수집 |
| `/analyze` | 인사이트 추출 (투 트랙) |
| `/analyze:profit` | 수익화 트랙만 실행 |
| `/analyze:essence` | 본질 트랙만 실행 |
| `/generate` | PRD 문서 생성 |

## 🌐 배포

Vercel에서 자동 배포됩니다.

1. GitHub 저장소 연결
2. Environment Variables 설정
3. Deploy!

---

Built with Claude Code
