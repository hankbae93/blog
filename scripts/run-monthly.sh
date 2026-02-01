#!/bin/bash

# PRD-Agent Monthly Summary Pipeline
# 매월 1일 자동으로 실행되는 월간 요약 파이프라인

set -e

# 프로젝트 디렉토리로 이동
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# 로그 디렉토리 생성
mkdir -p logs
mkdir -p generated/summaries/monthly

# 날짜 계산 (지난 달)
DATE=$(date +%Y-%m-%d)
LAST_MONTH=$(date -v-1m +%Y-%m)  # macOS
# Linux: LAST_MONTH=$(date -d "1 month ago" +%Y-%m)

# 로그 함수
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "logs/monthly-$DATE.log"
}

log "=========================================="
log "PRD-Agent Monthly Summary - ${LAST_MONTH}"
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

# 1. 월간 요약 생성
log "📊 Generating monthly summary for ${LAST_MONTH}..."

if claude -p "/monthly-summary" --allowedTools "Read,Write,Glob,Grep" 2>&1 | tee -a "logs/monthly-$DATE.log"; then
    log "✅ Monthly summary generated"
else
    log "⚠️  Monthly summary may have issues"
fi

# 2. 콘텐츠 동기화
log "🔄 Syncing content..."
npm run sync 2>&1 | tee -a "logs/monthly-$DATE.log"

# 3. Git 커밋 & 푸시
log "📤 Git commit and push..."

git add -A

if git diff --staged --quiet; then
    log "ℹ️  No changes to commit"
else
    git commit -m "Monthly report: ${LAST_MONTH}

- Monthly trend analysis
- Top products and GitHub repos
- Revenue insights summary
- Action items review

Co-Authored-By: Claude <noreply@anthropic.com>"

    if git push 2>&1 | tee -a "logs/monthly-$DATE.log"; then
        log "✅ Pushed to remote"
    else
        log "❌ Git push failed"
    fi
fi

log "=========================================="
log "Monthly pipeline completed!"
log "=========================================="
