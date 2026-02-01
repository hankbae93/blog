# PRD Agent 아키텍처 가이드

Claude가 이 프로젝트를 수정할 때 반드시 참고해야 하는 핵심 규칙들.

---

## 라우팅 구조 (중요!)

### 홈페이지 (`/`)

**규칙: 홈페이지는 `app/page.tsx`에서 직접 처리한다.**

```
app/
├── page.tsx              ← 홈페이지 (/) - 절대 삭제하지 마세요!
├── layout.tsx            ← 공통 레이아웃
└── [...mdxPath]/         ← MDX 콘텐츠 라우팅 (/ 제외 모든 경로)
    └── page.tsx
```

### 절대 하면 안 되는 것

1. **`content/index.mdx` 생성 금지**
   - Nextra가 `/` 경로로 렌더링하려고 시도하여 `app/page.tsx`와 충돌
   - 빌드 에러: `The provided export path '/' doesn't match the '/[...mdxPath]' page`

2. **`app/[...mdxPath]`를 `app/[[...mdxPath]]`로 변경 금지**
   - `[...mdxPath]` = 필수 catch-all (최소 1개 세그먼트 필요)
   - `[[...mdxPath]]` = 선택적 catch-all (`/` 포함 모든 경로)
   - 선택적으로 바꾸면 `app/page.tsx`와 충돌

3. **`app/page.tsx` 삭제 금지**
   - 홈페이지 컴포넌트가 여기에 있음
   - `components/HomePage.tsx`는 백업용 (현재 미사용)

### MDX 콘텐츠 구조

```
content/
├── _meta.ts              ← 네비게이션 메타데이터
├── insights/             ← 인사이트 MDX 파일들
│   ├── _meta.ts
│   ├── 2026-02-01.mdx
│   └── ...
└── (index.mdx 없음!)     ← 절대 생성하지 마세요!
```

---

## 데이터 파이프라인

```
1. 수집: scripts/collect-data.js
   → generated/sources/{날짜}.json

2. 분석: /analyze 커맨드
   → generated/insights/{날짜}.md

3. 동기화: scripts/sync-content.js
   → content/insights/{날짜}.mdx (SEO 메타데이터 추가)

4. 메타 생성: scripts/generate-meta.js
   → content/**/_meta.ts
```

---

## 빌드 프로세스

```bash
npm run build
```

자동 실행 순서:
1. `prebuild`: sync + generate-meta
2. `build`: next build
3. `postbuild`: sitemap + pagefind 검색 인덱스

---

## 주요 파일 역할

| 파일 | 역할 | 수정 시 주의 |
|------|------|-------------|
| `app/page.tsx` | 홈페이지 | 삭제 금지 |
| `app/[...mdxPath]/page.tsx` | MDX 라우팅 | catch-all 타입 변경 금지 |
| `app/layout.tsx` | 공통 레이아웃 | - |
| `content/_meta.ts` | 네비게이션 | 자동 생성됨 |
| `.claude/commands/analyze.md` | /analyze 프롬프트 | - |

---

## 자주 발생하는 실수

### 1. 홈페이지 관련 빌드 에러

**증상:**
```
Error: The provided export path '/' doesn't match the '/[...mdxPath]' page
```

**원인:**
- `content/index.mdx` 존재
- 또는 `app/[[...mdxPath]]` 사용

**해결:**
1. `content/index.mdx` 삭제
2. `app/[[...mdxPath]]` → `app/[...mdxPath]`로 변경
3. `app/page.tsx` 존재 확인

### 2. 인사이트 파일이 안 보임

**해결:**
```bash
npm run sync
npm run build
```
