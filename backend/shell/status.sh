#!/bin/bash

# CrownFlow Backend Service - Status Script
# 查看后端服务状态

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
PID_FILE="$BACKEND_DIR/.crownflow.pid"
LOG_FILE="$BACKEND_DIR/logs/crownflow.log"

echo "📊 CrownFlow Service Status"
echo "=============================="
echo ""

# 检查PID文件
if [ ! -f "$PID_FILE" ]; then
    echo "Status: ❌ Not running (no PID file)"
    exit 0
fi

# 读取PID
PID=$(cat "$PID_FILE")

# 检查进程是否存在
if ! ps -p "$PID" > /dev/null 2>&1; then
    echo "Status: ❌ Not running (stale PID file)"
    rm -f "$PID_FILE"
    exit 0
fi

# 获取进程信息
echo "Status: ✅ Running"
echo "PID: $PID"
echo "Port: 60000"
echo ""

# 显示进程详情
echo "Process Info:"
ps -fp "$PID" | tail -n +1
echo ""

# 显示最近的日志
if [ -f "$LOG_FILE" ]; then
    echo "Recent Logs (last 10 lines):"
    echo "------------------------------"
    tail -n 10 "$LOG_FILE"
fi

echo ""
echo "Useful Commands:"
echo "  - View full log: tail -f $LOG_FILE"
echo "  - Stop service: ./backend/shell/stop.sh"
echo "  - Restart service: ./backend/shell/restart.sh"