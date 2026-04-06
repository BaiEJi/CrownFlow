#!/bin/bash

# CrownFlow Backend Service - Stop Script
# 停止后端服务

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
PID_FILE="$BACKEND_DIR/.crownflow.pid"

# 检查PID文件是否存在
if [ ! -f "$PID_FILE" ]; then
    echo "❌ CrownFlow service is not running (no PID file found)"
    exit 1
fi

# 读取PID
PID=$(cat "$PID_FILE")

# 检查进程是否存在
if ! ps -p "$PID" > /dev/null 2>&1; then
    echo "⚠️  CrownFlow service is not running (stale PID file)"
    rm -f "$PID_FILE"
    exit 1
fi

echo "🛑 Stopping CrownFlow service (PID: $PID)..."

# 发送TERM信号
kill "$PID"

# 等待进程结束
TIMEOUT=10
for i in $(seq 1 $TIMEOUT); do
    if ! ps -p "$PID" > /dev/null 2>&1; then
        break
    fi
    sleep 1
done

# 如果进程还在运行，强制杀死
if ps -p "$PID" > /dev/null 2>&1; then
    echo "⚠️  Service didn't stop gracefully, force killing..."
    kill -9 "$PID"
    sleep 1
fi

# 清理PID文件
rm -f "$PID_FILE"

echo "✅ CrownFlow service stopped successfully!"