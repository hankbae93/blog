# /status - 스케줄링 상태 체크 커맨드

PRD-Agent의 스케줄링 작업 상태를 한눈에 확인합니다.

## 실행 지침

아래 항목들을 **모두** 확인하여 상태 리포트를 출력하세요.

### 1. launchd 등록 상태 확인

```bash
launchctl list | grep prd-agent
```

3개의 Job이 모두 등록되어야 정상:
- `com.prd-agent.daily` - 매일 09:00
- `com.prd-agent.weekly` - 매주 일요일 10:00
- `com.prd-agent.monthly` - 매월 1일 11:00

**PID가 표시되면 해당 작업이 현재 실행 중**입니다.

### 2. 현재 실행 중인 파이프라인 프로세스 확인

```bash
ps aux | grep -E '(run-pipeline|run-weekly|run-monthly|collect-data|update-trend|analyze-app|claude.*analyze|claude.*weekly|claude.*monthly)' | grep -v grep
```

### 3. 마지막 실행 기록 확인

```bash
# Daily 마지막 실행일
cat logs/.last-run-daily 2>/dev/null || echo "기록 없음"

# Weekly 마지막 실행일
cat logs/.last-run-weekly 2>/dev/null || echo "기록 없음"

# Monthly 마지막 실행일
cat logs/.last-run-monthly 2>/dev/null || echo "기록 없음"
```

### 4. 오늘 로그 확인 (실행 중이면 진행 상황)

```bash
# 오늘 날짜 로그 파일 존재 여부 및 마지막 20줄
DATE=$(date +%Y-%m-%d)
tail -20 logs/pipeline-$DATE.log 2>/dev/null || echo "오늘 데일리 로그 없음"
tail -20 logs/weekly-$DATE.log 2>/dev/null
tail -20 logs/monthly-$DATE.log 2>/dev/null
```

### 5. 최근 7일 실행 이력

```bash
ls -lt logs/pipeline-*.log 2>/dev/null | head -7
```

### 6. 생성된 최신 데이터 확인

```bash
# 최신 소스 데이터
ls -lt generated/sources/*.json 2>/dev/null | head -3

# 최신 인사이트
ls -lt generated/insights/*.md 2>/dev/null | head -3

# 최신 주간 요약
ls -lt generated/summaries/weekly/*.md 2>/dev/null | head -3

# 최신 월간 리포트
ls -lt generated/summaries/monthly/*.md 2>/dev/null | head -3
```

### 7. 에러 확인

```bash
# 최근 로그에서 에러/실패 검색
DATE=$(date +%Y-%m-%d)
grep -i -E '(error|fail|❌)' logs/pipeline-$DATE.log 2>/dev/null || echo "오늘 에러 없음"
```

## 출력 형식

아래 형식으로 상태 리포트를 작성하세요:

```
## PRD-Agent 스케줄링 상태

### launchd Jobs
| Job | 상태 | PID | 스케줄 |
|-----|------|-----|--------|
| com.prd-agent.daily | ✅ 등록됨 / 🔄 실행 중 / ❌ 미등록 | PID 또는 - | 매일 09:00 |
| com.prd-agent.weekly | ✅ 등록됨 / 🔄 실행 중 / ❌ 미등록 | PID 또는 - | 일요일 10:00 |
| com.prd-agent.monthly | ✅ 등록됨 / 🔄 실행 중 / ❌ 미등록 | PID 또는 - | 1일 11:00 |

### 마지막 실행
| 파이프라인 | 마지막 실행일 | 경과일 |
|-----------|-------------|--------|
| Daily | YYYY-MM-DD | N일 전 |
| Weekly | YYYY-MM-DD | N일 전 |
| Monthly | YYYY-MM-DD | N일 전 |

### 현재 진행 상황
(실행 중인 경우 로그에서 현재 단계를 표시)
- Step 1: 데이터 수집 ✅/🔄/⏳
- Step 2: AI 분석 ✅/🔄/⏳
- Step 3: 트렌드 업데이트 ✅/🔄/⏳
- Step 3.5: 앱 트렌드 분석 ✅/🔄/⏳
- Step 4: 콘텐츠 동기화 ✅/🔄/⏳
- Step 5: Git 커밋 & 푸시 ✅/🔄/⏳

### 최근 데이터
- 최신 소스: {파일명} ({날짜})
- 최신 인사이트: {파일명} ({날짜})

### 에러 (있는 경우)
- {에러 내용}
```

**미등록 Job이 있으면** 설치 안내를 추가:
```bash
./scripts/install-launchd.sh
```
