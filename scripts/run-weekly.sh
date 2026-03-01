#!/bin/bash

# PRD-Agent Weekly Summary Pipeline
# 매주 일요일 자동으로 실행되는 주간 요약 파이프라인
# catch-up 로직: launchd RunAtLoad로 매번 호출되어도 안전하게 중복 방지

set -e

# 프로젝트 디렉토리로 이동
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# 로그 디렉토리 생성
mkdir -p logs
mkdir -p generated/summaries/weekly

# 날짜 및 주차 계산
DATE=$(date +%Y-%m-%d)
YEAR=$(date +%Y)
WEEK=$(date +%V)

# Lock 파일 기반 중복 실행 방지
LOCK_FILE="logs/.last-run-weekly"

# 이번 주차 파일이 이미 존재하면 스킵
WEEKLY_FILE="generated/summaries/weekly/${YEAR}-W${WEEK}.md"
if [ -f "$WEEKLY_FILE" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Weekly summary for ${YEAR}-W${WEEK} already exists, skipping..."
    exit 0
fi

# 마지막 실행 후 7일 미경과 시 스킵 (RunAtLoad 매일 호출 방지)
if [ -f "$LOCK_FILE" ]; then
    LAST_RUN=$(cat "$LOCK_FILE")
    LAST_RUN_EPOCH=$(date -j -f "%Y-%m-%d" "$LAST_RUN" "+%s" 2>/dev/null || echo "0")
    NOW_EPOCH=$(date "+%s")
    DAYS_SINCE=$(( (NOW_EPOCH - LAST_RUN_EPOCH) / 86400 ))

    if [ "$DAYS_SINCE" -lt 7 ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Last weekly run was ${DAYS_SINCE} days ago (${LAST_RUN}), skipping..."
        exit 0
    fi
fi

# 로그 함수
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "logs/weekly-$DATE.log"
}

log "=========================================="
log "PRD-Agent Weekly Summary - ${YEAR}-W${WEEK}"
log "=========================================="

# 환경변수 로드
if [ -f .env.local ]; then
    source .env.local
    log "✅ Environment variables loaded"
fi

# Claude Code CLI 확인
if ! command -v claude &> /dev/null; then
    log "❌ Claude Code CLI not found"
    exit 1
fi

# 1. 주간 요약 생성
log "📊 Generating weekly summary..."

if claude -p "/weekly-summary" --allowedTools "Read,Write,Glob,Grep" 2>&1 | tee -a "logs/weekly-$DATE.log"; then
    log "✅ Weekly summary generated"
else
    log "⚠️  Weekly summary may have issues"
fi

# 2. 콘텐츠 동기화
log "🔄 Syncing content..."
npm run sync 2>&1 | tee -a "logs/weekly-$DATE.log"

# 3. Git 커밋 & 푸시
log "📤 Git commit and push..."

git add -A

if git diff --staged --quiet; then
    log "ℹ️  No changes to commit"
else
    git commit -m "Weekly summary: ${YEAR}-W${WEEK}

- Weekly trends analysis
- Top products of the week
- Action items consolidated

Co-Authored-By: Claude <noreply@anthropic.com>"

    if git push 2>&1 | tee -a "logs/weekly-$DATE.log"; then
        log "✅ Pushed to remote"
    else
        log "❌ Git push failed"
    fi
fi

# 실행 완료 기록
echo "$DATE" > "$LOCK_FILE"

log "=========================================="
log "Weekly pipeline completed!"
log "=========================================="
