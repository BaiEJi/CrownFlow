#!/bin/bash

# CrownFlow Backend Service - Start Script
# 启动后端服务，支持后台运行

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
PID_FILE="$BACKEND_DIR/.crownflow.pid"
LOG_FILE="$BACKEND_DIR/logs/crownflow.log"

# 创建必要目录
mkdir -p "$BACKEND_DIR/logs"
mkdir -p "$BACKEND_DIR/data"

# 检查服务是否已运行
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "❌ CrownFlow service is already running (PID: $PID)"
        exit 1
    else
        echo "⚠️  Stale PID file found, cleaning up..."
        rm -f "$PID_FILE"
    fi
fi

echo "🚀 Starting CrownFlow backend service..."

# 激活conda环境
echo "Activating conda environment: web"
source "$(conda info --base)/etc/profile.d/conda.sh"
conda activate web

# 切换到后端目录
cd "$BACKEND_DIR"

# 启动服务
nohup python -m app.main > "$LOG_FILE" 2>&1 &
PID=$!
disown $PID

# 保存PID
echo "$PID" > "$PID_FILE"

# 等待服务启动
sleep 2

# 检查服务是否成功启动
if ps -p "$PID" > /dev/null 2>&1; then
    echo "✅ CrownFlow service started successfully!"
    echo "   PID: $PID"
    echo "   Port: 60000"
    echo "   Log: $LOG_FILE"
    echo ""
    echo "Useful commands:"
    echo "  - Check status: ./backend/shell/status.sh"
    echo "  - View logs: tail -f $LOG_FILE"
    echo "  - Stop service: ./backend/shell/stop.sh"
else
    echo "❌ Failed to start CrownFlow service"
    echo "Check logs at: $LOG_FILE"
    rm -f "$PID_FILE"
    exit 1
fi