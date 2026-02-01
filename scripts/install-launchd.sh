#!/bin/bash

# PRD-Agent LaunchD Installer
# 템플릿에서 실제 plist 파일을 생성하고 launchd에 등록합니다.
#
# 사용법:
#   ./scripts/install-launchd.sh          # 설치
#   ./scripts/install-launchd.sh --uninstall  # 제거

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TEMPLATE_DIR="$SCRIPT_DIR/launchd"
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# plist 파일 목록
PLISTS=(
    "com.prd-agent.daily"
    "com.prd-agent.weekly"
    "com.prd-agent.monthly"
)

install_launchd() {
    echo ""
    echo "=========================================="
    echo "  PRD-Agent LaunchD Installer"
    echo "=========================================="
    echo ""

    # LaunchAgents 디렉토리 확인
    if [ ! -d "$LAUNCH_AGENTS_DIR" ]; then
        mkdir -p "$LAUNCH_AGENTS_DIR"
        log_info "Created $LAUNCH_AGENTS_DIR"
    fi

    # logs 디렉토리 생성
    mkdir -p "$PROJECT_DIR/logs"
    log_info "Created logs directory"

    # 각 plist 설치
    for plist in "${PLISTS[@]}"; do
        template_file="$TEMPLATE_DIR/${plist}.plist.template"
        target_file="$LAUNCH_AGENTS_DIR/${plist}.plist"

        if [ ! -f "$template_file" ]; then
            log_warn "Template not found: $template_file"
            continue
        fi

        # 기존 서비스 언로드 (있으면)
        if launchctl list | grep -q "$plist"; then
            launchctl unload "$target_file" 2>/dev/null || true
            log_info "Unloaded existing $plist"
        fi

        # 템플릿에서 실제 plist 생성 (플레이스홀더 치환)
        sed -e "s|{{PROJECT_DIR}}|$PROJECT_DIR|g" -e "s|{{HOME}}|$HOME|g" "$template_file" > "$target_file"
        log_info "Created $target_file"

        # 서비스 로드
        launchctl load "$target_file"
        log_info "Loaded $plist"
    done

    echo ""
    echo "=========================================="
    log_info "Installation complete!"
    echo "=========================================="
    echo ""

    # 스케줄 정보 출력
    echo "Scheduled tasks:"
    echo "  - Daily:   09:00 (매일)"
    echo "  - Weekly:  10:00 (매주 일요일)"
    echo "  - Monthly: 11:00 (매월 1일)"
    echo ""
    echo "Logs: $PROJECT_DIR/logs/"
    echo ""

    # 확인
    echo "Registered services:"
    launchctl list | grep "prd-agent" || log_warn "No services found (may need to wait)"
}

uninstall_launchd() {
    echo ""
    echo "=========================================="
    echo "  PRD-Agent LaunchD Uninstaller"
    echo "=========================================="
    echo ""

    for plist in "${PLISTS[@]}"; do
        target_file="$LAUNCH_AGENTS_DIR/${plist}.plist"

        if [ -f "$target_file" ]; then
            # 서비스 언로드
            launchctl unload "$target_file" 2>/dev/null || true
            log_info "Unloaded $plist"

            # 파일 삭제
            rm "$target_file"
            log_info "Removed $target_file"
        else
            log_warn "$plist not found, skipping..."
        fi
    done

    echo ""
    log_info "Uninstallation complete!"
    echo ""
}

# 메인
case "${1:-install}" in
    --uninstall|-u|uninstall)
        uninstall_launchd
        ;;
    install|*)
        install_launchd
        ;;
esac
