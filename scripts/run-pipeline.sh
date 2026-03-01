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

# 네트워크 준비 대기 (launchd에서 부팅 직후 실행 시 DNS 미준비 방지)
wait_for_network() {
    local max_wait=60
    local waited=0
    while [ $waited -lt $max_wait ]; do
        if host -W 2 api.github.com > /dev/null 2>&1; then
            return 0
        fi
        log "⏳ Waiting for network... (${waited}s)"
        sleep 5
        waited=$((waited + 5))
    done
    log "⚠️  Network not ready after ${max_wait}s, proceeding anyway..."
    return 0
}

wait_for_network

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

# 3.5. 앱 트렌드 분석 (Week 2)
run_analyze_app_trends() {
    log "📱 Step 3.5: Analyzing app trends..."
    if [ -f scripts/analyze-app-trends.js ]; then
        if node scripts/analyze-app-trends.js 2>&1 | tee -a "logs/pipeline-$DATE.log"; then
            log "✅ App trends analysis complete"
        else
            log "⚠️  App trends analysis failed, continuing..."
        fi
    else
        log "⏭️  App trends script not found, skipping..."
    fi
}

# 3.7. 피처된 앱 추적 업데이트
run_update_featured_apps() {
    log "📝 Step 3.7: Updating featured apps tracking..."
    if [ -f scripts/update-featured-apps.js ]; then
        if node scripts/update-featured-apps.js 2>&1 | tee -a "logs/pipeline-$DATE.log"; then
            log "✅ Featured apps updated"
        else
            log "⚠️  Featured apps update failed, continuing..."
        fi
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

# 6. 주간/월간 요약 catch-up (누락 시 자동 실행)
run_catchup_summaries() {
    log "🔍 Step 6: Checking for missed weekly/monthly summaries..."

    # 주간 요약 catch-up
    WEEKLY_LOCK="logs/.last-run-weekly"
    SHOULD_RUN_WEEKLY=false

    if [ ! -f "$WEEKLY_LOCK" ]; then
        # 한 번도 실행 안 됨
        SHOULD_RUN_WEEKLY=true
    else
        LAST_WEEKLY=$(cat "$WEEKLY_LOCK")
        # macOS date: 마지막 실행일로부터 경과일 계산
        LAST_WEEKLY_EPOCH=$(date -j -f "%Y-%m-%d" "$LAST_WEEKLY" "+%s" 2>/dev/null || echo "0")
        NOW_EPOCH=$(date "+%s")
        DAYS_SINCE_WEEKLY=$(( (NOW_EPOCH - LAST_WEEKLY_EPOCH) / 86400 ))

        if [ "$DAYS_SINCE_WEEKLY" -ge 7 ]; then
            SHOULD_RUN_WEEKLY=true
            log "  ⏰ Weekly summary overdue (last: $LAST_WEEKLY, ${DAYS_SINCE_WEEKLY} days ago)"
        fi
    fi

    if [ "$SHOULD_RUN_WEEKLY" = true ]; then
        log "  📊 Triggering weekly summary catch-up..."
        if bash scripts/run-weekly.sh 2>&1 | tee -a "logs/pipeline-$DATE.log"; then
            log "  ✅ Weekly catch-up complete"
        else
            log "  ⚠️  Weekly catch-up failed, continuing..."
        fi
    else
        log "  ✅ Weekly summary is up to date"
    fi

    # 월간 요약 catch-up (매월 1~5일 사이에 전월 리포트 확인)
    DAY_OF_MONTH=$(date +%d)
    if [ "$DAY_OF_MONTH" -le 5 ]; then
        LAST_MONTH=$(date -v-1m +%Y-%m)
        MONTHLY_FILE="generated/summaries/monthly/${LAST_MONTH}.md"

        if [ ! -f "$MONTHLY_FILE" ]; then
            log "  ⏰ Monthly summary missing for $LAST_MONTH"
            log "  📊 Triggering monthly summary catch-up..."
            if bash scripts/run-monthly.sh 2>&1 | tee -a "logs/pipeline-$DATE.log"; then
                log "  ✅ Monthly catch-up complete"
            else
                log "  ⚠️  Monthly catch-up failed, continuing..."
            fi
        else
            log "  ✅ Monthly summary for $LAST_MONTH exists"
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
        --app-trends)
            run_analyze_app_trends
            ;;
        all|*)
            run_collect
            run_analyze
            run_update_trends
            run_analyze_app_trends
            run_update_featured_apps
            run_sync
            run_git
            run_catchup_summaries
            ;;
    esac

    log "=========================================="
    log "Pipeline completed!"
    log "=========================================="

    # 실행 완료 기록
    echo "$DATE" > "$LOCK_FILE"
}

main "$@"
