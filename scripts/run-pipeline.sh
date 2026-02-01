#!/bin/bash

# PRD-Agent Daily Pipeline
# 매일 자동으로 실행되는 파이프라인
#
# 사용법:
#   ./scripts/run-pipeline.sh           # 전체 실행
#   ./scripts/run-pipeline.sh --collect # 수집만
#   ./scripts/run-pipeline.sh --analyze # 분석만
#   ./scripts/run-pipeline.sh --force   # 오늘 이미 실행했어도 강제 실행

set -e

# 프로젝트 디렉토리로 이동
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# 로그 디렉토리 생성
mkdir -p logs

# 날짜
DATE=$(date +%Y-%m-%d)
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)

# 오늘 이미 실행했는지 체크 (--force 옵션이 없을 때만)
LOCK_FILE="logs/.last-run-daily"
if [ "$1" != "--force" ] && [ -f "$LOCK_FILE" ]; then
    LAST_RUN=$(cat "$LOCK_FILE")
    if [ "$LAST_RUN" = "$DATE" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Already ran today ($DATE), skipping..."
        echo "Use --force to run anyway"
        exit 0
    fi
fi

# 로그 함수
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "logs/pipeline-$DATE.log"
}

log "=========================================="
log "PRD-Agent Daily Pipeline Started"
log "=========================================="

# 환경변수 로드
if [ -f .env.local ]; then
    source .env.local
    log "✅ Environment variables loaded"
else
    log "⚠️  .env.local not found, some features may not work"
fi

# 1. 데이터 수집
run_collect() {
    log "📥 Step 1: Collecting data..."
    if node scripts/collect-data.js 2>&1 | tee -a "logs/pipeline-$DATE.log"; then
        log "✅ Data collection complete"
    else
        log "❌ Data collection failed"
        return 1
    fi
}

# 2. Claude Code로 분석
run_analyze() {
    log "🤖 Step 2: Analyzing with Claude Code..."

    # Claude Code CLI 확인
    if ! command -v claude &> /dev/null; then
        log "❌ Claude Code CLI not found. Please install it first."
        log "   npm install -g @anthropic-ai/claude-code"
        return 1
    fi

    # 분석 실행 (비대화형 모드)
    if claude -p "/analyze" --allowedTools "Read,Write,Glob,Grep" 2>&1 | tee -a "logs/pipeline-$DATE.log"; then
        log "✅ Analysis complete"
    else
        log "⚠️  Analysis may have issues, continuing..."
    fi
}

# 3. 트렌드 히스토리 업데이트
run_update_trends() {
    log "📈 Step 3: Updating trend history..."
    if [ -f scripts/update-trend-history.js ]; then
        if node scripts/update-trend-history.js 2>&1 | tee -a "logs/pipeline-$DATE.log"; then
            log "✅ Trend history updated"
        else
            log "⚠️  Trend history update failed, continuing..."
        fi
    else
        log "⏭️  Trend history script not found, skipping..."
    fi
}

# 4. 콘텐츠 동기화
run_sync() {
    log "🔄 Step 4: Syncing content..."
    if npm run sync 2>&1 | tee -a "logs/pipeline-$DATE.log"; then
        log "✅ Content sync complete"
    else
        log "❌ Content sync failed"
        return 1
    fi
}

# 5. Git 커밋 & 푸시
run_git() {
    log "📤 Step 5: Git commit and push..."

    git add -A

    if git diff --staged --quiet; then
        log "ℹ️  No changes to commit"
    else
        git commit -m "Daily PRD update: $DATE

- Data collected from 9 sources
- AI-powered insights generated
- Automated by run-pipeline.sh

Co-Authored-By: Claude <noreply@anthropic.com>"

        if git push 2>&1 | tee -a "logs/pipeline-$DATE.log"; then
            log "✅ Pushed to remote"
        else
            log "❌ Git push failed"
            return 1
        fi
    fi
}

# 메인 실행
main() {
    case "${1:-all}" in
        --collect)
            run_collect
            ;;
        --analyze)
            run_analyze
            ;;
        --sync)
            run_sync
            ;;
        --git)
            run_git
            ;;
        all|*)
            run_collect
            run_analyze
            run_update_trends
            run_sync
            run_git
            ;;
    esac

    log "=========================================="
    log "Pipeline completed!"
    log "=========================================="

    # 실행 완료 기록
    echo "$DATE" > "$LOCK_FILE"
}

main "$@"
