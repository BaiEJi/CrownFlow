#!/bin/bash

# CrownFlow Frontend Service - Status Script
# 查看前端服务状态

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(dirname "$SCRIPT_DIR")"
PID_FILE="$FRONTEND_DIR/.vite.pid"
LOG_FILE="$FRONTEND_DIR/logs/vite.log"

echo "📊 CrownFlow Frontend Service Status"
echo "======================================"
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
echo "Port: 60001"
echo "URL: http://localhost:60001"
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
echo "  - Stop service: ./frontend/shell/stop.sh"
echo "  - Restart service: ./frontend/shell/restart.sh"
